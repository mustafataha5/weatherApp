import React from "react";
import {
  Paper,
  Box,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MapIcon from "@mui/icons-material/Map";

// This component handles the search form and buttons.
const WeatherSearchForm = ({ query, setQuery, handleSearch, handleMapClick, loading }) => {
  return (
    <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }} elevation={4}>
      <Box component="form" onSubmit={handleSearch} sx={{ display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          label="Enter City, Zip, or Landmark"
          variant="outlined"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search for a city, zip code, or landmark"
        />
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button
            type="submit"
            variant="contained"
            endIcon={<SearchIcon />}
            disabled={loading}
            sx={{ minWidth: { xs: "100%", sm: "120px" } }}
          >
            Search
          </Button>
          <Button
            variant="outlined"
            onClick={handleMapClick}
            endIcon={<MapIcon />}
            disabled={loading}
            sx={{ minWidth: { xs: "100%", sm: "120px" } }}
          >
            Map
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

export default WeatherSearchForm;
