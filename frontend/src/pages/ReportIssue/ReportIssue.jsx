import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LocationInput from "../../components/LocationInput/LocationInput";
import api from "../../services/api";
import "./ReportIssue.css";
import logo from "../../assets/logo_ixplana.png";
import {
  FaArrowLeft,
  FaCarCrash,
  FaRoad,
  FaLightbulb,
  FaCloudShowersHeavy,
  FaBus,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { GiPoliceOfficerHead } from "react-icons/gi";
const types = [
  { key: "Acidente", label: "Acidente", icon: <FaCarCrash size={20} /> },
  {
    key: "Operação policial",
    label: "Operação policial",
    icon: <GiPoliceOfficerHead size={20} />,
  },
  { key: "Buraco na via", label: "Buraco na via", icon: <FaRoad size={20} /> },
  {
    key: "Falta de iluminação",
    label: "Falta de iluminação",
    icon: <FaLightbulb size={20} />,
  },
  {
    key: "Alagamento",
    label: "Alagamento",
    icon: <FaCloudShowersHeavy size={20} />,
  },
  {
    key: "Problema com ônibus",
    label: "Problema com ônibus",
    icon: <FaBus size={20} />,
  },
];
async function compressImage(
  file,
  {
    maxWidth = 1600,
    maxHeight = 1600,
    mimeType = "image/webp",
    quality = 0.8,
  } = {}
) {
  const makeImage = async () => {
    if ("createImageBitmap" in window) {
      try {
        return await createImageBitmap(file);
      } catch {}
    }
    const url = URL.createObjectURL(file);
    const img = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = url;
    });
    URL.revokeObjectURL(url);
    return img;
  };
  const src = await makeImage();
  const sw = src.width,
    sh = src.height;
  const ratio = Math.min(1, maxWidth / sw, maxHeight / sh);
  const w = Math.round(sw * ratio),
    h = Math.round(sh * ratio);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: false });
  ctx.drawImage(src, 0, 0, w, h);
  const toBlob = (q) => new Promise((r) => canvas.toBlob(r, mimeType, q));
  const fallbackDataURLtoBlob = (q) => {
    const dataURL = canvas.toDataURL(mimeType, q);
    const byteString = atob(dataURL.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++)
      ia[i] = byteString.charCodeAt(i);
    return new Blob([ab], { type: mimeType });
  };
  let q = quality;
  let blob = await toBlob(q);
  if (!blob) blob = fallbackDataURLtoBlob(q);
  while (blob && blob.size > 1.5 * 1024 * 1024 && q > 0.5) {
    q -= 0.1;
    blob = (await toBlob(q)) || fallbackDataURLtoBlob(q);
  }
  if (src.close) src.close();
  const name = (file.name.replace(/\.\w+$/, "") || "photo") + ".webp";
  return new File([blob], name, { type: mimeType, lastModified: Date.now() });
}
export default function ReportIssue() {
  const nav = useNavigate();
  const [selectedType, setSelectedType] = useState(types[0].key);
  const [description, setDescription] = useState("");
  const [busLine, setBusLine] = useState("");
  const [coords, setCoords] = useState(null);
  const [autoLoc, setAutoLoc] = useState(true);
  const [manualPlace, setManualPlace] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);
  useEffect(() => {
    if (!autoLoc) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      () => setErr("Não foi possível obter sua localização automática.")
    );
  }, [autoLoc]);
  function onSelectPlace(p) {
    setManualPlace(p);
    setCoords({ latitude: p.coords.lat, longitude: p.coords.lng });
  }
  async function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) {
      if (preview) URL.revokeObjectURL(preview);
      setPhoto(null);
      setPreview("");
      return;
    }
    let final = f;
    try {
      if (f.size > 1024 * 1024) {
        final = await compressImage(f);
      }
    } catch {
      final = f;
    }
    if (preview) URL.revokeObjectURL(preview);
    const url = URL.createObjectURL(final);
    setPreview(url);
    setPhoto(final);
  }
  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setOk("");
    if (!coords) {
      setErr("Defina a localização (automática ou manual).");
      return;
    }
    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("type", selectedType);
      if (description) fd.append("description", description);
      if (busLine) fd.append("busLine", busLine);
      fd.append("location", JSON.stringify(coords));
      if (photo) fd.append("photo", photo);
      await api.post("/reports", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setOk("Relato enviado com sucesso!");
      setTimeout(() => nav("/home"), 800);
    } catch (error) {
      setErr(error?.response?.data?.error || "Falha ao enviar relato.");
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <div className="report-page">
      <header className="report-header">
        <button
          className="back-btn"
          onClick={() => nav(-1)}
          aria-label="Voltar"
        >
          <FaArrowLeft />
        </button>
        <img src={logo} alt="XplanaBus Logo" className="logo" />
      </header>
      
      <h1 className="page-title">Relatar problema na rota</h1>
      <form className="report-card" onSubmit={onSubmit}>
        <h2>Tipo de ocorrência</h2>
        <div className="type-grid">
          {types.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`type-btn ${selectedType === t.key ? "active" : ""}`}
              onClick={() => setSelectedType(t.key)}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
        <div className="loc-block-custom">
          <FaMapMarkerAlt color="#ffd100" size={20} />
          <label className="loc-toggle">
            <input
              type="checkbox"
              checked={autoLoc}
              onChange={(e) => setAutoLoc(e.target.checked)}
            />
            <span>Localização automática</span>
          </label>
        </div>
        {!autoLoc && (
          <div style={{ marginTop: 8, marginBottom: 8 }}>
            <LocationInput
              onSelect={onSelectPlace}
              placeholder="Pesquisar endereço"
            />
          </div>
        )}
        <label className="field">
          <span>Descrição (opcional)</span>
          <input
            className="input"
            placeholder="Descreva o ocorrido"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Linha de ônibus (opcional)</span>
          <input
            className="input"
            placeholder="Ex: 474"
            value={busLine}
            onChange={(e) => setBusLine(e.target.value)}
          />
        </label>
        <div className="photo-block">
          <span className="photo-label">Foto (opcional)</span>
          <div className="photo-row">
            <label className="btn-secondary">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={onFile}
                hidden
              />
              Tirar/Selecionar foto
            </label>
            {preview && (
              <button
                type="button"
                className="btn-link"
                onClick={() => {
                  if (preview) URL.revokeObjectURL(preview);
                  setPhoto(null);
                  setPreview("");
                }}
              >
                Remover
              </button>
            )}
          </div>
          {preview && (
            <img
              src={preview}
              alt="Pré-visualização"
              className="photo-preview"
            />
          )}
        </div>
        {err && <p className="error">{err}</p>}
        {ok && <p className="success">{ok}</p>}
        <button className="btn-primary" disabled={submitting}>
          {submitting ? "Enviando..." : "Enviar Relato"}
        </button>
      </form>
    </div>
  );
}
