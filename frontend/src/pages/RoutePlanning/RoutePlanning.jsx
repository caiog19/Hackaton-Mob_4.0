import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./RoutePlanning.css";
import LocationInput from "../../components/LocationInput/LocationInput";
import api from "../../services/api";

import { IoArrowBackOutline } from "react-icons/io5";
import { AiFillStar } from "react-icons/ai";
import { FaBusAlt } from "react-icons/fa";
import { GiWalk } from "react-icons/gi";
import { MdArrowForward } from "react-icons/md";

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
         <IoArrowBackOutline color="white" size={24} />
       </button>
       <div className="rp-inputs">
         <LocationInput onSelect={setOrigin} initialValue={initialOriginDescription} placeholder="Local de partida" />
         <LocationInput onSelect={setDestination} placeholder="Para onde vamos?" />
       </div>
       <div className="rp-favorites">
         <button> <AiFillStar color="white" size={24} /> Casa </button>
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
             <span className="rp-arrival">Você chegará: {route.arrival || "N/A"}</span>
             <div className="rp-path">
               <FaBusAlt color="#333" size={20} /> <span className="rp-line">{route.line}</span> {" >"}
               <GiWalk color="#333" size={20} />
             </div>
           </div>
           <div className="rp-arrow">
             <MdArrowForward color="#333" size={24} />
           </div>
         </div>
       ))}
     </div>
   </div>
 );
}