const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use("/api/weather", require("./routes/WeatherRoute"));
app.use("/api/locations", require("./routes/locationRoute"));

// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
