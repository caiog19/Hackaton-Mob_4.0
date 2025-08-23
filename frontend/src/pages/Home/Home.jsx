import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useLoadScript, MarkerF } from '@react-google-maps/api';
import './Home.css'; 

import logo from '../../assets/logo_ixplana.png'; 


const libraries = ['places']; 

export default function Home() {
  const nav = useNavigate();
  const [center, setCenter] = useState({ lat: -22.9068, lng: -43.1729 }); 

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, 
    libraries,
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

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    nav('/login');
  }

  if (loadError) return "Erro ao carregar o mapa";
  if (!isLoaded) return "Carregando Mapa...";

  return (
    <div className="home-container">
      <header className="home-header">
        <button className="menu-btn">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16M4 12h16M4 18h16" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
        </button>
        <img src={logo} alt="iXplanabus Logo" className="header-logo" />
        <button onClick={logout} className="logout-btn">Sair</button> 
      </header>
      
      <div className="search-bar-container">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
        <input type="text" placeholder="Digite um destino" className="search-input" />
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
      </GoogleMap>
      
      <div className="bottom-bar">
        <div className="ixplanar-info">
          <button className="speaker-btn">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14M8 9v6m8-6v6M4 9v6m16-6v6" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
          </button>
          <span>iXplanar</span>
        </div>
        <div className="route-info">
          <span className="time-info">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M12 6v6l4 2" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
            25 min
          </span>
          <button className="alternative-route-btn">Ver trajeto alternativo</button>
        </div>
      </div>
    </div>
  );
}