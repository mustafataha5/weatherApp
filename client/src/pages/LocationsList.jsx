import { useEffect, useState, useCallback } from "react";
import { getLocations, deleteLocation } from "../services/locationsService.js";
import {
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  CardActions,
  Box,
  Alert,
  Paper,
  Stack,
  Container,
  Skeleton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate, useLocation } from "react-router-dom";

const LocationsList = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getLocations();
      console.log("API response:", res.data); // Check the structure
      // Fix: use res.data.locations
      setLocations(res.data?.locations || []);
    } catch (err) {
      console.error("Error fetching locations:", err);
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to fetch locations.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (location.state?.locationAdded) {
      fetchData();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, fetchData, navigate]);

  const handleDelete = useCallback(
    async (e, id) => {
      e.stopPropagation();
      if (window.confirm("Are you sure you want to delete this location?")) {
        try {
          await deleteLocation(id);
          fetchData();
        } catch (err) {
          console.error("Error deleting location:", err);
          const errorMessage =
            err.response?.data?.error || err.message || "Failed to delete location.";
          setError(errorMessage);
        }
      }
    },
    [fetchData]
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
          Saved Locations 📍
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage your saved weather locations.
        </Typography>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/locations/add")}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
            "&:hover": {
              background: "linear-gradient(45deg, #1976D2 30%, #19A3E0 90%)",
            },
          }}
        >
          Add New Location
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Skeleton loading */}
      {loading && (
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  <Skeleton variant="text" height={30} />
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="rectangular" height={80} sx={{ mt: 1 }} />
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
                    <Skeleton variant="rectangular" width="48%" height={36} />
                    <Skeleton variant="rectangular" width="48%" height={36} />
                  </Stack>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty message */}
      {!loading && locations.length === 0 && (
        <Paper
          elevation={3}
          sx={{
            p: 3,
            textAlign: "center",
            borderRadius: 3,
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No locations found. Click the "Add New Location" button to get started!
          </Typography>
        </Paper>
      )}

      {/* Display data */}
      {!loading && locations.length > 0 && (
        <Grid container spacing={3}>
          {locations.map((loc) => (
            <Grid item xs={12} sm={6} md={4} key={loc._id}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 3,
                  transition: "0.3s",
                  "&:hover": { transform: "scale(1.02)", boxShadow: 6 },
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {loc.name}
                  </Typography>
                  <Typography color="text.secondary">
                    {loc.city}, {loc.country}
                  </Typography>
                  {loc.lat && loc.lon && (
                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                      Lat: {loc.lat.toFixed(4)}, Lng: {loc.lon.toFixed(4)}
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="secondary"
                      startIcon={<EditIcon />}
                      onClick={() => navigate(`/locations/edit/${loc._id}`)}
                      sx={{ flexGrow: 1, borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={(e) => handleDelete(e, loc._id)}
                      sx={{ flexGrow: 1, borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                    >
                      Delete
                    </Button>
                  </Stack>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default LocationsList;
