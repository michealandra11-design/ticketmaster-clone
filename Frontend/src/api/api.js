// src/api/api.js
import axios from "axios";

// Create an Axios instance with default settings (base URL, headers, etc.)
// VITE_API_URL is set at build/deploy time; falls back to localhost for local dev.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
