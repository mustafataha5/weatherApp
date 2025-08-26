import React from "react";
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
} from "@mui/material";
import { useTempUnit } from "../context/TempUnitContext"; // ✅ import context

const DisplayWeather = ({ data }) => {
  if (!data) return null;

  const { name, sys, weather, main, wind, clouds, visibility } = data;
  const { unit } = useTempUnit(); // ✅ get current unit (C or F)

  const convertTemp = (tempC) =>
    unit === "C" ? tempC : tempC * 9/5 + 32;

  return (
    <Card elevation={3} sx={{ mt: 4, borderRadius: 2, width: "100%", maxWidth: 600 }}>
      <CardContent>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {name}, {sys?.country}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <img
            src={`https://openweathermap.org/img/wn/${weather?.[0]?.icon}@2x.png`}
            alt={weather?.[0]?.description || "icon"}
            style={{ width: 80, height: 80 }}
          />
          <Typography variant="h5" sx={{ ml: 2 }}>
            {weather?.[0]?.description?.toUpperCase()}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography>
              <strong>Temperature:</strong> {Math.round(convertTemp(main?.temp))}°{unit}
            </Typography>
            <Typography>
              <strong>Feels Like:</strong> {Math.round(convertTemp(main?.feels_like))}°{unit}
            </Typography>
            <Typography>
              <strong>Min/Max:</strong> {Math.round(convertTemp(main?.temp_min))}°{unit} / {Math.round(convertTemp(main?.temp_max))}°{unit}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography><strong>Humidity:</strong> {main?.humidity}%</Typography>
            <Typography><strong>Pressure:</strong> {main?.pressure} hPa</Typography>
            <Typography><strong>Visibility:</strong> {visibility / 1000} km</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography><strong>Wind:</strong> {wind?.speed} m/s, {wind?.deg}°</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography><strong>Cloudiness:</strong> {clouds?.all}%</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DisplayWeather;
