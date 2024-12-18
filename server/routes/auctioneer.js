const express = require('express');
const router = express.Router();

const { Player, SoldPlayer, UnsoldPlayer, Team } = require("../models/schema");

router.get('/franchises', async (_, res) => {
    try {
        const franchises = await Team.find({}, { teamName: 1, remainingPurse: 1, rtmCardsLeft: 1 });
        res.json(franchises);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//function to reset the Player, SoldPlayer, UnsoldPlayer, Team make player soldStatus to Waiting, soldTeam to null, soldPrice to 0, remainingPurse to 120000000, rtmCardsLeft to 6
router.post('/reset', async (_, res) => {
    try {
        await Player.updateMany({}, { soldStatus: "Waiting", soldTeam: null, soldPrice: 0 });
        await SoldPlayer.deleteMany({});
        await UnsoldPlayer.deleteMany({});
        await Team.updateMany({}, { remainingPurse: 1200000000, rtmCardsLeft: 6 });
        res.status(200).json({ message: "Auction reset successfully." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/sold-players', async (req, res) => {
    try {
        const soldPlayers = await SoldPlayer.aggregate([
            {
                $lookup: {
                    from: 'players', // Name of the Player collection
                    localField: 'player', // Field in SoldPlayer schema
                    foreignField: '_id', // Field in Player schema
                    as: 'playerDetails', // Alias for the joined data
                },
            },
        ]);

        res.status(200).json(soldPlayers);
    } catch (error) {
        console.error('Error fetching sold players:', error);
        res.status(500).json({ message: error.message });
    }
});


router.get('/sold-player', async (req, res) => {
    try {
        let { team } = req.query;

        // Validate and process the team parameter
        if (!team) {
            return res.status(400).json({ message: 'Team is required.' });
        }
        team = team.trim().replace(/%20/g, " ");

        // Perform aggregation to fetch sold players and their details
        const soldPlayers = await SoldPlayer.aggregate([
            {
                $match: { soldTeam: team }, // Match sold players belonging to the specified team
            },
            {
                $lookup: {
                    from: 'players', // Name of the Player collection
                    localField: 'player', // Field in SoldPlayer schema
                    foreignField: '_id', // Field in Player schema
                    as: 'playerDetails', // Alias for the joined data
                },
            },
        ]);

        res.status(200).json(soldPlayers);
    } catch (error) {
        console.error('Error fetching sold players:', error);
        res.status(500).json({ message: error.message });
    }
});


router.get('/upcoming-players', async (req, res) => {
    try {
        const { page = 1, limit = 20, sortBy = 'firstName', sortOrder = 'asc', search = '' } = req.query;

        // Construct the query to search based on name, specialism, and country
        const query = {
            soldStatus: 'Waiting',  // Ensure this field exists
            // Optional search conditions only if search term exists
            ...(search && {
            $or: [
                { firstName: { $regex: search, $options: 'i' } },
                { surname: { $regex: search, $options: 'i' } },
                { specialism: { $regex: search, $options: 'i' } },
                { country: { $regex: search, $options: 'i' } }
            ]
            })
        };

        // Pagination and sorting options
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: sortBy ? { [sortBy]: sortOrder === 'asc' ? 1 : -1 } : {}
        };

        // Fetch the upcoming players based on the query and options
        const upcomingPlayers = await Player.paginate(query, options);

        // Respond with the paginated players data
        res.json(upcomingPlayers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.post('/rtm', async (req, res) => {
    try {
        const {payload} = req.body;
        console.log("payload:",payload);

        const team = await Team.findOne({ teamName: payload.soldTeam });
        console.log("team:", team);
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