import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  Container, Box, Typography, TextField, Button, CircularProgress, Paper, Stack, Alert,
  Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MapIcon from "@mui/icons-material/Map";
import CloseIcon from "@mui/icons-material/Close";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import DisplayWeather from "../components/DisplayWeather";
import DisplayForecast from "../components/DisplayForecast";
import { createWeatherByLocation, createWeatherByCoords, getForecastByLocation, getForecastByCoords } from "../services/weatherService";

// Fix Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Geolocation hook
const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => setError(err.message),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, []);

  return { location, error };
};

// Map click handler
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    dblclick: (e) => onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng })
  });
  return null;
};

// Map Modal
const MapSelectionModal = ({ open, onClose, onLocationSelect, currentCenter, currentMarker }) => {
  const [tempMarker, setTempMarker] = useState(currentMarker);

  const handleSelect = useCallback((coords) => {
    setTempMarker(coords);
    onLocationSelect(coords);
  }, [onLocationSelect]);

  const handleClose = useCallback(() => {
    setTempMarker(currentMarker);
    onClose();
  }, [onClose, currentMarker]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { height: '80vh', maxHeight: '600px' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Select Location on Map
        <Button onClick={handleClose} size="small" sx={{ minWidth: 'auto', p: 1 }}><CloseIcon /></Button>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ height: '100%', minHeight: '400px' }}>
          <MapContainer center={[currentCenter.lat, currentCenter.lng]} zoom={10} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {tempMarker && <Marker position={[tempMarker.lat, tempMarker.lng]}>
              <Popup>Selected Location<br/>Lat: {tempMarker.lat.toFixed(6)}<br/>Lng: {tempMarker.lng.toFixed(6)}</Popup>
            </Marker>}
            <MapClickHandler onLocationSelect={handleSelect} />
          </MapContainer>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined">Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

// Forecast Wrapper
const ForecastWrapper = ({ forecast }) => {
  if (!forecast || !forecast.length) return null;
  return (
    <Paper elevation={3} sx={{ mt: 3, borderRadius: 3, overflow: 'hidden' }}>
      <Box sx={{ p: 3, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: 'white' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>📅 5-Day Weather Forecast</Typography>
      </Box>
      <Box sx={{ p: 3 }}>
        <DisplayForecast forecast={forecast} />
      </Box>
    </Paper>
  );
};

const SmartWeatherApp = () => {
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 51.505, lng: -0.09 });
  const [markerPosition, setMarkerPosition] = useState({ lat: 51.505, lng: -0.09 });
  const [activeTab, setActiveTab] = useState(0);

  const { location: userLocation } = useGeolocation();

  useEffect(() => {
    if (userLocation) {
      setMapCenter(userLocation);
      setMarkerPosition(userLocation);
    }
  }, [userLocation]);

  const fetchWeatherData = useCallback(async ({ location, coords }) => {
    setLoading(true); setError(""); setWeather(null); setForecast(null);
    try {
      const [currentResp, forecastResp] = await Promise.allSettled([
        location ? createWeatherByLocation(location) : createWeatherByCoords(coords.lat, coords.lng),
        location ? getForecastByLocation(location) : getForecastByCoords(coords.lat, coords.lng)
      ]);

      if (currentResp.status === 'fulfilled') setWeather(currentResp.value.data?.data?.weatherData || null);
      if (forecastResp.status === 'fulfilled') setForecast(forecastResp.value.data?.data || null);

      if (coords) { setMapCenter(coords); setMarkerPosition(coords); }
      if (!currentResp.value?.data?.data?.weatherData && !forecastResp.value?.data?.data) throw new Error("Failed to fetch weather data.");
    } catch (err) {
      setError(err.message || "Failed to fetch weather data.");
      if (coords) { setMapCenter(coords); setMarkerPosition(coords); }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    if (!query.trim()) { setError("Please enter a location"); return; }
    await fetchWeatherData({ location: query });
  }, [query, fetchWeatherData]);

  const handleMapLocationSelect = useCallback(async (coords) => {
    setIsMapOpen(false);
    await fetchWeatherData({ coords });
  }, [fetchWeatherData]);

  const clearResults = useCallback(() => {
    setWeather(null); setForecast(null); setQuery(""); setError(""); setActiveTab(0);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: "bold", background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", mb: 1 }}>
          🌍 Smart Weather App
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Get current weather and 5-day forecast instantly
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 3, background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
        <Box component="form" onSubmit={handleSearch} sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
          <TextField
            fullWidth
            label="Enter city, zip code, or landmark"
            variant="outlined"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            sx={{ "& .MuiOutlinedInput-root": { backgroundColor: "white", borderRadius: 2 } }}
          />
          <Stack direction={{ xs: "row", sm: "column" }} spacing={1} sx={{ minWidth: { sm: "200px" } }}>
            <Button type="submit" variant="contained" startIcon={<SearchIcon />} disabled={loading} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}>
              Search
            </Button>
            <Button variant="outlined" startIcon={<MapIcon />} onClick={() => setIsMapOpen(true)} disabled={loading} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}>
              Map
            </Button>
          </Stack>
        </Box>
        {(weather || forecast || error) && (
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Button onClick={clearResults} variant="text" size="small" disabled={loading}>Clear Results</Button>
          </Box>
        )}
      </Paper>

      {loading && <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}><CircularProgress /></Box>}
      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {(weather || forecast) && (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} centered>
              <Tab icon={<ThermostatIcon />} label="Current Weather" disabled={!weather} sx={{ fontWeight: 600 }} />
              <Tab icon={<CalendarTodayIcon />} label="5-Day Forecast" disabled={!forecast} sx={{ fontWeight: 600 }} />
            </Tabs>
          </Box>
          {weather && activeTab === 0 && <DisplayWeather data={weather} />}
          {forecast && activeTab === 1 && <ForecastWrapper forecast={forecast} />}
        </>
      )}

      <MapSelectionModal
        open={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onLocationSelect={handleMapLocationSelect}
        currentCenter={mapCenter}
        currentMarker={markerPosition}
      />
    </Container>
  );
};

export default SmartWeatherApp;
