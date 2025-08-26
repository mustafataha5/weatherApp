const express = require("express");
const router = express.Router();
const weatherController = require("../controllers/weatherController");

// -------------------- ROUTES -------------------- //

// Create current weather query
router.post("/current", weatherController.createWeatherQuery);

// Get 5-day forecast
router.post("/forecast", weatherController.get5DayForecast);

// Get weather queries by date range
router.get("/date-range", weatherController.getWeatherByDateRange);

// Get all weather queries
router.get("/", weatherController.getAllWeather);

// Get weather query by ID
router.get("/:id", weatherController.getWeatherById);

// Update weather query by ID
router.put("/:id", weatherController.updateWeatherQuery);

// Delete weather query by ID
router.delete("/:id", weatherController.deleteWeatherQuery);


// sreachLocation
//router.get("/sreach-locations", weatherController.sreachLocation);

module.exports = router;
