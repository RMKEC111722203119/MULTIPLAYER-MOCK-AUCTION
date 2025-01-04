const { Player, SoldPlayer, UnsoldPlayer, Team } = require("../models/schema");

let currentPlayer = null;
let highestBid = 2000000;
let highestBidTeam = "";

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
      });
    });

    socket.on("selectPlayer", (player) => {
      console.log("Player selected:", player);
      currentPlayer = player; // Update the current player
      highestBid = player.reservePrice*100000; // Set the highest bid to the player's base price
      highestBidTeam = ""; // Reset the highest bid team

      console.log(`Player selected: ${player.name}`);

      // Emit the updated player selection and initial bid information to all clients
      io.emit("playerSelected", currentPlayer);
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
        console.log(`Player ${player.name} sold to ${highestBidTeam} for ₹${highestBid}`);
          }
          else{
            console.log("Team "+highestBidTeam+" has insufficient funds to buy "+player.firstname+" for ₹"+highestBid);
          }
      
        }catch(err){
          console.log(err);
        }
      } 
      
      
      
      
      else if (action === "rtm") {
        console.log(`RTM used for player ${player.firstNamename}`);

        
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
         
      console.log(`Player ${player.firstName} remains unsold.`);
      }

      // Reset auction state after the action
      currentPlayer = null;
      highestBid = 0;
      highestBidTeam = "";

      // Emit the reset state to all clients
      io.emit("playerSelected", currentPlayer);
      io.emit("updateBid", { amount: highestBid, teamName: highestBidTeam });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });
};
