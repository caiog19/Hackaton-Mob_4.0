const express = require('express');
const router = express.Router();
const axios = require('axios');
const https = require('https');

const { parser } = require('stream-json');
const { streamArray } = require('stream-json/streamers/StreamArray');

const SRC = 'https://dados.mobilidade.rio/gps/sppo';
const agent = new https.Agent({ keepAlive: true });

const AXIOS_LIMIT = 20 * 1024 * 1024; 

const toFloat = (s) => (typeof s === 'string' ? parseFloat(String(s).replace(',', '.')) : s);
const toISO = (ms) => new Date(Number(ms)).toISOString();

function normalize(raw) {
  return raw.map((v) => ({
    ordem: v.ordem,
    linha: v.linha,
    lat: toFloat(v.latitude),
    lng: toFloat(v.longitude),
    velocidade: Number(v.velocidade),
    datahoraMs: Number(v.datahora),
    datahoraISO: toISO(v.datahora),
  }));
}

const TTL_MS   = 10_000;  
const STALE_MS = 60_000;  

let CACHE = { data: null, ts: 0 };
let INFLIGHT = null;

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchUpstreamWithRetry() {
  let attempt = 0;
  const max = 3;
  while (true) {
    try {
      const resp = await axios.get(SRC, {
        timeout: 12_000,
        httpsAgent: agent,
        responseType: 'stream',
        headers: {
          'User-Agent': 'HackatonMob/1.0',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate, br',
        },
        maxContentLength: AXIOS_LIMIT,
        maxBodyLength: AXIOS_LIMIT,
        decompress: true,
      });

      const out = [];
      const streamer = resp.data.pipe(parser()).pipe(streamArray());

      for await (const { value } of streamer) {
        out.push({
          ordem: value.ordem,
          linha: value.linha,
          lat: toFloat(value.latitude),
          lng: toFloat(value.longitude),
          velocidade: Number(value.velocidade),
          datahoraMs: Number(value.datahora),
          datahoraISO: toISO(value.datahora),
        });
      }

      CACHE = { data: out, ts: Date.now() };

      const mu = process.memoryUsage();
      console.log(
        '[rio] fetch ok;',
        'heapUsed=', Math.round(mu.heapUsed / 1024 / 1024), 'MB,',
        'vehicles=', out.length
      );

      return CACHE.data;
    } catch (e) {
      attempt++;
      const status = e.response?.status;
      const retriable =
        attempt < max &&
        (status === 429 || (status >= 500 && status <= 599) || e.code === 'ECONNABORTED');

      if (!retriable) throw e;

      const retryAfter = Number(e.response?.headers?.['retry-after']);
      const waitMs = Number.isFinite(retryAfter)
        ? retryAfter * 1000
        : 400 * 2 ** (attempt - 1) + Math.floor(Math.random() * 200);

      console.warn(`[rio] upstream falhou (tentativa ${attempt}/${max}) - aguardando ${waitMs}ms`);
      await delay(waitMs);
    }
  }
}

async function getDataSingleFlight() {
  const now = Date.now();
  if (CACHE.data && now - CACHE.ts <= TTL_MS) {
    return { data: CACHE.data, stale: false };
  }
  if (INFLIGHT) {
    return { data: await INFLIGHT, stale: false };
  }
  INFLIGHT = (async () => {
    try {
      return await fetchUpstreamWithRetry();
    } finally {
      INFLIGHT = null;
    }
  })();

  return { data: await INFLIGHT, stale: false };
}

