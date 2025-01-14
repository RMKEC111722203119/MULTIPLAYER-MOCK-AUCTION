"use client";
import socket from "../../socket/socket"; // Import the shared socket connection

interface BidOptionsProps {
  team: string;
}

const BidOptions = ({ team }: BidOptionsProps) => {
  // Bid amounts in Lakhs (mapped to their corresponding numeric values)
  const bidAmounts: Record<string, number> = {
    "10 Lakhs": 1000000,
    "25 Lakhs": 2500000,
    // "50 Lakhs": 5000000,
    // "100 Lakhs": 10000000,
    "basePrice": 0
  };

  // Emit the bid when a button is clicked
  const handleBid = (amount: number, teamName: string) => {
    socket.emit("placeBid", { amount, teamName });
    console.log(amount)
  };

  const handleIntrested =(teamName:string)=>{
    socket.emit("InterestedInPlayer", {teamName})
  }
  const handleNeutralIntrest =(teamName:string)=>{
    socket.emit("NeutralInterestedInPlayer", {teamName})
  }

  const handleNotIntrested=(teamName:string)=>{
    socket.emit("NotInterestedInPlayer", {teamName})
  }



  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Bid Options</h2>
      <div className="flex flex-wrap gap-4">
        {Object.entries(bidAmounts).map(([amountLabel, amountValue]) => (
          <button
            key={amountLabel}
            className="bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-700"
            onClick={() => handleBid(amountValue, team)} // Send the bid to the server
          >
            ₹{amountLabel}
          </button>
          ))}
          <button className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700" onClick={()=>handleIntrested(team)}>Intrested</button>
          <button className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700" onClick={()=>handleNeutralIntrest(team)}>Neutral</button>
          <button className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700" onClick={()=>handleNotIntrested(team)}>Not Intrested</button>
        
      </div>
    </div>
  );
};

export default BidOptions;
