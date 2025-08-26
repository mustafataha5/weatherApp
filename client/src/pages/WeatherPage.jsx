import React, { useState, useEffect, useCallback } from "react";
import {
  TextField,
  Button,
  Typography,
  CircularProgress,
  MenuItem,
  Grid,
  Box,
  Paper,
  Stack,
  Alert,
  Container,
  Tabs,
  Tab,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

import DisplayWeather from "../components/DisplayWeather";
import DisplayForecast from "../components/DisplayForecast";
import { useTempUnit } from "../context/TempUnitContext";
import {
  createWeatherByCoords,
  getForecastByCoords,
} from "../services/weatherService";

// Custom hook for geolocation
const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    const watcherId = navigator.geolocation.watchPosition(
      (pos) =>
        setLocation({
          lat: Number(pos.coords.latitude),
          lon: Number(pos.coords.longitude),
        }),
      (err) => setError(err.message),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watcherId);
  }, []);

  return { location, error };
};

// Forecast Wrapper Component
const ForecastWrapper = ({ forecast }) => {
  if (!forecast || !forecast.length) return null;
  return (
    <Box sx={{ mt: 2 }}>
      <DisplayForecast forecast={forecast} />
    </Box>
  );
};

const WeatherPage = ({ initialLocations = [] }) => {
  const [locations, setLocations] = useState(initialLocations);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [hasData, setHasData] = useState(false);

  const { location: userLocation, error: geoError } = useGeolocation();
  const { unit } = useTempUnit();

  useEffect(() => {
    setLocations(initialLocations);
  }, [initialLocations]);

  const fetchWeatherData = useCallback(async ({ coords }) => {
    setLoading(true);
    setError("");
    setCurrentWeather(null);
    setForecast(null);
    setHasData(false);

    try {
      const { lat, lon } = coords;

      // Fetch current weather and forecast in parallel
      const [currentResp, forecastResp] = await Promise.allSettled([
        createWeatherByCoords(lat, lon),
        getForecastByCoords(lat, lon),
      ]);

      let hasSuccessfulData = false;

      if (currentResp.status === "fulfilled") {
        const weatherData = currentResp.value.data?.data?.weatherData;
        if (weatherData) {
          setCurrentWeather(weatherData);
          hasSuccessfulData = true;
        }
      }

      if (forecastResp.status === "fulfilled") {
        const forecastData = forecastResp.value.data?.data || [];
        if (Array.isArray(forecastData) && forecastData.length > 0) {
          setForecast(forecastData);
          hasSuccessfulData = true;
        }
      }

      if (!hasSuccessfulData) throw new Error("Failed to fetch weather data.");

      setHasData(true);
    } catch (err) {
      setError(err.message || "Failed to fetch weather data.");
      setHasData(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFetchWeatherData = useCallback(() => {
    const selectedLocation = locations.find((loc) => loc._id === selectedLocationId);
    if (!selectedLocation) {
      setError("Please select a location.");
      return;
    }
    fetchWeatherData({ coords: { lat: selectedLocation.lat, lon: selectedLocation.lon } });
  }, [locations, selectedLocationId, fetchWeatherData]);

  const handleGetUserLocationData = useCallback(() => {
    if (geoError) {
      setError(geoError);
      return;
    }
    if (!userLocation) {
      setError("Waiting for your location...");
      return;
    }
    setSelectedLocationId("");
    fetchWeatherData({ coords: { lat: userLocation.lat, lon: userLocation.lon } });
  }, [userLocation, geoError, fetchWeatherData]);

  const clearResults = useCallback(() => {
    setCurrentWeather(null);
    setForecast(null);
    setError("");
    setHasData(false);
    setActiveTab(0);
  }, []);

  const handleTabChange = useCallback((_, newValue) => setActiveTab(newValue), []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: "bold",
            background: "linear-gradient(45deg, #1A237E 30%, #5C6BC0 90%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 1,
          }}
        >
          MyWeather 🌤️
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Get current weather and 5-day forecast for saved locations or your current location
        </Typography>
      </Box>

      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        }}
      >
        <Stack spacing={2}>
          <TextField
            select
            fullWidth
            label="Select Location"
            value={selectedLocationId}
            onChange={(e) => setSelectedLocationId(e.target.value)}
            disabled={loading || !locations.length}
            sx={{ "& .MuiOutlinedInput-root": { backgroundColor: "white", borderRadius: 2 } }}
          >
            {locations.length
              ? locations.map((loc) => (
                  <MenuItem key={loc._id} value={loc._id}>
                    {loc.city}, {loc.country}
                  </MenuItem>
                ))
              : <MenuItem disabled>No locations found</MenuItem>}
          </TextField>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<SearchIcon />}
                onClick={handleFetchWeatherData}
                disabled={loading || !selectedLocationId}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
              >
                Get Complete Weather
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                startIcon={<MyLocationIcon />}
                onClick={handleGetUserLocationData}
                disabled={loading}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
              >
                Use My Location
              </Button>
            </Grid>
          </Grid>

          {hasData && (
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Button
                onClick={clearResults}
                variant="text"
                size="small"
                disabled={loading}
                sx={{ textTransform: "none" }}
              >
                Clear Results
              </Button>
            </Box>
          )}
        </Stack>
      </Paper>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {hasData && (currentWeather || forecast) && (
        <>
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} centered>
              <Tab
                icon={<ThermostatIcon />}
                label="Current Weather"
                disabled={!currentWeather}
                sx={{ fontWeight: 600 }}
              />
              <Tab
                icon={<CalendarTodayIcon />}
                label="5-Day Forecast"
                disabled={!forecast}
                sx={{ fontWeight: 600 }}
              />
            </Tabs>
          </Box>

          {currentWeather && activeTab === 0 && <DisplayWeather data={currentWeather} />}
          {forecast && activeTab === 1 && <ForecastWrapper forecast={forecast} />}
        </>
      )}
    </Container>
  );
};

export default WeatherPage;
