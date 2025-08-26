import axios from "axios";

const API_URL = "http://localhost:5000/api/locations";

// Get all locations
export const getLocations = () => axios.get(API_URL);

// Get location by ID
export const getLocation = (id) => axios.get(`${API_URL}/${id}`);

// Create new location
export const createLocation = (data) => axios.post(API_URL, data);

// Update location
export const updateLocation = (id, data) => axios.patch(`${API_URL}/${id}`, data);

// Delete location
export const deleteLocation = (id) => axios.delete(`${API_URL}/${id}`);
