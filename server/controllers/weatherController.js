/**
 * @fileoverview Weather controller using OpenWeatherMap Current Weather & Forecast APIs
 */
const axios = require("axios");
const WeatherQuery = require("../models/WeatherQuery");

// API Key
const API_KEY = process.env.WEATHER_API_KEY;

// ----------------------------------------------------
// Helper Functions
// ----------------------------------------------------

/**
 * Helper: Get coordinates from a location (city name or ZIP code).
 * Returns coordinates and a standardized location name.
 */
const getCoordinatesFromLocation = async (location) => {
  // Check if the input is a ZIP code with an optional country code
  const zipMatch = location.match(/^(\d{5})(?:,([a-zA-Z]{2}))?$/);
  if (zipMatch) {
    const zipCode = zipMatch[1];
    const countryCode = zipMatch[2] || "us"; // Default to 'us' if no country code provided
    
    const geoResp = await axios.get(
      `http://api.openweathermap.org/geo/1.0/zip?zip=${zipCode},${countryCode}&appid=${API_KEY}`
    );
    
    if (geoResp.data.cod === "404") throw new Error("ZIP code not found");

    return { 
      lat: geoResp.data.lat, 
      lon: geoResp.data.lon, 
      finalLocation: `${geoResp.data.name}, ${geoResp.data.country}` 
    };
  }
  
  // Handle city name/landmark
  const geoResp = await axios.get(
    `http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${API_KEY}`
  );

  if (!geoResp.data || geoResp.data.length === 0) throw new Error("Location not found ❌");

  const { lat, lon, name, country } = geoResp.data[0];
  return { lat, lon, finalLocation: `${name}, ${country}` };
};

/**
 * Helper: Reverse geocode from coordinates.
 */
const getLocationFromCoords = async (lat, lon) => {
  const geoResp = await axios.get(
    `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
  );

  if (geoResp.data && geoResp.data.length > 0) {
    const { name, country } = geoResp.data[0];
    return `${name}, ${country}`;
  }
  return "Unknown Location";
};

/**
 * Helper: Resolve final location & coordinates based on input
 */
const resolveLocationAndCoords = async ({ location, lat, lon }) => {
  let finalLat = lat;
  let finalLon = lon;
  let finalLocation = location;

  if (location && (!lat || !lon)) {
    // Location provided, but no coords. Resolve coords from location.
    const coords = await getCoordinatesFromLocation(location);
    finalLat = coords.lat;
    finalLon = coords.lon;
    finalLocation = coords.finalLocation;
  } else if (!finalLocation && finalLat && finalLon) {
    // Coords provided, but no location name. Resolve location from coords.
    finalLocation = await getLocationFromCoords(finalLat, finalLon);
  }

  // Final check to ensure we have a location and coordinates
  if (!finalLat || !finalLon || !finalLocation) {
    throw new Error("Could not resolve location or coordinates.");
  }
  
  return { finalLat, finalLon, finalLocation };
};

// ----------------------------------------------------
// Controller Functions
// ----------------------------------------------------

/**
 * Fetch current weather
 */
exports.createWeatherQuery = async (req, res) => {
  try {
    const { location, lat, lon, units = "metric" } = req.body;

    if (!location && (!lat || !lon))
      return res.status(400).json({ error: "Provide either location or lat/lon" });

    const { finalLat, finalLon, finalLocation } = await resolveLocationAndCoords({ location, lat, lon });
    
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${finalLat}&lon=${finalLon}&units=${units}&appid=${API_KEY}`;
    
    const response = await axios.get(url);
    
    const newQuery = new WeatherQuery({
      location: finalLocation,
      lat: finalLat,
      lon: finalLon,
      weatherData: response.data,
      type: "current",
    });

    await newQuery.save();

    res.status(201).json({
      message: "Current weather retrieved successfully ✅",
      data: newQuery,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || "An unexpected error occurred." });
  }
};

/**
 * Fetch 5-day forecast
 */
