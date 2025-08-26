const Location = require("../models/Location");

// ✅ Add a new location
const addLocation = async (req, res) => {
  try {
    const location = new Location(req.body);
    await location.save();
    res.status(201).json({
      message: "Location added successfully ✅",
      location,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Get all locations
const getLocations = async (req, res) => {
  try {
    const locations = await Location.find();
    res.json({
      message: "Locations retrieved successfully ✅",
      locations,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get single location by ID
const getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) return res.status(404).json({ error: "Location not found ❌" });
    res.json({
      message: "Location retrieved successfully ✅",
      location,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update location by ID
const updateLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!location) return res.status(404).json({ error: "Location not found ❌" });
    res.json({
      message: "Location updated successfully ✅",
      location,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Delete location by ID
const deleteLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) return res.status(404).json({ error: "Location not found ❌" });
    res.json({
      message: "Location deleted successfully ✅",
      location,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addLocation,
  getLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
};
