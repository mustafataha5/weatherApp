import axios from "axios";

// Use environment variable for API base URL (Vite syntax)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_LOCATIONS || "http://localhost:5000/api/locations";

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  // Uncomment if backend uses cookies/sessions
  // withCredentials: true,
});

// -------------------- Location Endpoints -------------------- //

// Get all locations
export const getLocations = () => api.get("/");

// Get a single location by ID
export const getLocation = (id) => api.get(`/${id}`);

// Create a new location
export const createLocation = (data) => api.post("/", data);

// Update location by ID
export const updateLocation = (id, data) => api.patch(`/${id}`, data);

// Delete location by ID
export const deleteLocation = (id) => api.delete(`/${id}`);
