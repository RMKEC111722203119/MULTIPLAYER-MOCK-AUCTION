
const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
// Player Schema
const playerSchema = new mongoose.Schema({
  setNumber: { type: Number },
  setYear: { type: String, required: true },
  firstName: { type: String, required: true },
  surname: { type: String, required: true },
  country: { type: String, required: true },
  dob: { type: String, required: false }, // e.g., "08-09-1990"
  age: { type: Number, required: true },
  specialism: { type: String, required: true },
  battingStyle: { type: String },
  bowlingStyle: { type: String ,default:"none"},
  testCaps: { type: Number, default: 0 },
  previousTeam: { type: String },
  capStatus: { type: String, required: true },
  reservePrice: { type: Number, required: true },
  soldStatus: { type: String, default: "Waiting" }, 
  soldPrice: {type: Number,default:0},
  soldTeam: {type:String}

});

// Sold Player Schema
const soldPlayerSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
  soldTeam: { type: String, required: true },
  soldPrice: { type: Number, required: true },
});

// Unsold Player Schema
const unsoldPlayerSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
});

// Upcoming Player Schema
const upcomingPlayerSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
});

// Team Schema
const teamSchema = new mongoose.Schema({
  teamName: { type: String, required: true, unique: true },
  remainingPurse: { type: Number, required: true },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: "SoldPlayer" }],
  rtmCardsLeft: { type: Number, required: true },
});

playerSchema.plugin(mongoosePaginate);

// Export Models
module.exports = {
  Player: mongoose.model("Player", playerSchema),
  SoldPlayer: mongoose.model("SoldPlayer", soldPlayerSchema),
  UnsoldPlayer: mongoose.model("UnsoldPlayer", unsoldPlayerSchema),
  UpcomingPlayer: mongoose.model("UpcomingPlayer", upcomingPlayerSchema),
  Team: mongoose.model("Team", teamSchema),
};
