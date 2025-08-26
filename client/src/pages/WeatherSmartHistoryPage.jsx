// src/pages/WeatherHistoryPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
} from "@mui/material";
import { getWeatherByDateRange } from "../services/weatherService";
import { useTempUnit } from "../context/TempUnitContext";
import debounce from "lodash.debounce";
import { exportToCSV } from "../utils/csvExport";

const WeatherSmartHistoryPage = () => {
  const { unit, apiUnit } = useTempUnit(); // get unit & apiUnit
  const [weatherData, setWeatherData] = useState([]);
  const [locations, setLocations] = useState([]);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    type: "", // current / forecast / ""
    location: "",
    page: 1,
    limit: 10,
  });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Debounced location search (optional, if you implement searchLocations API)
  const handleSearchLocation = useCallback(
    debounce(async (query) => {
      if (!query) return setLocations([]);
      try {
        // const res = await searchLocations(query);
        // setLocations(res.data);
      } catch (err) {
        console.error(err);
      }
    }, 500),
    []
  );

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    if (name === "location") handleSearchLocation(value);
  };

  // Fetch weather history from backend
  const fetchWeatherHistory = async () => {
    if (!filters.startDate || !filters.endDate) return;

    setLoading(true);
    try {
      const formattedFilters = {
        ...filters,
        startDate: new Date(filters.startDate),
        endDate: new Date(filters.endDate),
        units: apiUnit, // <-- pass units from context
      };
      const res = await getWeatherByDateRange(formattedFilters);

      // Flatten forecast items for display
      const processedData = res.data.data.flatMap((item) => {
        if (item.type === "forecast" && item.forecastData?.length) {
          return item.forecastData.map((f) => ({
            _id: `${item._id}-${f.dt_txt}`,
            createdAt: f.dt_txt,
            location: item.location,
            type: item.type,
            temp: f.main.temp,
            weather: f.weather?.[0]?.description ?? "-",
          }));
        } else if (item.type === "current" && item.weatherData) {
          return [
            {
              _id: item._id,
              createdAt: item.createdAt,
              location: item.location,
              type: item.type,
              temp: item.weatherData.main.temp,
              weather: item.weatherData.weather?.[0]?.description ?? "-",
            },
          ];
        } else {
          return [];
        }
      });

      // Strict frontend date filtering
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      const strictlyFiltered = processedData.filter((entry) => {
        const entryDate = new Date(entry.createdAt);
        return entryDate >= start && entryDate <= end;
      });

      setWeatherData(strictlyFiltered);
      setTotal(strictlyFiltered.length);
    } catch (err) {
      console.error(err);
      setWeatherData([]);
      setTotal(0);
    }
    setLoading(false);
  };

  // Refetch whenever filters or apiUnit change
  useEffect(() => {
    fetchWeatherHistory();
  }, [
    filters.startDate,
    filters.endDate,
    filters.type,
    filters.location,
    filters.page,
    filters.limit,
    apiUnit, // <-- refetch when temp unit changes
  ]);

  const handleChangePage = (event, newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage + 1 }));
  };

  const handleChangeRowsPerPage = (event) => {
    setFilters((prev) => ({
      ...prev,
      limit: parseInt(event.target.value, 10),
      page: 1,
    }));
  };

  const handleExportCSV = () => {
    const formattedData = weatherData.map((item) => ({
      Date: new Date(item.createdAt).toLocaleString(),
      Location: item.location,
      Type: item.type,
      Temperature: item.temp ? `${Math.round(item.temp)}°${unit}` : "-",
      Weather: item.weather ?? "-",
    }));
    exportToCSV(formattedData);
  };

  return (
    <Container maxWidth="lg">
      <Box p={4} my={4} sx={{ backgroundColor: "#fff", borderRadius: 4, boxShadow: 3 }}>
        <Typography variant="h4" gutterBottom>
          Weather History
        </Typography>

        <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
          <TextField
            label="Start Date"
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            sx={{ flex: "1 1 200px" }}
          />
          <TextField
            label="End Date"
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            sx={{ flex: "1 1 200px" }}
          />
          <TextField
            label="Type"
            select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            sx={{ minWidth: 120, flex: "1 1 120px" }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="current">Current</MenuItem>
            <MenuItem value="forecast">Forecast</MenuItem>
          </TextField>
          <TextField
            label="Location"
            name="location"
            value={filters.location}
            onChange={handleFilterChange}
            sx={{ minWidth: 180, flex: "1 1 180px" }}
          />
          <Button
            variant="contained"
            onClick={handleExportCSV}
            sx={{ alignSelf: "center", height: "56px", flexShrink: 0 }}
          >
            Export CSV
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" flexDirection="column" alignItems="center" my={5}>
            <CircularProgress size={60} />
            <Typography variant="h6" mt={2}>
              Fetching weather data...
            </Typography>
          </Box>
        ) : (
          <>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Temperature</TableCell>
                  <TableCell>Weather</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {weatherData.length > 0 ? (
                  weatherData.map((item) => (
                    <TableRow key={item._id} hover>
                      <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>
                        {item.temp ? `${Math.round(item.temp)}°${unit}` : "-"}
                      </TableCell>
                      <TableCell>{item.weather ?? "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No weather data found for the selected date range.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <TablePagination
              component="div"
              count={total}
              page={filters.page - 1}
              onPageChange={handleChangePage}
              rowsPerPage={filters.limit}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Box>
    </Container>
  );
};

export default WeatherSmartHistoryPage;
