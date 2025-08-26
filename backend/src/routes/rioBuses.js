const express = require('express');
const router = express.Router();
const axios = require('axios');
const https = require('https');

const SRC = 'https://dados.mobilidade.rio/gps/sppo';
const agent = new https.Agent({ keepAlive: true });

const toFloat = (s) => {
  if (s == null) return NaN;
  if (typeof s === 'string') return parseFloat(s.replace(',', '.'));
  return Number(s);
};

const TTL_MS   = 10_000;  
const STALE_MS = 60_000;   


let CACHE = {
  ts: 0,
  byOrdem: new Map(),  
  byLine: new Map(),   
  count: 0
};

let INFLIGHT = null;

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchUpstreamWithRetry() {
  let attempt = 0;
  const max = 3;
  while (true) {
    try {
      const { data } = await axios.get(SRC, {
        timeout: 12_000,
        httpsAgent: agent,
        headers: { 'User-Agent': 'HackatonMob/1.0', Accept: 'application/json' },
      });
      return data;
    } catch (e) {
      attempt++;
      const status = e.response?.status;
      const retriable =
        attempt < max && (status === 429 || (status >= 500 && status <= 599) || e.code === 'ECONNABORTED');
      if (!retriable) throw e;
      const retryAfter = Number(e.response?.headers?.['retry-after']);
      const waitMs =
        Number.isFinite(retryAfter)
          ? retryAfter * 1000
          : 400 * 2 ** (attempt - 1) + Math.floor(Math.random() * 200);
      await delay(waitMs);
    }
  }
}

function rebuildCache(raw) {
  const byOrdem = new Map();
  const byLine  = new Map();

  for (const v of raw || []) {
    const ordem = String(v.ordem || '').trim().toUpperCase();
    if (!ordem) continue;

    const rec = {
      ordem,
      linha: String(v.linha ?? '').trim(),
      lat: toFloat(v.latitude),
      lng: toFloat(v.longitude),
      velocidade: Number(v.velocidade) || 0,
      datahoraMs: Number(v.datahora) || 0,
    };

    byOrdem.set(ordem, rec);

    if (rec.linha) {
      let arr = byLine.get(rec.linha);
      if (!arr) byLine.set(rec.linha, (arr = []));
      arr.push(rec);
    }
  }

  CACHE = {
    ts: Date.now(),
    byOrdem,
    byLine,
    count: byOrdem.size,
  };
}

async function ensureCache() {
  const now = Date.now();
  if (CACHE.count && (now - CACHE.ts) <= TTL_MS) return { cache: CACHE, stale: false };

  if (INFLIGHT) {             
    await INFLIGHT;
    return { cache: CACHE, stale: false };
  }

  INFLIGHT = (async () => {
    try {
      const raw = await fetchUpstreamWithRetry();
      rebuildCache(raw);
    } finally {
      INFLIGHT = null;
    }
  })();

  await INFLIGHT;
  return { cache: CACHE, stale: false };
}

const toClient = (rec, withISO = true) => {
  const out = {
    ordem: rec.ordem,
    linha: rec.linha,
    lat: rec.lat,
    lng: rec.lng,
    velocidade: rec.velocidade,
    datahoraMs: rec.datahoraMs,
  };
  if (withISO) out.datahoraISO = new Date(rec.datahoraMs).toISOString();
  return out;
};

function parseBbox(bboxStr) {
  if (!bboxStr) return null;
  const parts = bboxStr.split(',').map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return null;
  const [minLng, minLat, maxLng, maxLat] = parts;
  return { minLng, minLat, maxLng, maxLat };
}

function inBbox(rec, bb) {
  return rec.lat >= bb.minLat && rec.lat <= bb.maxLat && rec.lng >= bb.minLng && rec.lng <= bb.maxLng;
}

