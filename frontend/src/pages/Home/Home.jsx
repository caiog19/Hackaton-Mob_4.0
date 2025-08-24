import React from "react";
import { useNavigate } from "react-router-dom";
import { useLoadScript } from "@react-google-maps/api";
import { FaBars, FaBullhorn } from 'react-icons/fa';
import { FiClock } from 'react-icons/fi'; 
import Map from "../../components/Map";
import "./Home.css";
import SideNav from "../../components/SideNav/SideNav";

import logo from "../../assets/logo_ixplana.png";

const libraries = ["places"];

export default function Home() {
  const nav = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/login");
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <button className="menu-btn" onClick={() => setMenuOpen(true)}>
          <FaBars size={24} color="#FFFFFF" />
        </button>

        <img src={logo} alt="iXplanabus Logo" className="header-logo" />
        <button onClick={logout} className="logout-btn">
          Sair
        </button>
      </header>
      <SideNav open={menuOpen} onClose={() => setMenuOpen(false)} />
      <Map />

      <div className="bottom-bar">
        <div className="ixplanar-info">
          <button className="speaker-btn" onClick={() => nav("/report")}>
            <FaBullhorn size={22} color="#FFFFFF" />
          </button>
          <span>iXplanar</span>
        </div>
        <div className="route-info">
          <span className="time-info">
            <FiClock size={20} color="#333" style={{ marginRight: '6px' }} />
            25 min
          </span>
          <button className="alternative-route-btn">
            Ver trajeto alternativo
          </button>
        </div>
      </div>
    </div>
  );
}