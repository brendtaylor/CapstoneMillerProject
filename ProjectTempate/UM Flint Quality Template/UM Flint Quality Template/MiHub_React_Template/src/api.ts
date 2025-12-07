// ProjectTempate/UM Flint Quality Template/UM Flint Quality Template/MiHub_React_Template/src/api.ts
import axios from "axios";

// This is the base URL for your backend API
const API_BASE_URL = "http://localhost:3000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
// Automatically attaches the token to every request made using 'api'
api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem("token");
    if (token) {
      // Ensure headers object exists
      if (!config.headers) {
        config.headers = {}; 
      }
      // Assign token safely
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { API_BASE_URL };