import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import SideNav from "../../components/SideNav/SideNav";
import logo from "../../assets/logo_ixplana.png";
import "./Community.css";

const timeFilters = [
  { key: "10", label: "10 min", since: () => Date.now() - 10 * 60 * 1000 },
  { key: "30", label: "30 min", since: () => Date.now() - 30 * 60 * 1000 },
  { key: "60", label: "1 hora", since: () => Date.now() - 60 * 60 * 1000 },
  { key: "120", label: "2 horas", since: () => Date.now() - 120 * 60 * 1000 },
  { key: "today", label: "hoje", since: () => new Date(new Date().setHours(0,0,0,0)).getTime() },
  { key: "all", label: "sempre", since: () => 0 },
];

function timeAgo(dateStr) {
  const d = new Date(dateStr).getTime();
  const diff = Math.max(0, Date.now() - d) / 1000;
  if (diff < 60) return "agora";
  const m = Math.floor(diff / 60);
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h} h`;
  const days = Math.floor(h / 24);
  return days === 1 ? "ontem" : `há ${days} d`;
}

function hashCode(str) { let h = 0; for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i); return Math.abs(h); }
function pastelFromName(name = "U") { const h = hashCode(name) % 360; return `hsl(${h}, 70%, 85%)`; }
function initialFrom(name = "U") { const first = name.trim().split(/\s+/)[0] || "U"; return first[0].toUpperCase(); }

const Avatar = ({ name }) => (
  <div className="avatar" style={{ backgroundColor: pastelFromName(name) }}>
    {initialFrom(name)}
  </div>
);

function ReportThumb({ src, name, alt }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) return <Avatar name={name} />;
  return <img src={src} alt={alt} onError={() => setBroken(true)} />;
}

function ReportCard({ report }) {
  const name = report.userName || report.user?.name || "Usuário";
  return (
    <article className="report-card-comm">
      <div className="thumb">
        <ReportThumb src={report.photoUrl || null} name={name} alt={report.type} />
      </div>
      <div className="meta">
        <div className="title-row">
          <strong className="name">{name}</strong>
          {report.busLine && <span className="pill">Linha {report.busLine}</span>}
          <span className="time">{timeAgo(report.createdAt)}</span>
        </div>
        <div className="desc">
          <span className="tag">{report.type}</span>
          {report.description && <span className="text"> — {report.description}</span>}
        </div>
      </div>
    </article>
  );
}

export default function Community() {
  const nav = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [reports, setReports] = useState([]);
  const [lineQuery, setLineQuery] = useState("");
  const [filterKey, setFilterKey] = useState("today"); 

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/reports");
        if (active) setReports(data || []);
      } catch {
        setErr("Falha ao carregar relatos.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const since =
      timeFilters.find(t => t.key === filterKey)?.since()?.valueOf() ?? 0;
    return reports.filter(r => {
      const okTime = new Date(r.createdAt).getTime() >= since; 
      const okLine = lineQuery.trim()
        ? (r.busLine || "").toLowerCase().includes(lineQuery.trim().toLowerCase())
        : true;
      return okTime && okLine;
    });
  }, [reports, lineQuery, filterKey]);

  return (
    <div className="community-page">
      <header className="comm-header">
        <button
          type="button"
          className="menu-btn"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu"
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <img src={logo} alt="iXplanabus" className="comm-logo" />
        <span className="comm-spacer" aria-hidden="true" />
      </header>

      <SideNav open={menuOpen} onClose={() => setMenuOpen(false)} />

      <main className="comm-main">
        <h1 className="comm-title">COMUNIDADE</h1>

        <div className="comm-panel">
          <div className="comm-search">
            <input
              className="comm-input"
              placeholder="Filtrar por linha (ex: 363)"
              value={lineQuery}
              onChange={(e) => setLineQuery(e.target.value)}
            />
            <button className="comm-search-btn" type="button" aria-label="Pesquisar">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="#333" strokeWidth="2" />
                <path d="M20 20l-3.5-3.5" stroke="#333" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="comm-chips">
            {timeFilters.map((t) => (
              <button
                key={t.key}
                className={`chip ${filterKey === t.key ? "active" : ""}`}
                onClick={() => setFilterKey(t.key)}
                type="button"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <section className="report-list">
          {loading && <p className="muted">Carregando relatos…</p>}
          {err && <p className="error">{err}</p>}
          {!loading && !err && filtered.length === 0 && (
            <p className="muted">Nenhum relato para os filtros selecionados.</p>
          )}

          {filtered.map((r) => (
            <ReportCard key={r.id} report={r} />
          ))}
        </section>
      </main>
    </div>
  );
}
