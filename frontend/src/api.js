import axios from "axios";
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000" });
export function authHeader(){ const t = localStorage.getItem("token"); return t ? { Authorization: "Bearer " + t } : {}; }
export default api;