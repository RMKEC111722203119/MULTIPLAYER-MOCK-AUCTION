const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { Player, SoldPlayer, UnsoldPlayer, UpcomingPlayer, Team } = require("./models/schema.js");
const connectDB = require("./db");
const cors = require("cors");
const auctioneer = require("./routes/auctioneer"); // Ensure correct import
const socketHandler = require("./socket/socket.js");
const dashboard = require("./routes/dashboard");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow requests from your Next.js app
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD" , "PATCH"], // Allow all REST methods
  },
});

connectDB();

// Attach the Socket.IO handler
socketHandler(io);

// Use the auctioneer routes
app.use("/auctioneer", auctioneer);
app.use("/dashboard", dashboard);

// Start the server
const PORT = 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Socket.IO server running on http://localhost:${PORT}`);
});