import { useEffect, useState } from "react";
import { getLocation, updateLocation } from "../services/locationsService.js";
import LocationForm from "../components/LocationForm";
import { useParams, useNavigate } from "react-router-dom";
import { CircularProgress, Box, Typography, Alert } from "@mui/material";

const UpdateLocation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await getLocation(id);
        if (res.data) {
          setLocation(res.data);
        } else {
          setError("Location not found.");
        }
      } catch (err) {
        console.error("Failed to fetch location:", err);
        setError("Failed to fetch location data.");
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [id]);

  const handleUpdate = async (data) => {
    try {
      await updateLocation(id, data);
      navigate("/locations");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update location. Please try again.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return location ? (
    <LocationForm initialData={location.location} onSubmit={handleUpdate} />
  ) : (
    <Typography sx={{ mt: 4, textAlign: "center" }} variant="h6">
      Location not found.
    </Typography>
  );
};

export default UpdateLocation;
