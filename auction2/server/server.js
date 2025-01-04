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
app.use(cors({
    origin: "*",
}));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Removed trailing slash
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"], // Allow all REST methods
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
server.listen(PORT, () => {
  console.log(`Socket.IO server running on http://localhost:${PORT}`);
});