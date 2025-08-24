import React, { useEffect, useRef, useState } from 'react';
import { GoogleMap, MarkerF, PolylineF } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Map() {
  const [center, setCenter] = useState({ lat: -22.9068, lng: -43.1729 });
  const [destination, setDestination] = useState(null);

  const [ordem, setOrdem] = useState('B28598');   
  const [tracked, setTracked] = useState(null);   
  const [trail, setTrail] = useState([]);        
  const [tracking, setTracking] = useState(false);
  const esRef = useRef(null);

  const nav = useNavigate();

  const {
    ready, value, suggestions: { status, data }, setValue, clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: { location: { lat: () => center.lat, lng: () => center.lng }, radius: 200 * 1000 },
    debounce: 300,
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => console.log('Usuário não permitiu acesso à localização.')
    );
  }, []);

  const handleSelect = async (address) => {
    setValue(address, false); clearSuggestions();
    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      setDestination({ lat, lng }); setCenter({ lat, lng });
    } catch (e) { console.log('Erro ao buscar coordenadas:', e); }
  };

  async function findByOrdem() {
    try {
      const r = await api.get(`/rio/bus`, { params: { ordem: ordem.trim().toUpperCase() } });
      const v = r.data?.vehicle;
      if (!v) { setTracked(null); setTrail([]); return; }
      setTracked(v);
      setCenter({ lat: v.lat, lng: v.lng });
      setTrail((prev) => [...prev, { lat: v.lat, lng: v.lng }].slice(-200));
    } catch (e) {
      console.error('Falha ao buscar por ordem:', e);
    }
  }

  useEffect(() => {
    if (!tracking || !ordem) return;
    if (esRef.current) { esRef.current.close(); esRef.current = null; }

    const sseBase = api.defaults.baseURL.replace(/\/$/, ''); 
    const url = `${sseBase}/rio/track/${encodeURIComponent(ordem.trim().toUpperCase())}?interval=5000`;

    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        const v = payload?.vehicle;
        if (!v) return; 
        setTracked(v);
        const p = { lat: v.lat, lng: v.lng };
        setCenter(p);
        setTrail((prev) => {
          const last = prev[prev.length - 1];
          if (!last || last.lat !== p.lat || last.lng !== p.lng) return [...prev, p].slice(-200);
          return prev;
        });
      } catch {}
    };

    es.onerror = (err) => console.warn('SSE error', err);
    return () => { es.close(); esRef.current = null; };
  }, [tracking, ordem]);

  return (
    <>
      <div className="search-bar-container" onClick={() => nav('/plan-route')}>
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
        <input type="text" placeholder="Digite um destino" className="search-input"
               value={value} onChange={(e) => setValue(e.target.value)} disabled={!ready}/>
        {status === 'OK' && (
          <ul className="suggestions-list">
            {data.map(({ place_id, description }) => (
              <li key={place_id} onClick={() => handleSelect(description)}>{description}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="bus-filter-container" style={{ display:'flex', gap:8, alignItems:'center' }}>
        <input
          className="bus-filter-input"
          placeholder="Ordem do ônibus (ex.: C51550)"
          value={ordem}
          onChange={(e) => setOrdem(e.target.value.toUpperCase())}
        />
        <button className="btn" onClick={findByOrdem}>Procurar</button>
        {!tracking
          ? <button className="btn" onClick={() => setTracking(true)}>Seguir</button>
          : <button className="btn" onClick={() => { setTracking(false); if (esRef.current) esRef.current.close(); }}>Parar</button>}
        {tracked
          ? <span className="bus-feed-meta">ordem {tracked.ordem} • linha {tracked.linha} • {tracked.velocidade} km/h</span>
          : null}
      </div>

      <GoogleMap mapContainerClassName="map-container" center={center} zoom={15} options={{ disableDefaultUI: true }}>
        <MarkerF position={center} />
        {destination && <MarkerF position={destination} icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }} />}

        {tracked && (
          <>
            <MarkerF
              position={{ lat: tracked.lat, lng: tracked.lng }}
              title={`Ordem ${tracked.ordem} • Linha ${tracked.linha}`}
              icon={{ url: 'https://maps.google.com/mapfiles/kml/shapes/bus.png' }}
            />
            {trail.length > 1 && <PolylineF path={trail} options={{ strokeOpacity: 0.8, strokeWeight: 4 }} />}
          </>
        )}
      </GoogleMap>
    </>
  );
}
