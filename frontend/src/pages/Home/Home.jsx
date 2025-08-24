import React from "react";
import { useNavigate } from "react-router-dom";
import { useLoadScript } from "@react-google-maps/api";
import Map from "../../components/Map";
import "./Home.css";

import logo from "../../assets/logo_ixplana.png";

const libraries = ["places"];

export default function Home() {
  const nav = useNavigate();

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
        <button className="menu-btn">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
        </button>
        <img src={logo} alt="iXplanabus Logo" className="header-logo" />
        <button onClick={logout} className="logout-btn">
          Sair
        </button>
      </header>

      <Map />

      <div className="bottom-bar">
        <div className="ixplanar-info">
          <button className="speaker-btn" onClick={() => nav("/report")}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 5v14M8 9v6m8-6v6M4 9v6m16-6v6"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
          </button>
          <span>iXplanar</span>
        </div>
        <div className="route-info">
          <span className="time-info">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"
                stroke="#333"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
              <path
                d="M12 6v6l4 2"
                stroke="#333"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
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
