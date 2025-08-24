import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SideNav.css';
import logo from '../../assets/logo_ixplana.png';

const Item = ({ icon, label, onClick }) => (
  <li className="sidenav-item" onClick={onClick}>
    <span className="sidenav-icon" aria-hidden="true">{icon}</span>
    <span className="sidenav-label">{label}</span>
  </li>
);

export default function SideNav({ open, onClose }) {
  const nav = useNavigate();

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && open) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div
      className={`sidenav-overlay ${open ? 'open' : ''}`}
      onClick={onClose}
      aria-hidden={!open}
    >
      <aside
        className={`sidenav ${open ? 'open' : ''}`}
        onClick={(e) => e.stopPropagation()}
        aria-label="Menu lateral"
      >
        <div className="sidenav-header">
          <img src={logo} alt="iXplanabus" className="sidenav-logo" />
        </div>

        <ul className="sidenav-list">

          <Item
            label="Início"
            onClick={() => { nav('/'); onClose(); }}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            }
          />

          <Item
            label="Minhas Viagens"
            onClick={() => { nav('/'); onClose(); }}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 3v4M8 3v4M3 11h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            }
          />
          <Item
            label="Meu relatos"
            onClick={() => { nav('/'); onClose(); }}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M16 14a4 4 0 1 1-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M3 20c1.5-3 4.5-5 9-5s7.5 2 9 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            }
          />
          <Item
            label="Linhas de ônibus"
            onClick={() => { nav('/'); onClose(); }}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="6" y="3" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M6 13h12M7 20h2M15 20h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            }
          />
          <Item
            label="Comunidade"
            onClick={() => { nav('/community'); onClose(); }}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="7" r="3.5" stroke="currentColor" strokeWidth="2"/>
              </svg>
            }
          />

        </ul>

        <div className="sidenav-divider" />

        <ul className="sidenav-list">
          <Item
            label="Google Play"
            onClick={() => { window.open('https://play.google.com/', '_blank'); onClose(); }}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M3 2l15 10L3 22V2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            }
          />
          <Item
            label="Como podemos melhorar?"
            onClick={() => { nav('/'); onClose(); }}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16M4 12h12M4 18h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            }
          />
        </ul>
      </aside>
    </div>
  );
}
