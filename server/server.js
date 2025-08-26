const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://ec2-63-178-229-181.eu-central-1.compute.amazonaws.com", // AWS or Render frontend URL
  ""
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());

// Routes
app.use("/api/weather", require("./routes/WeatherRoute")); // FIXED
app.use("/api/locations", require("./routes/locationRoute"));

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(__dirname, "../client/dist");
  app.use(express.static(clientBuildPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
