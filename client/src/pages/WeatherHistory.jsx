import React, { useEffect, useState, useCallback } from "react";
import {
  Container,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  CircularProgress,
  Chip,
  Paper,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import DisplayWeather from "../components/DisplayWeather";
import DisplayForecast from "../components/DisplayForecast";
import { getAllWeather, deleteWeatherQuery } from "../services/weatherService";
import { useTempUnit } from "../context/TempUnitContext"; // ✅ import unit context

const WeatherHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { unit } = useTempUnit(); // ✅ use global unit (C/F)

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllWeather();
      const sorted = res.data.data
        ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((item) => ({
          ...item,
          displayLocation:
            item.location ||
            (item.weatherData?.name
              ? `${item.weatherData.name}, ${item.weatherData.sys?.country || ""}`
              : "Unknown Location"),
        }));
      setHistory(sorted || []);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch history.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = useCallback(async (e, id) => {
    e.stopPropagation();
    try {
      await deleteWeatherQuery(id);
      setHistory((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to delete weather entry.";
      setError(errorMessage);
    }
  }, []);

  // ✅ helper: convert temperature
  const formatTemp = (tempC) => {
    if (unit === "F") {
      return `${Math.round((tempC * 9) / 5 + 32)}°F`;
    }
    return `${Math.round(tempC)}°C`;
  };

  // ✅ Export history as JSON
  const handleExportJSON = () => {
    if (!history.length) return;

    const dataStr = JSON.stringify(history, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "weather_history.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
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
          🌤️ Weather History
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Browse your past weather queries
        </Typography>
      </Box>

      {history.length > 0 && (
        <Box sx={{ mb: 2, textAlign: "right" }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleExportJSON}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Export JSON
          </Button>
        </Box>
      )}

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && history.length === 0 && (
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
            No weather queries found. Start by searching for a location!
          </Typography>
        </Paper>
      )}

      {history.map((item) => (
        <Accordion
          key={item._id}
          sx={{
            mb: 2,
            borderRadius: 3,
            boxShadow: 3,
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor: "#e3f2fd",
              borderRadius: 3,
              minHeight: 64,
              "&.Mui-expanded": { borderRadius: "12px 12px 0 0" },
            }}
          >
            <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", mr: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {item.displayLocation}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(item.createdAt).toLocaleString()} • {item.type.toUpperCase()}
              </Typography>
            </Box>

            {item.type === "current" && item.weatherData?.main && (
              <Chip
                label={formatTemp(item.weatherData.main.temp)} // ✅ temp respects C/F
                color="primary"
                variant="filled"
                sx={{
                  mr: 1,
                  fontWeight: "bold",
                  backgroundColor: "#2196F3",
                  color: "white",
                }}
              />
            )}

            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={(e) => handleDelete(e, item._id)}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
            >
              Delete
            </Button>
          </AccordionSummary>

          <AccordionDetails>
            {item.weatherData ? (
              item.type === "current" ? (
                <DisplayWeather data={item.weatherData} />
              ) : (
                <DisplayForecast forecast={item.weatherData.forecast} />
              )
            ) : (
              <Typography color="text.secondary">No detailed weather data available.</Typography>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Container>
  );
};

export default WeatherHistory;
