const mongoose = require('mongoose');

/**
 * connectDB — establishes a connection to MongoDB using the URI stored in .env
 * We call this once when the server starts up.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Exit the process if we can't connect — the app can't run without a DB
    process.exit(1);
  }
};

module.exports = connectDB;
