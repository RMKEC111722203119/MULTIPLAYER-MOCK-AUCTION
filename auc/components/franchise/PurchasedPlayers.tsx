"use client";

import React, { useState, useEffect } from 'react';

const PurchasedPlayers = ({ team }: { team: string }) => {
  interface PlayerDetails {
    _id: string;
    firstName: string;
    surname: string;
    specialism: string;
    soldPrice: number;
    soldTeam: string;
  }

  interface Player {
    _id: string;
    soldTeam: string;
    soldPrice: number;
    playerDetails: PlayerDetails[];
  }

  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auctioneer/sold-player?team=${team}`);
        const data = await response.json();
        setPlayers(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPlayers();
  }, [team]);

  // Group players by specialism
  const groupedPlayers = players.reduce((groups, player) => {
    const playerDetail = player.playerDetails[0]; // Get player details from the array
    const { specialism } = playerDetail;
    if (!groups[specialism]) {
      groups[specialism] = [];
    }
    groups[specialism].push(playerDetail);
    return groups;
  }, {} as Record<string, PlayerDetails[]>);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300 col-span-3">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Purchased Players</h2>
      <table className="w-full text-center border-collapse">
        <thead>
          <tr className="bg-gray-700 text-white">
            <th className="px-4 py-2">Batsman</th>
            <th className="px-4 py-2">Bowler</th>
            <th className="px-4 py-2">Wicketkeeper (WK)</th>
            <th className="px-4 py-2">All-rounder</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            {/* Display Batsmen */}
            <td className="text-gray-700">
              {groupedPlayers['BATTER']?.map((player) => (
                <div key={player._id}>
                  {player.firstName} {player.surname} - ₹{player.soldPrice / 100000}
                </div>
              ))}
            </td>

            {/* Display Bowlers */}
            <td className="text-gray-700">
              {groupedPlayers['BOWLER']?.map((player) => (
                <div key={player._id}>
                  {player.firstName} {player.surname} - ₹{player.soldPrice / 100000}
                </div>
              ))}
            </td>

            {/* Display Wicketkeepers */}
            <td className="text-gray-700">
              {groupedPlayers['WICKETKEEPER']?.map((player) => (
                <div key={player._id}>
                  {player.firstName} {player.surname} - ₹{player.soldPrice / 100000}
                </div>
              ))}
            </td>

            {/* Display All-rounders */}
            <td className="text-gray-700">
              {groupedPlayers['ALL-ROUNDER']?.map((player) => (
                <div key={player._id}>
                  {player.firstName} {player.surname} - ₹{player.soldPrice / 100000}
                </div>
              ))}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PurchasedPlayers;
