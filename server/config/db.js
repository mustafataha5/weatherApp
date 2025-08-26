// // config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const username = process.env.mongodb_user;
    const password = process.env.mongodb_password;
    const database = process.env.database_name;

    const uri = `mongodb+srv://${username}:${password}@cluster0.cvs6yls.mongodb.net/${database}?retryWrites=true&w=majority&appName=Cluster0`;

    await mongoose.connect(uri, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
