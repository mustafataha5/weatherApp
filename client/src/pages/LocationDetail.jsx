import React, { useState, useEffect, useCallback } from "react";
import { getLocation } from "../services/locationsService";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Container,
  CircularProgress,
  Alert,
} from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Corrected Leaflet marker icon fix using a standard CDN URL
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const LocationDetail = () => {
  const { id } = useParams();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLocation = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getLocation(id);
      setLocation(res.data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to load location details.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: "bold",
            background: "linear-gradient(45deg, #FF6F00 30%, #FFCA28 90%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 1,
          }}
        >
          {location.name}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Location Details
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
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {location.city}, {location.country}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Lat: {location.lat?.toFixed(4)}, Lon: {location.lon?.toFixed(4)}
        </Typography>

        {/* Map */}
        {location.lat && location.lon && (
          <Box
            sx={{
              height: 300,
              mt: 2,
              borderRadius: 2,
              overflow: "hidden",
              border: "1px solid #ccc",
            }}
          >
            <MapContainer
              center={[location.lat, location.lon]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <Marker position={[location.lat, location.lon]}>
                <Popup>
                  {location.name} <br /> {location.city}, {location.country}
                </Popup>
              </Marker>
            </MapContainer>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default LocationDetail;