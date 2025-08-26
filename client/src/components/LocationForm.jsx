import React, { useState, useEffect, useCallback } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Container,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const LocationForm = ({ initialData = {}, onSubmit }) => {
  const [formData, setFormData] = useState({
    city: "",
    country: "",
    lat: "",
    lon: "",
  });
  const [errors, setErrors] = useState({});
  const [inputMode, setInputMode] = useState("manual");
  const [markerPosition, setMarkerPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]); // default center
  const isEditing = initialData && Object.keys(initialData).length > 0;

  useEffect(() => {
    if (isEditing) {
      const lat = initialData.lat || 51.505;
      const lon = initialData.lon || -0.09;
      setFormData({
        city: initialData.city || "",
        country: initialData.country || "",
        lat: lat.toString(),
        lon: lon.toString(),
      });
      setMarkerPosition([lat, lon]);
      setMapCenter([lat, lon]); // Center map on existing location
    }
  }, [initialData, isEditing]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const reverseGeocode = async (lat, lon) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`
      );
      const { address } = response.data;
      return {
        city: address.city || address.town || address.village || "",
        country: address.country || "",
      };
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      return { city: "", country: "" };
    }
  };

  const handleMapClick = async (latlng) => {
    const { lat, lng } = latlng;
    setMarkerPosition([lat, lng]);
    const { city, country } = await reverseGeocode(lat, lng);
    setFormData({
      city,
      country,
      lat: lat.toString(),
      lon: lng.toString(),
    });
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.country.trim()) newErrors.country = "Country is required";

    const lat = parseFloat(formData.lat);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      newErrors.lat = "Latitude must be between -90 and 90";
    }

    const lon = parseFloat(formData.lon);
    if (isNaN(lon) || lon < -180 || lon > 180) {
      newErrors.lon = "Longitude must be between -180 and 180";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!validate()) return;

      const payload = {
        ...formData,
        lat: Number(formData.lat),
        lon: Number(formData.lon),
      };
      onSubmit(payload);
    },
    [formData, onSubmit]
  );

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (inputMode === "map") {
          handleMapClick(e.latlng);
        }
      },
    });
    return markerPosition ? <Marker position={markerPosition} /> : null;
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
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
          {isEditing ? "Edit Location" : "Add Location"}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Enter the details for a {isEditing ? "location update" : "new location"}.
        </Typography>
      </Box>

      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        }}
      >
        <ToggleButtonGroup
          value={inputMode}
          exclusive
          onChange={(e, newMode) => newMode && setInputMode(newMode)}
          sx={{ mb: 2, display: "flex", justifyContent: "center" }}
        >
          <ToggleButton value="manual">Manual Input</ToggleButton>
          <ToggleButton value="map">Select on Map</ToggleButton>
        </ToggleButtonGroup>

        {inputMode === "map" && (
          <Box sx={{ height: 300, mb: 2 }}>
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: "100%", width: "100%", borderRadius: 8 }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <MapClickHandler />
            </MapContainer>
          </Box>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              fullWidth
              error={!!errors.city}
              helperText={errors.city}
              variant="outlined"
              disabled={inputMode === "map"}
              sx={{ "& .MuiOutlinedInput-root": { backgroundColor: "white", borderRadius: 2 } }}
            />
            <TextField
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              fullWidth
              error={!!errors.country}
              helperText={errors.country}
              variant="outlined"
              disabled={inputMode === "map"}
              sx={{ "& .MuiOutlinedInput-root": { backgroundColor: "white", borderRadius: 2 } }}
            />
            <TextField
              label="Latitude"
              name="lat"
              value={formData.lat}
              onChange={handleChange}
              type="number"
              required
              fullWidth
              error={!!errors.lat}
              helperText={errors.lat}
              inputProps={{ step: "any" }}
              variant="outlined"
              disabled={inputMode === "map"}
              sx={{ "& .MuiOutlinedInput-root": { backgroundColor: "white", borderRadius: 2 } }}
            />
            <TextField
              label="Longitude"
              name="lon"
              value={formData.lon}
              onChange={handleChange}
              type="number"
              required
              fullWidth
              error={!!errors.lon}
              helperText={errors.lon}
              inputProps={{ step: "any" }}
              variant="outlined"
              disabled={inputMode === "map"}
              sx={{ "& .MuiOutlinedInput-root": { backgroundColor: "white", borderRadius: 2 } }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              startIcon={<SaveIcon />}
              sx={{
                mt: 1,
                py: 1.5,
                fontSize: "1rem",
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {isEditing ? "Update Location" : "Save Location"}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default LocationForm;
