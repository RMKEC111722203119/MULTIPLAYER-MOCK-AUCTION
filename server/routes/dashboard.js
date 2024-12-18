const express = require('express');
const router = express.Router();

const { Player, SoldPlayer, UnsoldPlayer, Team } = require("../models/schema");

//10 ipl team full name in var variable with false value




router.get('/team-info', async (req, res) => {
    try {;
        let { team } = req.query; // No 'await' needed
        team = team.trim();
        team=team.replace(/%20/g," ");
        //console.log("Team queried:", team);
        if (!team) {
            return res.status(400).json({ message: "Team name is required in query parameters." });
        }

        const TeamInfo = await Team.find({ teamName: team }, { teamName: 1, remainingPurse: 1, rtmCardsLeft: 1 });
      

        res.json(TeamInfo);
    } catch (error) {
        console.error("Error fetching team data:", error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/players', async (req, res) => {
    try {
        let { team } = req.query;
        team = team.trim();
        team=team.replace(/%20/g," ");
        if (!team) {
            return res.status(400).json({ message: "Team name is required in query parameters." });
        }

        const player = await Player.find({ previousTeam: team });

        res.json(player);
    } catch (error) {
        console.error("Error fetching player data:", error);
        res.status(500).json({ message: error.message });
    }
});



router.post('/update-rtm', async (req, res) => {
    try {
        const payload = req.body;
        const team = await Team.findOne({ teamName: payload.soldTeam });
        if (!team) {
            return res.status(404).json({ message: "Team not found." });
        }
        let rtm = await Team.findOne({ teamName: payload.soldTeam }, { rtmCardsLeft: 1 });
        if (rtm && rtm.rtmCardsLeft > 0) {
            rtm = rtm.rtmCardsLeft - 1;
            if (isNaN(rtm)) {
                console.log("Invalid RTM cards value.");
                return res.status(400).json({ message: "Invalid RTM cards value." });
            }
            const updatedTeam = await Team.findOneAndUpdate(
                { teamName: payload.soldTeam },
                { rtmCardsLeft: rtm },
                { new: true }
            );
        } else {
            return res.status(400).json({ message: "No RTM cards left." });
        }

        const purs = await Team.findOne({ teamName: payload.soldTeam }, { remainingPurse: 1 });
        let purse = purs ? purs.remainingPurse : 0;
        
        
        if(purse>=payload.soldPrice){


            if(await SoldPlayer.findOne({payload })) {
                console.log("player already Sold");
                }
                else{
                const updatedPlayer = await Player.findOneAndUpdate(
                { firstName: payload.firstName, surname: payload.surname, dob: payload.dob },
                { soldStatus:"sold", soldPrice: payload.soldPrice, soldTeam: payload.soldTeam },
                { new: true, runValidators: true }
            );
            }

            purse = purse - payload.soldPrice;
            const updatedTeam = await Team.findOneAndUpdate(
                { teamName: payload.soldTeam },
                { remainingPurse: purse },
                { new: true, runValidators: true }
            );

            if(await SoldPlayer.findOne({ payload })) {
              console.log("player already unsold");
           }
            else{
                const soldPlayer = new SoldPlayer({ player: payload._id, soldPrice: payload.soldPrice, soldTeam: payload.soldTeam });
                await soldPlayer.save();
                }
                //     console.log(`Player ${player.name} sold to ${highestBidTeam} for ₹${highestBid}`);

        
               
            res.status(200).json({ message: "RTM card updated successfully." });

     }
     else{
        console.log("Team "+payload+" has insufficient funds to buy "+payload.firstname+" for ₹"+payload.soldPrice);
        res.status(400).json({ message: "Team has insufficient funds to buy player." });
         }

           }
           
    catch(err){
          console.log(err);
        }
      } 

);

        

module.exports = router;