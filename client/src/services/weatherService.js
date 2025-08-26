import axios from "axios";



const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/weather",
});
/**
 * -------------------------------
 * 🌤️ Current Weather Endpoints
 * -------------------------------
 */
export const getAllWeather = () => api.get("/");
export const getWeatherById = (id) => api.get(`/${id}`);

/**
 * Fetch current weather by location
 * @param {string} location - city name, ZIP, or landmark
 * @param {string} [country] - optional ISO country code (e.g., "US", "PS")
 * @param {string} [units="metric"] - "metric" or "imperial"
 */
export const createWeatherByLocation = (location, country = "", units = "metric") => {
  // Append country if provided
  const fullLocation = country ? `${location},${country.toUpperCase()}` : location;
  return api.post("/current", { location: fullLocation, units });
};

/**
 * Fetch current weather by coordinates
 */
export const createWeatherByCoords = (lat, lon, units = "metric") =>
  api.post("/current", { lat, lon, units });

/**
 * -------------------------------
 * 📅 Forecast Endpoints
 * -------------------------------
 */
export const getForecastByCoords = (lat, lon, units = "metric") =>
  api.post("/forecast", { lat, lon, units });

export const getForecastByLocation = (location, country = "", units = "metric") => {
  const fullLocation = country ? `${location},${country.toUpperCase()}` : location;
  return api.post("/forecast", { location: fullLocation, units });
};

/**
 * -------------------------------
 * 🛠️ Utility Endpoints
 * -------------------------------
 */
export const deleteWeatherQuery = (id) => api.delete(`/${id}`);

export const getWeatherByDateRange = ({
  startDate,
  endDate,
  type,
  location,
  page,
  limit,
}) => {
  if (!startDate) throw new Error("startDate is required");

  const end = endDate || new Date().toISOString().split("T")[0];

  return api.get("/date-range", {
    params: {
      startDate,
      endDate: end,
      ...(type && { type }),
      ...(location && { location }),
      ...(page && { page }),
      ...(limit && { limit }),
    },
  });
};

/**
 * -------------------------------
 * 🔍 Search Locations (optional)
 * -------------------------------
 */
// export const searchLocations = (query) => {
//   if (!query) return Promise.resolve({ data: [] });
//   return api.get("/search-locations", { params: { query } });
// };
