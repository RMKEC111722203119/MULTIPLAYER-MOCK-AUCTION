import { useEffect, useState } from 'react';

const SoldPlayers = () => {
  const [soldPlayers, setSoldPlayers] = useState<Array<{
    _id: string;
    player: string;
    soldTeam: string;
    soldPrice: number;
    playerDetails: Array<{
      _id: string;
      firstName: string;
      surname: string;
      country: string;
      age: number;
      specialism: string;
      battingStyle: string;
      reservePrice: number;
    }>;
  }>>([]);

  useEffect(()=>{
        const fetchSoldPlayers = async () => {
          const response = await fetch("http://localhost:5000/auctioneer/sold-players");
          const data = await response.json();
          setSoldPlayers(data);
        };
        fetchSoldPlayers()
  
      }, [])

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300 col-span-3">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Sold Players</h2>
      <table className="w-full text-center border-collapse">
        <thead>
          <tr className="bg-gray-700 text-white">
            <th className="px-4 py-2">Player</th>
            <th className="px-4 py-2">Price</th>
            <th className="px-4 py-2">Franchise</th>
          </tr>
        </thead>
        <tbody>
          {soldPlayers.map((player, index) => (
            <tr key={index} className="hover:bg-gray-100">
              <td className="px-4 py-2 text-gray-700">{player.playerDetails[0].firstName} {player.playerDetails[0].surname}</td>
              <td className="px-4 py-2 text-gray-700">{player.soldPrice}</td>
              <td className="px-4 py-2 text-gray-700">{player.soldTeam}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SoldPlayers;