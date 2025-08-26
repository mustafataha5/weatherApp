const express = require("express");
const router = express.Router();
const {
  addLocation,
  getLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
} = require("../controllers/locationController");

// ✅ Create a new location
router.post("/", addLocation);

// ✅ Get all locations
router.get("/", getLocations);

// ✅ Get a single location by ID
router.get("/:id", getLocationById);

// ✅ Update a location by ID
router.patch("/:id", updateLocation);

// ✅ Delete a location by ID
router.delete("/:id", deleteLocation);

module.exports = router;