exports.get5DayForecast = async (req, res) => {
  try {
    const { location, lat, lon, units = "metric" } = req.body;

    if (!location && (!lat || !lon))
      return res.status(400).json({ error: "Provide either location or lat/lon" });

    const { finalLat, finalLon, finalLocation } = await resolveLocationAndCoords({ location, lat, lon });

    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${finalLat}&lon=${finalLon}&units=${units}&appid=${API_KEY}`;
    const response = await axios.get(url);

    const forecastItems = response.data.list.map(f => ({
      dt_txt: f.dt_txt,
      main: f.main,
      weather: f.weather,
      wind: f.wind,
      clouds: f.clouds,
      visibility: f.visibility,
    }));

    const newQuery = new WeatherQuery({
      location: finalLocation,
      lat: finalLat,
      lon: finalLon,
      type: "forecast",
      forecastData: forecastItems,
      weatherData: {},
    });

    await newQuery.save();

    res.status(201).json({
      message: "5-day forecast retrieved successfully ✅",
      data: forecastItems,
      location: finalLocation,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || "An unexpected error occurred." });
  }
};
/**
 * Get all weather queries
 */
exports.getAllWeather = async (req, res) => {
  try {
    const weatherData = await WeatherQuery.find().sort({ createdAt: -1 });
    res.json({ data: weatherData, message: "Fetched all successfully ✅" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get weather by ID
 */
exports.getWeatherById = async (req, res) => {
  try {
    const { id } = req.params;
    const weather = await WeatherQuery.findById(id);
    if (!weather) return res.status(404).json({ message: "Weather data not found ❌" });
    res.json({ data: weather, message: "Fetched by ID successfully ✅" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Delete weather by ID
 */
exports.deleteWeatherQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await WeatherQuery.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Weather data not found ❌" });
    res.json({ message: "Deleted successfully ✅" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Update weather query by ID
 */
exports.updateWeatherQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { location, country, lat, lon, weatherData, forecastData } = req.body;

    const { finalLat, finalLon, finalLocation } = await resolveLocation({ location, country, lat, lon });

    const updatedQuery = await WeatherQuery.findByIdAndUpdate(
      id,
      { location: finalLocation, lat: finalLat, lon: finalLon, weatherData, forecastData },
      { new: true }
    );

    if (!updatedQuery)
      return res.status(404).json({ message: "Weather query not found ❌" });

    res.json({ message: "Updated successfully ✅", data: updatedQuery });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Fetch weather history by date range
 */
exports.getWeatherByDateRange = async (req, res) => {
  try {
    let { startDate, endDate, location, type, page = 1, limit = 100 } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Please provide both startDate and endDate ❌" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    page = Math.max(1, parseInt(page));
    limit = Math.min(200, Math.max(1, parseInt(limit)));
    const skip = (page - 1) * limit;

    const filter = {};
    if (type) filter.type = type;
    if (location) filter.location = { $regex: location, $options: "i" };

    let total = 0;
    let weatherData = [];

    try {
      total = await WeatherQuery.countDocuments(filter);
      weatherData = await WeatherQuery.find(filter)
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit);
    } catch (dbErr) {
      return res.status(500).json({ error: "Database query failed ❌", details: dbErr.message });
    }

    if (!weatherData.length) {
      return res.status(200).json({
        data: [],
        total: 0,
        page,
        totalPages: 0,
        message: "No weather data found for the given filters ⚠️",
      });
    }

    // Filter forecastData by date range
    weatherData = weatherData.map(item => {
      if (item.type === "forecast" && Array.isArray(item.forecastData)) {
        item.forecastData = item.forecastData.filter(f => {
          const dt = new Date(f.dt_txt);
          return dt >= start && dt <= end;
        });
      }
      return item;
    });

    res.json({
      data: weatherData,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      message: "Weather history fetched successfully ✅",
    });
  } catch (error) {
    console.error("getWeatherByDateRange error:", error);
    res.status(500).json({ error: "Internal server error ❌", details: error.message });
  }
};
