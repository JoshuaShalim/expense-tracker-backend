// config/db.js
const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;

  try {
    // Serverless-optimized connection options
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000, // Socket timeout
      maxPoolSize: 1, // Limit connections in serverless (one per invocation)
      minPoolSize: 0,
      retryWrites: false, // Disable retry for serverless
      retryReads: false,
    };

    await mongoose.connect(process.env.MONGO_URI, options);
    isConnected = true;
    console.log("MongoDB connected");

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
      isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
      isConnected = false;
    });
  } catch (err) {
    console.error("DB connection error:", err);
    isConnected = false;
    throw err;
  }
};

// Graceful shutdown for serverless environment
process.on("SIGTERM", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed due to SIGTERM");
});

module.exports = connectDB;