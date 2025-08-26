import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LocationsList from "./pages/LocationsList";
import AddLocation from "./pages/AddLocation";
import UpdateLocation from "./pages/UpdateLocation";
import LocationDetail from "./pages/LocationDetail";
import NavigationBar from "./components/NavigationBar";
import WeatherPage from "./pages/WeatherPage";
import { useEffect, useState } from "react";
import axios from "axios";
import SmartWeather from "./pages/SmartWeather";
import WeatherHistory from "./pages/WeatherHistory";
import { TempUnitProvider } from "./context/TempUnitContext";
import { Box, CircularProgress, Typography } from "@mui/material";
// import WeatherHistoryPage from "./pages/WeatherSmartHistoryPage";
import AboutPage from "./pages/AboutPage";
import WeatherSmartHistoryPage from "./pages/WeatherSmartHistoryPage";

function App() {
 //* */
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/locations");
        setLocations(res.data?.locations || []);
      } catch (err) {
        console.error("Error fetching locations:", err);
        setError("Failed to load locations. Try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);




  if (loading) {
    return (
      <Box textAlign="center" mt={8}>
        <CircularProgress />
        <Typography variant="h6" mt={2}>
          Loading locations...
        </Typography>
      </Box>
    );
  }

  if (error) {
  return <Typography color="error">{error}</Typography>;
  }

  return (
    <TempUnitProvider>
      <Router>
        {/* ✅ Sticky Navbar */}
        <NavigationBar />

        {/* ✅ Add padding so content isn’t hidden under navbar */}
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          <Routes>
            <Route path="/" element={<WeatherPage initialLocations={locations} />} />
            <Route path="/smart" element={<SmartWeather />} />
            <Route path="/history" element={<WeatherHistory />} />
            <Route path="/history-smart" element={<WeatherSmartHistoryPage />} />
            <Route path="/locations" element={<LocationsList />} />
            <Route path="/locations/add" element={<AddLocation />} />
            <Route path="/locations/edit/:id" element={<UpdateLocation />} />
            <Route path="/locations/:id" element={<LocationDetail />} />
            <Route path="/about" element={<AboutPage />} />
            <Route
              path="*"
              element={
                <Typography variant="h6" color="error" textAlign="center" mt={4}>
                  404 - Page Not Found
                </Typography>
              }
            />
          </Routes>
        </Box>
      </Router>
    </TempUnitProvider>
  );
}

export default App;