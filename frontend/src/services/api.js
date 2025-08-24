import axios from "axios";

const fallbackProd = "https://hackaton-mob-4-0-back.onrender.com";
const fallbackDev = "http://localhost:3001";

const base =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  (import.meta.env.DEV ? fallbackDev : fallbackProd);

//export const API_BASE = `${base}/api`;
//const api = axios.create({ baseURL: API_BASE });

export const API_BASE = `${base}/api`;
export const SERVER_BASE = base; 
const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
