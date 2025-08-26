import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
} from "@mui/material";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import CloudIcon from "@mui/icons-material/Cloud";
import OpacityIcon from "@mui/icons-material/Opacity";
import { useTempUnit } from "../context/TempUnitContext";

/**
 * Display 5-day forecast
 * @param {Array} forecast - Array of forecast items from backend (with dt_txt)
 */
const DisplayForecast = ({ forecast = [] }) => {
  const { unit } = useTempUnit();

  const convertTemp = (tempC) =>
    unit === "C" ? tempC : tempC * 9 / 5 + 32;

  if (!forecast.length) {
    return (
      <Typography variant="body1" color="text.secondary">
        No forecast data available.
      </Typography>
    );
  }

  // Group forecast by day (5-day max)
  const groupedByDay = forecast.reduce((acc, entry) => {
    const date = new Date(entry.dt_txt).toLocaleDateString(); // Use dt_txt
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {});

  const days = Object.keys(groupedByDay).slice(0, 5); // first 5 days

  return (
    <Box>
      <Typography
        variant="h5"
        sx={{
          fontWeight: "bold",
          mb: 2,
          textAlign: "center",
          background: "linear-gradient(45deg, #1565C0, #42A5F5)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        5-Day Forecast
      </Typography>

      <Grid container spacing={2}>
        {days.map((day, index) => {
          const dayData = groupedByDay[day];

          // Calculate min/max temps
          const temps = dayData.map((d) => d.main.temp);
          const minTemp = Math.min(...temps);
          const maxTemp = Math.max(...temps);

          // Pick an icon from the first entry
          const weatherMain = dayData[0].weather[0].main;
          const weatherDesc = dayData[0].weather[0].description;

          let WeatherIcon = WbSunnyIcon;
          if (weatherMain.includes("Cloud")) WeatherIcon = CloudIcon;
          if (weatherMain.includes("Rain")) WeatherIcon = OpacityIcon;

          return (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  borderRadius: 3,
                  background: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
                  boxShadow: 3,
                }}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h6" fontWeight="bold">
                    {new Date(day).toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </Typography>
                  <WeatherIcon
                    sx={{ fontSize: 40, color: "#1976d2", my: 1 }}
                  />
                  <Typography variant="body1" gutterBottom>
                    {weatherDesc}
                  </Typography>
                  <Typography variant="body2">
                    🌡️ {Math.round(convertTemp(minTemp))}°{unit} - {Math.round(convertTemp(maxTemp))}°{unit}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default DisplayForecast;