router.get('/buses', async (req, res) => {
  const withISO = req.query.iso !== '0';
  try {
    try {
      await ensureCache();
    } catch (e) {
      const age = Date.now() - CACHE.ts;
      if (!CACHE.count || age > STALE_MS) {
        console.error('rio/buses error:', e.message);
        return res.status(502).json({ error: 'Falha ao obter dados da API da Prefeitura' });
      }
    }

    const wantedLine = req.query.line ? String(req.query.line).trim() : '';
    const bb = parseBbox(req.query.bbox);

    let src;
    if (wantedLine) {
      src = CACHE.byLine.get(wantedLine) || [];
    } else {
      src = CACHE.byOrdem.values();
    }

    if (!wantedLine && !bb) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store, no-transform');
      res.write(
        `{"updatedAt":"${new Date(CACHE.ts).toISOString()}","count":${CACHE.count},"vehicles":[`
      );
      let first = true;
      for (const rec of src) {
        if (!first) res.write(',');
        first = false;
        res.write(JSON.stringify(toClient(rec, withISO)));
      }
      res.end(']}');
      return;
    }

    const out = [];
    if (Array.isArray(src)) {
      for (const rec of src) {
        if (bb && !inBbox(rec, bb)) continue;
        out.push(toClient(rec, withISO));
      }
    } else {
      for (const rec of src) {
        if (bb && !inBbox(rec, bb)) continue;
        out.push(toClient(rec, withISO));
      }
    }

    res.json({
      updatedAt: new Date(CACHE.ts).toISOString(),
      count: out.length,
      vehicles: out,
    });
  } catch (e) {
    console.error('rio/buses fatal:', e);
    res.status(502).json({ error: 'Falha ao obter dados da API da Prefeitura' });
  }
});


router.get('/bus', async (req, res) => {
  const withISO = req.query.iso !== '0';
  try {
    const ordem = String(req.query.ordem || '').trim().toUpperCase();
    if (!ordem) return res.status(400).json({ error: 'Parâmetro "ordem" obrigatório' });

    await ensureCache();
    const rec = CACHE.byOrdem.get(ordem);
    if (!rec) return res.status(404).json({ error: 'Veículo não encontrado' });

    res.json({ updatedAt: new Date(CACHE.ts).toISOString(), vehicle: toClient(rec, withISO) });
  } catch (e) {
    console.error('rio/bus error:', e.message);
    res.status(502).json({ error: 'Falha ao obter dados' });
  }
});


router.get('/track/:ordem', async (req, res) => {
  const ordem = String(req.params.ordem || '').trim().toUpperCase();
  if (!ordem) return res.status(400).end();

  const interval = Math.max(3000, Math.min(30000, Number(req.query.interval) || 5000));

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  const write = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);
  const ping  = () => res.write(`: ping ${Date.now()}\n\n`);

  let closed = false;
  const cleanup = () => { closed = true; clearInterval(tickId); clearInterval(pingId); };
  req.on('close', cleanup);
  req.on('aborted', cleanup);

  async function tick() {
    try {
      await ensureCache();
      const rec = CACHE.byOrdem.get(ordem) || null;
      write({ ts: new Date(CACHE.ts).toISOString(), ordem, found: !!rec, vehicle: rec ? toClient(rec) : null });
    } catch {
      write({ ts: new Date().toISOString(), ordem, found: false, error: 'upstream_error' });
    }
  }

  write({ ts: new Date(CACHE.ts || Date.now()).toISOString(), ordem, hello: true });
  const tickId = setInterval(() => { if (!closed) tick(); }, interval);
  const pingId = setInterval(() => { if (!closed) ping(); }, 20000);
  await tick();
});

function deg2rad(deg) { return deg * (Math.PI / 180); }
function getDistanceInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

router.get('/buses/closest', async (req, res) => {
  try {
    const { line, lat, lng } = req.query;

    if (!line || !lat || !lng) {
      return res.status(400).json({ error: 'Parâmetros "line", "lat" e "lng" são obrigatórios' });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    if (!Number.isFinite(userLat) || !Number.isFinite(userLng)) {
      return res.status(400).json({ error: 'Parâmetros "lat" e "lng" inválidos' });
    }

    await ensureCache();
    const wantedLine = String(line).trim();
    const busesOnLine = CACHE.byLine.get(wantedLine) || [];

    if (busesOnLine.length === 0) {
      return res.status(404).json({ error: `Nenhum veículo encontrado para a linha ${wantedLine}` });
    }

    let closest = null;
    let minD = Infinity;

    for (const bus of busesOnLine) {
      const d = getDistanceInKm(userLat, userLng, bus.lat, bus.lng);
      if (d < minD) { minD = d; closest = bus; }
    }

    const vehicle = Object.assign({}, toClient(closest), { distanceInKm: minD });
    res.json({ updatedAt: new Date(CACHE.ts).toISOString(), vehicle });

  } catch (e) {
    console.error('rio/buses/closest error:', e.message);
    res.status(502).json({ error: 'Falha ao obter dados para encontrar o ônibus mais próximo' });
  }
});

module.exports = router;
