import React, { useEffect, useRef } from "react";
import { Box } from "@mui/material";

const InteractiveMap = ({
  onLocationSelect,
  center = [51.505, -0.09],
  zoom = 13,
  isOpen = true,
}) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const leafletMapRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !mapRef.current) return;

    if (window.L && !leafletMapRef.current) {
      // Fix Leaflet icons
      delete window.L.Icon.Default.prototype._getIconUrl;
      window.L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Initialize map
      const map = window.L.map(mapRef.current, {
        center,
        zoom,
      });
      leafletMapRef.current = map;

      // Add tiles
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Add draggable marker
      const marker = window.L.marker(center, { draggable: true }).addTo(map);
      marker.bindPopup("Drag or click the map to change location").openPopup();
      markerRef.current = marker;

      // Map click handler
      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]).openPopup();
        onLocationSelect(lat, lng);
      });

      // Marker drag end
      marker.on("dragend", (e) => {
        const { lat, lng } = e.target.getLatLng();
        onLocationSelect(lat, lng);
      });

      // Wait for modal fade-in
      setTimeout(() => map.invalidateSize(), 300);
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isOpen, center, onLocationSelect, zoom]);

  useEffect(() => {
    if (isOpen && leafletMapRef.current) {
      setTimeout(() => {
        leafletMapRef.current.invalidateSize();
        leafletMapRef.current.setView(center, zoom);
        if (markerRef.current) markerRef.current.setLatLng(center);
      }, 300);
    }
  }, [isOpen, center, zoom]);

  return (
    <Box sx={{ height: "100%", width: "100%", borderRadius: "8px" }}>
      <div
        ref={mapRef}
        style={{ height: "100%", width: "100%" }}
        aria-label="Interactive map for selecting a location"
      />
    </Box>
  );
};

export default InteractiveMap;
