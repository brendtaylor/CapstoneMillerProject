import axios from "axios";

// This is the base URL for your backend API
// The port 3000 matches your docker-compose.yml file
const API_BASE_URL = "http://localhost:3000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// We can also export the base URL itself if we need it for
// non-axios requests, like image sources.
export { API_BASE_URL };