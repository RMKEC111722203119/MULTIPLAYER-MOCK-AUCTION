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

  // Fetch players from API
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch(`http://localhost:5000/dashboard/players?team=${team}`);
        const data = await response.json();
        setPlayers(data);
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    };

    const fetchTeamInfo = async () => {
      try {
        const response = await fetch(`http://localhost:5000/dashboard/team-info?team=${team}`);
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

  const priceDistribution = [18, 14, 11, 18, 14, 4]; // Fixed price distribution

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

  // Handle submit to lock the selections
  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Iterate through selected players and submit each one individually
      for (let index = 0; index < selectedPlayers.length; index++) {
        const player = selectedPlayers[index];
        const payload = {
          ...player,
          soldStatus: 'sold',
          soldPrice: priceDistribution[index]*10000000, // Price based on index
          soldTeam: team, // Team from props
        };

        if(payload.capStatus=="Uncapped"){
          payload.soldPrice = 40000000;
        }

        // Make API call to "/sell" for each player
        const response = await fetch("http://localhost:5000/dashboard/update-rtm", {
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
    <div className="p-2 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-lg font-small text-center mb-3 text-blue-600">Retain Players</h2>

      {/* ComboBox for selecting players */}
      {!isSubmitted && (
        <div className="mb-3">
          <label htmlFor="player" className="block text-sm font-medium text-gray-700">
            Retain Player
          </label>
          <select
            id="player"
            className="mt-1 block w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {/* Display selected players in 3-column grid */}
      <div className="mb-3">
        <h3 className="font-medium text-sm text-gray-800">Selected Players:</h3>
        <div className="grid grid-cols-3 gap-2">
          {selectedPlayers.map((player, index) => {
            const price = priceDistribution[index];
            return (
              <div
                key={`${player.firstName},${player.surname},${player.dob}`}
                className="bg-white p-2 rounded-md shadow-sm flex flex-col items-center justify-center"
              >
                <span className="font-medium text-sm text-gray-800">
                  {player.firstName} {player.surname}
                </span>
                <span className="text-sm font-semibold text-green-600">{price} Cr</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit Button */}
      {!isSubmitted && selectedPlayers.length > 0 && (
        <button
          className={`mt-3 w-full p-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 focus:outline-none ${
            isSubmitting ? 'animate-pulse' : ''
          }`}
          onClick={handleSubmit}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Selections'}
        </button>
      )}

      {isSubmitted && (
        <div className="mt-3 text-center text-green-600 font-semibold animate-fadeIn">
          <p>Selections submitted successfully!</p>
        </div>
      )}
    </div>
  );
};

export default Retention;
