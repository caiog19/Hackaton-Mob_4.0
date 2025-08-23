import React, { useState, useEffect } from 'react';
import { GoogleMap, MarkerF } from '@react-google-maps/api';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import { useNavigate } from 'react-router-dom';

export default function Map() {
  const [center, setCenter] = useState({ lat: -22.9068, lng: -43.1729 });
  const [destination, setDestination] = useState(null);
  const nav = useNavigate();

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      location: { lat: () => center.lat, lng: () => center.lng },
      radius: 200 * 1000,
    },
    debounce: 300, 
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => console.log('Usuário não permitiu acesso à localização.')
    );
  }, []);

  const handleSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      setDestination({ lat, lng });
      setCenter({ lat, lng });
    } catch (error) {
      console.log('😱 Erro ao buscar coordenadas: ', error);
    }
  };

  return (
    <>
      <div className="search-bar-container" onClick={() => nav('/plan-route')}>
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
        <input
          type="text"
          placeholder="Digite um destino"
          className="search-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={!ready}
        />
        {status === 'OK' && (
          <ul className="suggestions-list">
            {data.map(({ place_id, description }) => (
              <li key={place_id} onClick={() => handleSelect(description)}>
                {description}
              </li>
            ))}
          </ul>
        )}
      </div>

      <GoogleMap
        mapContainerClassName="map-container"
        center={center}
        zoom={15}
        options={{
          disableDefaultUI: true,
        }}
      >
        <MarkerF position={center} />
        {destination && <MarkerF position={destination} icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }} />}
      </GoogleMap>
    </>
  );
}