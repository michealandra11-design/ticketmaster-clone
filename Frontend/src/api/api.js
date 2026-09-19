// src/api/api.js
import axios from "axios";

// Create an Axios instance with default settings (base URL, headers, etc.)
// VITE_API_URL is set at build/deploy time; falls back to localhost for local dev.
// Timeout is generous (30s) because the backend runs on Render's free tier,
// which sleeps after inactivity and can take up to ~50s to wake on the next
// request — a short timeout here would misreport that delay as a failure.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
