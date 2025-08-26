const mongoose = require("mongoose");

// Schema for each forecast item (3-hour interval)
const ForecastItemSchema = new mongoose.Schema({
  dt_txt: { type: Date, required: true }, // timestamp of forecast
  main: {
    temp: { type: Number, required: true },
    feels_like: Number,
    temp_min: Number,
    temp_max: Number,
    pressure: Number,
    humidity: Number,
  },
  weather: [
    {
      id: Number,
      main: String,
      description: String,
      icon: String,
    }
  ],
  wind: {
    speed: Number,
    deg: Number,
  },
  clouds: { all: Number },
  visibility: Number,
}, { _id: false }); // _id false to avoid auto _id for each subdocument

// Main WeatherQuery schema
const WeatherQuerySchema = new mongoose.Schema({
  location: { type: String, required: true },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ["current", "forecast", "range"], 
    default: "current" 
  },
  startDate: Date, // optional for forecast/range queries
  endDate: Date,   // optional for forecast/range queries
  weatherData: mongoose.Schema.Types.Mixed, // for current weather
  forecastData: [ForecastItemSchema],       // array of forecast items
}, { 
  timestamps: true // automatically adds createdAt and updatedAt
});

module.exports = mongoose.model("WeatherQuery", WeatherQuerySchema);
