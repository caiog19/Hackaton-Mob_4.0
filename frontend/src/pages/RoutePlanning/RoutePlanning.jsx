import React, { useState, useEffect, useCallback } from "react"; 
import { useNavigate } from "react-router-dom";
import "./RoutePlanning.css";
import LocationInput from "../../components/LocationInput/LocationInput";
import api from "../../services/api";

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const FavoriteIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 5.25C5 4.95431 5.17647 4.67647 5.43905 4.52259C5.70163 4.36872 6.02324 4.36872 6.28582 4.52259L12 7.82051L17.7142 4.52259C17.9768 4.36872 18.2984 4.36872 18.561 4.52259C18.8235 4.67647 19 4.95431 19 5.25V18C19 18.5523 18.5523 19 18 19H6C5.44772 19 5 18.5523 5 18V5.25Z" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const BusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 6C8 4.89543 8.89543 4 10 4H14C15.1046 4 16 4.89543 16 6V18H8V6Z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 18H5" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 21C7.55228 21 8 20.5523 8 20C8 19.4477 7.55228 19 7 19C6.44772 19 6 19.4477 6 20C6 20.5523 6.44772 21 7 21Z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 21C17.5523 21 18 20.5523 18 20C18 19.4477 17.5523 19 17 19C16.4477 19 16 19.4477 16 20C16 20.5523 16.4477 21 17 21Z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const WalkIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 5.5C13 6.32843 12.3284 7 11.5 7C10.6716 7 10 6.32843 10 5.5C10 4.67157 10.6716 4 11.5 4C12.3284 4 13 4.67157 13 5.5Z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 20L7 13L11.5 11" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 20L17 13L12.5 11" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function RoutePlanning() {
  const nav = useNavigate();
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [suggestedRoutes, setSuggestedRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFindingBus, setIsFindingBus] = useState(false);
  const [initialOriginDescription, setInitialOriginDescription] = useState("Definir local de partida");
  const [error, setError] = useState(""); 

  useEffect(() => {
    if (!navigator.geolocation) {
      setInitialOriginDescription("Geolocalização não suportada");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setOrigin({ description: "Sua localização atual", coords });
        setInitialOriginDescription("Sua localização atual");
      },
      () => {
        setInitialOriginDescription("Permissão de localização negada");
      }
    );
  }, []); 

  const fetchRoutes = useCallback(async () => {
    if (!origin?.coords || !destination?.coords) return;
    
    setIsLoading(true);
    setError(""); 
    try {
      const { data } = await api.post("/routes/plan", {
        origin: origin.coords,
        destination: destination.coords,
      });
      setSuggestedRoutes(data.routes || []);
      if (!data.routes || data.routes.length === 0) {
        setError("Nenhuma rota de ônibus encontrada para este destino.");
      }
    } catch (err) {
      console.error("Erro ao buscar rotas:", err);
      setError("Falha ao buscar rotas. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, [origin, destination]); 

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const handleRouteSelect = async (route) => {
    if (!origin?.coords || !route.line) {
      setError("Não é possível rastrear: origem desconhecida ou linha de ônibus inválida.");
      return;
    }

    setIsFindingBus(true);
    setError("");
    try {
      const { data } = await api.get("/rio/buses/closest", {
        params: {
          line: route.line,
          lat: origin.coords.lat,
          lng: origin.coords.lng,
        },
      });

      if (data.vehicle) {
        nav("/home", { state: { trackOrdem: data.vehicle.ordem } });
      } else {
        setError(`Nenhum ônibus da linha ${route.line} encontrado próximo a você.`);
      }
    } catch (err) {
      console.error("Erro ao buscar ônibus mais próximo:", err);
      setError("Falha ao encontrar o ônibus mais próximo. Tente novamente.");
    } finally {
      setIsFindingBus(false);
    }
  };

  return (
    <div className="route-planning-container">
      <div className="rp-header">
        <button onClick={() => nav("/home")} className="rp-back-btn">
          <BackIcon />
        </button>
        <div className="rp-inputs">
          <LocationInput onSelect={setOrigin} initialValue={initialOriginDescription} placeholder="Local de partida" />
          <LocationInput onSelect={setDestination} placeholder="Para onde vamos?" />
        </div>
        <div className="rp-favorites">
          <button> <FavoriteIcon /> Casa </button>
        </div>
      </div>

      <div className="rp-routes-list">
        <h2>Rotas sugeridas</h2>
        {(isLoading || isFindingBus) && <p>{isFindingBus ? 'Encontrando o ônibus mais próximo...' : 'Buscando rotas...'}</p>}
        
        {error && <p className="rp-error-message">{error}</p>}
        
        {!isLoading && !error && suggestedRoutes.map((route) => (
          <div key={route.id} className="rp-route-card" onClick={() => handleRouteSelect(route)}>
            <div className="rp-route-info">
              <span className="rp-duration">{route.duration}</span>
              <span className="rp-arrival">Ônibus chegando em {route.arrival || "N/A"}</span>
              <div className="rp-path">
                <BusIcon /> <span className="rp-line">{route.line}</span> {" >"}
                <WalkIcon />
              </div>
            </div>
            <div className="rp-arrow"></div>
          </div>
        ))}
      </div>
    </div>
  );
}