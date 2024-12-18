"use client";
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { FaGavel, FaUsers, FaMoneyBillWave } from 'react-icons/fa';
import socket from '@/socket/socket';
import axios from 'axios';

interface Player {
  firstName: string;
  surname: string;
  specialism: string;
  reservePrice: number;
  country: string;
  // ...additional fields as needed
}

const teamColors: { [key: string]: string } = {
  "Mumbai Indians": "text-blue-500",
  "Chennai Super Kings": "text-yellow-500",
  "Delhi Capitals": "text-blue-600",
  "Royal Challengers Bangalore": "text-red-600",
  "Kolkata Knight Riders": "text-purple-700",
  "Rajasthan Royals": "text-pink-500",
  "Sunrisers Hyderabad": "text-orange-500",
  "Punjab Kings": "text-red-500",
  "Lucknow Super Giants": "text-cyan-600",
  "Gujarat Titans": "text-teal-500",
};

const AuctionSpace = () => {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [highestBid, setHighestBid] = useState<number>(0);
  const [highestBidTeam, setHighestBidTeam] = useState<string>('');
  const pathname = usePathname();
  const [isAuctioneer, setIsAuctioneer] = useState<boolean>(true);
  const [showRtmCard, setShowRtmCard] = useState(false);
  const [rtmAmount, setRtmAmount] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState('');

  const teamNames = [
    "Mumbai Indians",
    "Chennai Super Kings",
    "Delhi Capitals",
    "Royal Challengers Bangalore",
    "Kolkata Knight Riders",
    "Rajasthan Royals",
    "Sunrisers Hyderabad",
    "Punjab Kings",
    "Lucknow Super Giants",
    "Gujarat Titans",
  ];

  useEffect(() => {
    if (pathname === '/Auctioneer') {
      setIsAuctioneer(true);
    } else {
      setIsAuctioneer(false);
    }
  }, [pathname]);

useEffect(() => {
    socket.emit("getAuctionState", (data: { currentPlayer: Player | null; highestBid: number; highestBidTeam: string }) => {
        setCurrentPlayer(data.currentPlayer);
        setHighestBid(data.highestBid);
        setHighestBidTeam(data.highestBidTeam);
    });

    socket.on('playerSelected', (player: Player) => {
      setCurrentPlayer(null); // Trigger exit animation
      setTimeout(() => {
        setCurrentPlayer(player); // Trigger enter animation
        setHighestBid(player.reservePrice);
        setHighestBidTeam('');
      }, 300); // Match this duration with the exit animation duration
    });

    socket.on('updateBid', ({ amount, teamName }) => {
      setHighestBid(amount);
      setHighestBidTeam(teamName);
    });

    return () => {
      socket.off('playerSelected');
      socket.off('updateBid');
    };
  }, []); // Added missing closing parenthesis and semicolon

  const handleAuctionAction = (action: string) => {
    if (currentPlayer) {
      socket.emit('auctionAction', { player: currentPlayer, action });
    }
  };

  const handleRtmClick = () => {
    setShowRtmCard(true);
  };

  const handleRtmSubmit = async () => {
    if (currentPlayer) {
      const updatedPlayer = { ...currentPlayer, soldStatus: "sold", soldPrice: rtmAmount, soldTeam: selectedTeam };
      try {
        await axios.post("http://localhost:5000/auctioneer/rtm", {
          payload: updatedPlayer,
        });
      } catch (error) {
        window.alert("Error submitting RTM: " + error);
      }
      handleAuctionAction('rtm');
    }
    setShowRtmCard(false);
  };
   

  const handleRtmCancel = () => {
    setShowRtmCard(false);
  };

  return (
    <div className="p-6 bg-gradient-to-r from-gray-100 to-gray-300 shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-center mb-6 text-indigo-600">Auction Space</h2>

      <div className="flex flex-col md:flex-row gap-6 w-full">
        {/* Display Current Player Info */}
        <div className="flex-1 bg-white p-6 rounded-lg shadow-md transition-transform transform hover:scale-105 animate-fadeIn">
          {currentPlayer ? (
            <>
              <h3 className="text-2xl text-gray-700  font-bold mb-4">{currentPlayer.firstName} {currentPlayer.surname}</h3>
              <p className="text-gray-700 mb-2">
                <FaUsers className="inline mr-2" />
                <strong>Role:</strong> {currentPlayer.specialism}
              </p>
              <p className="text-gray-700 mb-2">
                <FaMoneyBillWave className="inline mr-2" />
                <strong>Base Price:</strong> ₹{currentPlayer.reservePrice}
              </p>
              <p className="text-gray-700 mb-2">
                <FaGavel className="inline mr-2" />
                <strong>Country:</strong> {currentPlayer.country}
              </p>
            </>
          ) : (
            <p className="text-center text-gray-500">No player selected yet.</p>
          )}
        </div>

        {/* Display Current Bid Info */}
        <div className="flex-1 bg-white p-6 rounded-lg shadow-md transition-transform transform hover:scale-105 animate-fadeIn">
          <h3 className="text-xl text-gray-700 font-semibold mb-4">Current Bid</h3>
          <p className="text-gray-700 mb-2">
            <FaMoneyBillWave className="inline mr-2" />
            <strong>Highest Bid:</strong> ₹{highestBid / 100000} L
          </p>
          <p className={`text-gray-700 mb-2 ${teamColors[highestBidTeam] || ''}`}>
            <FaUsers className="inline mr-2" />
            <strong>Highest Bid Team:</strong> {highestBidTeam || 'N/A'}
          </p>
        </div>
      </div>

      {/* Auctioneer Controls (Visible only on /Auctioneer page) */}
      {isAuctioneer && (
        <div className="mt-6 flex gap-4 justify-center">
          <button
            onClick={() => handleAuctionAction('sell')}
            className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105"
          >
            Sell
          </button>
          <button
            onClick={handleRtmClick}
            className="bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-yellow-700 transition-transform transform hover:scale-105"
          >
            RTM
          </button>
          <button
            onClick={() => handleAuctionAction('unsold')}
            className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition-transform transform hover:scale-105"
          >
            Unsold
          </button>
        </div>
      )}
      {showRtmCard && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">RTM Details</h3>
            <input
              type="number"
              placeholder="Enter Amount"
              value={rtmAmount}
              onChange={(e) => setRtmAmount(Number(e.target.value))}
              className="mb-4 p-2 border rounded w-full"
            />
            <label htmlFor="teamSelect" className="mb-2 block font-semibold">Select Team</label>
            <select
              id="teamSelect"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="mb-4 p-2 border rounded w-full"
            >
              <option value="">Select Team</option>
              {teamNames.map((team) => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleRtmCancel}
                className="bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleRtmSubmit}
                className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionSpace;



