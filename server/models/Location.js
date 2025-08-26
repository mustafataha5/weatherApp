const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  lat: {
    type: Number,
    required: true,
  },
  lon: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Location", locationSchema);
