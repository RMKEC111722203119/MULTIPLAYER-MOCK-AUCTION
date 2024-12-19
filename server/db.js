// db.js
const mongoose = require('mongoose');


// Load environment variables from a .env file


const connectDB = async () => {
  try {
    // Connect to MongoDB using the URI from the environment file
    await mongoose.connect("mongodb+srv://root:1234@auction-backend.kejvt.mongodb.net/");
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
