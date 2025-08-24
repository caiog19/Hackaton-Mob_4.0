import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useLoadScript } from "@react-google-maps/api";

import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import Home from "./pages/Home/Home";
import RoutePlanning from "./pages/RoutePlanning/RoutePlanning";
import ReportIssue from "./pages/ReportIssue/ReportIssue";
import Community from "./pages/Community/Community";

const libraries = ["places"];

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  if (loadError) return <div>Erro ao carregar dependências do mapa.</div>;
  if (!isLoaded) return <div>Carregando Aplicação...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/plan-route"
          element={
            <PrivateRoute>
              <RoutePlanning />
            </PrivateRoute>
          }
        />
        +{" "}
        <Route
          path="/report"
          element={
            <PrivateRoute>
              <ReportIssue />
            </PrivateRoute>
          }
        />
        <Route
          path="/community"
          element={
            <PrivateRoute>
              <Community />
            </PrivateRoute>
          }
        />
        <Route
          path="*"
          element={
            <div style={{ padding: 24 }}>404 - Página não encontrada</div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
