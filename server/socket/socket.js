const { Player, SoldPlayer, UnsoldPlayer, Team } = require("../models/schema");

let currentPlayer = null;
let highestBid = 2000000;
let highestBidTeam = "";
let TeamsInterest = {
  "Chennai Super Kings": "neutral",
  "Delhi Capitals": "neutral",
  "Kolkata Knight Riders": "neutral",
  "Mumbai Indians": "neutral",
  "Punjab Kings": "neutral",
  "Rajasthan Royals": "neutral",
  "Royal Challengers Bangalore": "neutral",
  "Sunrisers Hyderabad": "neutral",
  "Lucknow Super Giants": "neutral",
  "Gujarat Titans": "neutral",
};
let interestedCount = 0;
let notInterestedCount = 0;


// Export a function to handle the Socket.IO server
module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Send the current state of the auction to the new client
    socket.emit("playerSelected", currentPlayer);
    socket.emit("updateBid", { amount: highestBid, teamName: highestBidTeam });

    socket.on("getAuctionState", (callback) => {
      callback({
        currentPlayer,
        highestBid,
        highestBidTeam,
        interestedCount,
        notInterestedCount,
      });
    });

    const updateInterestCounts = () => {
      interestedCount=0;
      notInterestedCount=0;
      for (const key in TeamsInterest) {
        
        if (TeamsInterest[key] === "Interested") {
          interestedCount++;
          console.log("Interested Teams:", interestedCount);
        }
        
        if (TeamsInterest[key] === "Not Interested") {
          notInterestedCount++;
        }
      }
      io.emit("InterestedTeams", {interestedCount});
      io.emit("NotInterestedTeams", {notInterestedCount});
      console.log("Interested Teams:", interestedCount);
      console.log("Not Interested Teams:", notInterestedCount);
      console.log("Teams Interest:", TeamsInterest);
    };
    socket.on("InterestedInPlayer", ({ teamName }) => {
      console.log("Interested in Player:", teamName);
      
      if (TeamsInterest[teamName]) {
        TeamsInterest[teamName] = "Interested";
      }
   
      updateInterestCounts();
    });
    
    socket.on("NeutralInterestedInPlayer", ({ teamName }) => {
      console.log("NeutralInterestedInPlayer:", teamName);
      if (TeamsInterest[teamName]) {
      TeamsInterest[teamName] = "neutral";
      }
      updateInterestCounts();
    });
    
    socket.on("NotInterestedInPlayer", ({ teamName }) => {
      console.log("Not Interested in Player:", teamName);
      if (TeamsInterest[teamName]) {
      TeamsInterest[teamName] = "Not Interested";
      }
      updateInterestCounts();
    });

  socket.on("selectPlayer", (player) => {
      console.log("Player selected:", player);
      currentPlayer = player; // Update the current player
      highestBid = player.reservePrice*100000; // Set the highest bid to the player's base price
      highestBidTeam = ""; // Reset the highest bid team
      const msg = `Player ${currentPlayer.firstName} ${currentPlayer.surname}  is up for auction.`;
      console.log(`New Player: ${player.name}`);
      


      // Emit the updated player selection and initial bid information to all clients
      io.emit("playerSelected", currentPlayer);
      io.emit("AuctionStatus", msg);
      io.emit("updateBid", { amount: highestBid, teamName: highestBidTeam });
    });

    // Listen for bid updates from teams
    socket.on("placeBid", ({ amount, teamName }) => {
      if (!currentPlayer) {
        console.log("Wait for auctioneer to select a player.");
        return;
      }

      if(highestBidTeam!=""){
        if(amount==0){
          console.log("Invalid bid:", amount);
          console.log("Invalid bid:", highestBidTeam);
          return;
        }
      }
      // Log the incoming bid amount to check if it's valid
      console.log(`Received bid: ${amount} from ${teamName}`);

      // Ensure the bid amount is a valid number
      const bidAmount = parseFloat(amount);
      // if(highestBid>=(highestBid+bidAmount)){
      //   console.log("Invalid bid: ₹"+amount+". Bid amount should be greater than the current highest bid.");
      //   return;
      // }
      if (teamName === highestBidTeam) {
        console.log(`Invalid bid: ₹${amount}. ${teamName} is already the highest bidder.`);
        return;
      }

      if((bidAmount ==0 && highestBid == currentPlayer.reservePrice*100000)||(bidAmount>0)){
      highestBid += bidAmount;
      
      highestBidTeam = teamName; // Update the highest bid team

      console.log(`New bid: ₹${highestBid} by ${teamName}`);
      }
      // Emit the updated bid information to all clients
        io.emit("updateBid", { amount: highestBid, teamName });
      }
    );

    // Listen for auctioneer actions (Sell, RTM, Unsold)
    socket.on("auctionAction", async ({ player, action }) => {
      console.log(`Auctioneer action: ${action}`);
      
      // Process the auction action
      if (action === "sell") {
        const msg="Player "+ player.firstnName + " "+player.surname+"sold to "+highestBidTeam+" for ₹"+highestBid;
        io.emit("AuctionStatus", msg); 

        try{

          const team = await Team.findOne({ teamName: highestBidTeam }, { remainingPurse: 1 });
          let purse = team ? team.remainingPurse : 0;

          if(purse>=highestBid){
            
            if(await SoldPlayer.findOne({ player })) {
              console.log("player already Sold");
              }
              else{
            const updatedPlayer = await Player.findOneAndUpdate(
              { firstName: player.firstName, surname: player.surname, dob: player.dob },
              { soldStatus:"sold", soldPrice: highestBid, soldTeam: highestBidTeam },
              { new: true, runValidators: true }
          );
        }
            
            purse = purse - highestBid;
            const updatedTeam = await Team.findOneAndUpdate(
              { teamName: highestBidTeam },
              { remainingPurse: purse },
              { new: true, runValidators: true }

          );
             
            player.soldStatus = "sold";
            player.soldPrice = highestBid;
            player.soldTeam = highestBidTeam;

            if(await SoldPlayer.findOne({ player })) {
              console.log("player already unsold");
              }
            else{
          const soldPlayer = new SoldPlayer({ player, soldPrice: highestBid, soldTeam: highestBidTeam });
          await soldPlayer.save();
        }
        
        console.log(msg);
      
          }
          else{
            const msg="Team "+highestBidTeam+" has insufficient funds to buy "+player.firstName+" for ₹"+highestBid;
            console.log(msg);
            io.emit("AuctionStatus", msg);
          }
      
        }catch(err){
          console.log(err);
        }
      } 
      
      
      
      
      else if (action === "rtm") {
        const msg=`RTM approached for player ${player.firstName} ${player.surname} `;
        console.log(msg);
        io.emit("AuctionStatus", msg);

        
      }
    
    
    
      else if (action === "unsold") {
        const updatedPlayer = await Player.findOneAndUpdate(
          { firstName: player.firstName, surname: player.surname, dob: player.dob },
          { soldStatus:"unsold" },
          { new: true, runValidators: true }
            );
          player.soldStatus = "Unsold";
        if(await UnsoldPlayer.findOne({ player })) {
            console.log("player already unsold");
            }
          else{
            const unsoldPlayer = new UnsoldPlayer({ player, soldPrice: highestBid, soldTeam: highestBidTeam });
            await unsoldPlayer.save();
          }
      const msg="Player "+player.firstName+" "+player.surname+" remains unsold.";
      console.log(msg);
      io.emit("AuctionStatus", msg);
      }

      // Reset auction state after the action
      currentPlayer = null;
      highestBid = 0;
      highestBidTeam = "";

      // Emit the reset state to all clients
      io.emit("playerSelected", currentPlayer);
      io.emit("updateBid", { amount: highestBid, teamName: highestBidTeam });

      // Reset TeamsInterest to neutral
      for (const team in TeamsInterest) {
        TeamsInterest[team] = "neutral";
      }
      interestedCount = 0;
      notInterestedCount = 0;
      io.emit("InterestedTeams", interestedCount);
      io.emit("NotInterestedTeams", notInterestedCount);
    });

    socket.on('finalAlert', (alertMessage) =>{
      console.log("Final Alert:", alertMessage);
      socket.broadcast.emit('finalAlertMessage', alertMessage);
    })
    

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });
};
