import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaCalendarAlt,
  FaUserFriends,
  FaBus,
  FaUsers,
  FaGooglePlay,
  FaListAlt,
} from "react-icons/fa";
import "./SideNav.css";
import logo from "../../assets/logo_ixplana.png";

const Item = ({ icon, label, onClick }) => (
  <li className="sidenav-item" onClick={onClick}>
    <span className="sidenav-icon" aria-hidden="true">
      {icon}
    </span>
    <span className="sidenav-label">{label}</span>
  </li>
);

export default function SideNav({ open, onClose }) {
  const nav = useNavigate();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const iconSize = 22;

  return (
    <div
      className={`sidenav-overlay ${open ? "open" : ""}`}
      onClick={onClose}
      aria-hidden={!open}
    >
      <aside
        className={`sidenav ${open ? "open" : ""}`}
        onClick={(e) => e.stopPropagation()}
        aria-label="Menu lateral"
      >
        <div className="sidenav-header">
          <img src={logo} alt="iXplanabus" className="sidenav-logo" />
        </div>

        <ul className="sidenav-list">
          <Item
            label="Início"
            onClick={() => {
              nav("/");
              onClose();
            }}
            icon={<FaHome size={iconSize} />}
          />
          <Item
            label="Minhas Viagens"
            onClick={() => {
              nav("/");
              onClose();
            }}
            icon={<FaCalendarAlt size={iconSize} />}
          />
          <Item
            label="Meu relatos"
            onClick={() => {
              nav("/");
              onClose();
            }}
            icon={<FaUserFriends size={iconSize} />}
          />
          <Item
            label="Linhas de ônibus"
            onClick={() => {
              nav("/");
              onClose();
            }}
            icon={<FaBus size={iconSize} />}
          />
          <Item
            label="Comunidade"
            onClick={() => {
              nav("/community");
              onClose();
            }}
            icon={<FaUsers size={iconSize} />}
          />
        </ul>

        <div className="sidenav-divider" />

        <ul className="sidenav-list">
          <Item
            label="Google Play"
            onClick={() => {
              window.open("https://play.google.com/", "_blank");
              onClose();
            }}
            icon={<FaGooglePlay size={iconSize} />}
          />
          <Item
            label="Como podemos melhorar?"
            onClick={() => {
              nav("/");
              onClose();
            }}
            icon={<FaListAlt size={iconSize} />}
          />
        </ul>
      </aside>
    </div>
  );
}
