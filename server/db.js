// db.js
const mongoose = require('mongoose');


// Load environment variables from a .env file


const connectDB = async () => {
  try {
    // Connect to MongoDB using the URI from the environment file
    await mongoose.connect("mongodb://localhost:27017/");
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
