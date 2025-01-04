'use client';

import { useState, useEffect } from 'react';

interface Player {
  setNumber: number;
  setYear: string;
  firstName: string;
  surname: string;
  country: string;
  dob?: string;
  age: number;
  specialism: string;
  battingStyle?: string;
  bowlingStyle?: string;
  testCaps?: number;
  previousTeam?: string;
  capStatus: string;
  reservePrice: number;
  soldStatus?: string;
  soldPrice?: number;
  soldTeam?: string;
}

const Retention = ({ team }: { team: string }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priceDistribution, setPriceDistribution] = useState([18, 14, 11, 18, 14, 4]);

  // Fetch players from API
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/players?team=${team}`);
        const data = await response.json();
        setPlayers(data);
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    };

    const fetchTeamInfo = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/team-info?team=${team}`);
        const data = await response.json();
        const rtmCardsLeft = data[0].rtmCardsLeft;
        const isSubmitted = rtmCardsLeft === 6;
        console.log( "rtm: ", rtmCardsLeft, "isSubmitted: ", isSubmitted);
        setIsSubmitted(!isSubmitted);
      } catch (error) {
        console.error('Error fetching team info:', error);
      }
    };

    fetchPlayers();
    fetchTeamInfo();
  }, [team]);

  // Handle player selection
  const handleSelect = (playerKey: string) => {
    if (
      isSubmitted ||
      selectedPlayers.length >= 6 ||
      selectedPlayers.some(
        (p) => `${p.firstName},${p.surname},${p.dob}` === playerKey
      )
    )
      return;

    const [firstName, surname, dob] = playerKey.split(',');
    const player = players.find(
      (p) => p.firstName === firstName && p.surname === surname && p.dob === dob
    );

    if (player) {
      setSelectedPlayers([...selectedPlayers, player]);
    }
  };

  const handlePriceChange = (index: number, value: number) => {
    const newPriceDistribution = [...priceDistribution];
    newPriceDistribution[index] = value;
    setPriceDistribution(newPriceDistribution);
  };

  // Handle submit to lock the selections
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const defaultValues = [18, 14, 11, 18, 14, 4]; // same default array

    try {
      for (let index = 0; index < selectedPlayers.length; index++) {
        const player = selectedPlayers[index];
        let slotPrice = priceDistribution[index];
        let finalPrice = slotPrice * 10000000;

        // Ensure uncapped players default to 4 if user did not change the distribution
        if (player.capStatus === "Uncapped" && slotPrice === defaultValues[index]) {
          finalPrice = 40000000;
        }

        var payload = {
          ...player,
          soldStatus: 'sold',
          soldPrice: finalPrice,
          soldTeam: team,
        };

        // Make API call to "/sell" for each player
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/update-rtm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Failed to submit player selection');
        }
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      await new Promise(resolve => setTimeout(resolve, 5000));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-2 bg-gray-100 rounded-lg shadow-md transition-all duration-300 ease-in-out hover:shadow-lg">
      <h2 className="text-lg font-small text-center mb-3 text-blue-600">Retain Players</h2>

      {/* ComboBox for selecting players */}
      {!isSubmitted && (
        <div className="mb-3">
          <label htmlFor="player" className="block text-sm font-medium text-gray-700">
            Retain Player
          </label>
          <select
            id="player"
            className="mt-1 block w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            disabled={isSubmitted || selectedPlayers.length >= 6}
            onChange={(e) => handleSelect(e.target.value)}
          >
            <option value="">Select a player...</option>
            {players.map((player) => (
              <option
                key={`${player.firstName},${player.surname},${player.dob}`}
                value={`${player.firstName},${player.surname},${player.dob}`}
              >
                {player.firstName} {player.surname} ({player.country})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Display selected players with price controls */}
      <div className="mb-3">
        <h3 className="font-medium text-sm text-gray-800 transition-all duration-300">
          Selected Players:
        </h3>
        <div className="grid grid-cols-3 gap-2 transition-all duration-300">
          {selectedPlayers.map((player, index) => {
            const defaultValues = [18, 14, 11, 18, 14, 4];
            let price = priceDistribution[index];
            // Force 4 if uncapped and still at default array value
            if (player.capStatus === "Uncapped" && price === defaultValues[index]) {
              price = 4;
            }
            return (
              <div
                key={`${player.firstName},${player.surname},${player.dob}`}
                className="bg-white p-2 rounded-md shadow-sm flex flex-col items-center justify-center
                           transition-transform duration-300 ease-in-out hover:scale-105"
              >
                <span className="font-medium text-sm text-gray-800">
                  {player.firstName} {player.surname}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handlePriceChange(index, parseFloat(Math.max(0, price - 1).toFixed(2)))
                    }
                    className="px-2 text-sm bg-gray-200 rounded transition-colors duration-300 hover:bg-gray-300"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={price}
                    onChange={(e) =>
                      handlePriceChange(index, parseFloat(e.target.value || "0"))
                    }
                    className="w-16 text-sm text-center border rounded text-gray-900
                               transition-colors duration-300 hover:border-blue-500"
                  />
                  <button
                    onClick={() =>
                      handlePriceChange(index, parseFloat((price + 1).toFixed(2)))
                    }
                    className="px-2 text-sm bg-gray-200 rounded transition-colors duration-300 hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-gray-500">{player.capStatus}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit Button */}
      {!isSubmitted && selectedPlayers.length > 0 && (
        <button
          className={`mt-3 w-full p-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600
                     transition-colors duration-300 focus:outline-none ${
            isSubmitting ? 'animate-pulse' : ''
          }`}
          onClick={handleSubmit}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Selections'}
        </button>
      )}

      {isSubmitted && (
        <div className="mt-3 text-center text-green-600 font-semibold animate-fadeIn">
          <h3 className="text-lg font-small text-center mb-3">Retained Players:</h3>
          <ul>
            {selectedPlayers.map((player) => (
              <li key={`${player.firstName},${player.surname},${player.dob}`}>
                {player.firstName} {player.surname} - {player.country}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Retention;