router.get('/buses', async (req, res) => {
  try {
    const { line, bbox } = req.query;

    let data;
    try {
      const out = await getDataSingleFlight();
      data = out.data;
    } catch (e) {
      const age = Date.now() - CACHE.ts;
      if (!CACHE.data || age > STALE_MS) {
        console.error('rio/buses error:', e.message);
        return res.status(502).json({ error: 'Falha ao obter dados da API da Prefeitura' });
      }
      data = CACHE.data;
    }

    const wanted = line ? String(line).trim() : null;
    const box = bbox ? bbox.split(',').map(Number) : null;
    const seen = new Set();
    const arr = [];

    for (const v of data) {
      if (wanted && v.linha !== wanted) continue;

      if (box) {
        const [minLng, minLat, maxLng, maxLat] = box;
        if (!(v.lat >= minLat && v.lat <= maxLat && v.lng >= minLng && v.lng <= maxLng)) continue;
      }

      if (seen.has(v.ordem)) continue;
      seen.add(v.ordem);
      arr.push(v);
    }

    res.json({ updatedAt: new Date(CACHE.ts).toISOString(), count: arr.length, vehicles: arr });
  } catch (e) {
    console.error('rio/buses fatal:', e);
    res.status(502).json({ error: 'Falha ao obter dados da API da Prefeitura' });
  }
});


router.get('/bus', async (req, res) => {
  try {
    const ordem = String(req.query.ordem || '').trim().toUpperCase();
    if (!ordem) return res.status(400).json({ error: 'Parâmetro "ordem" obrigatório' });

    const { data } = await getDataSingleFlight();
    const bus = data.find((v) => v.ordem === ordem);
    if (!bus) return res.status(404).json({ error: 'Veículo não encontrado' });

    res.json({ updatedAt: new Date(CACHE.ts).toISOString(), vehicle: bus });
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
  if (res.flushHeaders) res.flushHeaders();

  const write = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);
  const ping  = () => res.write(`: ping ${Date.now()}\n\n`);

  let closed = false;
  const cleanup = () => {
    if (closed) return;
    closed = true;
    clearInterval(tickId);
    clearInterval(pingId);
    clearTimeout(hardTimeout);
    try { res.end(); } catch {}
  };

  req.on('close', cleanup);
  res.on('close', cleanup);
  req.on('aborted', cleanup);
  res.on('error', cleanup);

  const hardTimeout = setTimeout(cleanup, 10 * 60 * 1000);

  async function tick() {
    if (closed) return;
    try {
      const { data } = await getDataSingleFlight();
      const bus = data.find((v) => v.ordem === ordem) || null;
      write({ ts: new Date(CACHE.ts).toISOString(), ordem, found: !!bus, vehicle: bus });
    } catch (e) {
      write({ ts: new Date().toISOString(), ordem, found: false, error: 'upstream_error' });
    }
  }

  write({ ts: new Date(CACHE.ts || Date.now()).toISOString(), ordem, hello: true });
  const tickId = setInterval(tick, interval);
  const pingId = setInterval(ping, 20_000);
  await tick();
});

function getDistanceInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function deg2rad(deg) { return deg * (Math.PI / 180); }


router.get('/buses/closest', async (req, res) => {
  try {
    const { line, lat, lng } = req.query;

    if (!line || !lat || !lng) {
      return res.status(400).json({ error: 'Parâmetros "line", "lat" e "lng" são obrigatórios' });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const wantedLine = String(line).trim();

    const { data } = await getDataSingleFlight();
    const busesOnLine = data.filter((bus) => bus.linha === wantedLine);

    if (busesOnLine.length === 0) {
      return res.status(404).json({ error: `Nenhum veículo encontrado para a linha ${wantedLine}` });
    }

    let closestBus = null;
    let minDistance = Infinity;

    for (const bus of busesOnLine) {
      const distance = getDistanceInKm(userLat, userLng, bus.lat, bus.lng);
      if (distance < minDistance) {
        minDistance = distance;
        closestBus = { ...bus, distanceInKm: minDistance };
      }
    }

    res.json({ updatedAt: new Date(CACHE.ts).toISOString(), vehicle: closestBus });
  } catch (e) {
    console.error('rio/buses/closest error:', e.message);
    res.status(502).json({ error: 'Falha ao obter dados para encontrar o ônibus mais próximo' });
  }
});

module.exports = router;
