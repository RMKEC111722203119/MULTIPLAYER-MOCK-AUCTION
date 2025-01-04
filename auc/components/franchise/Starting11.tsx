"use client";
import React, { useEffect, useState } from 'react';
import { FaUserAlt } from 'react-icons/fa';

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

interface Starting11Props {
  teamName: string;
}

// Apply a fixed white gradient background
const teamBackground = 'bg-gradient-to-r from-white to-gray-100';

const Starting11: React.FC<Starting11Props> = ({ teamName }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectionMode, setSelectionMode] = useState(true);

  // Initialize from localStorage if exists
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(() => {
    const saved = localStorage.getItem(`selected-players-${teamName}`);
    return saved ? JSON.parse(saved) : Array(11).fill('');
  });

  const [backups, setBackups] = useState<Record<number, string[]>>(() => {
    const saved = localStorage.getItem(`backup-players-${teamName}`);
    return saved ? JSON.parse(saved) : {};
  });

  // Save to localStorage whenever selections change
  useEffect(() => {
    localStorage.setItem(`selected-players-${teamName}`, JSON.stringify(selectedPlayers));
    localStorage.setItem(`backup-players-${teamName}`, JSON.stringify(backups));
  }, [selectedPlayers, backups, teamName]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auctioneer/sold-player?team=${teamName}`);
        const data = await response.json();
        setPlayers(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchPlayers();
  }, [teamName]);

  // Flatten all details
  const allDetails = players.map((p) => p.playerDetails).flat();

  // Filter out already selected or backup players
  const getAvailablePlayers = (currentIndex: number) => {
    const selectedIds = new Set(selectedPlayers);
    const backupIds = new Set(Object.values(backups).flat());
    selectedIds.delete(selectedPlayers[currentIndex]);
    return allDetails.filter((p) => !selectedIds.has(p._id) && !backupIds.has(p._id));
  };

  const handleStarterChange = (slotIndex: number, playerId: string) => {
    const updatedPlayers = [...selectedPlayers];
    updatedPlayers[slotIndex] = playerId;
    setSelectedPlayers(updatedPlayers);
  };

  const handleAddBackup = (slotIndex: number, backupId: string) => {
    if (!backupId) return;
    const updatedBackups = { ...backups };
    if (!updatedBackups[slotIndex]) {
      updatedBackups[slotIndex] = [];
    }
    updatedBackups[slotIndex].push(backupId);
    setBackups(updatedBackups);
  };

  const handleRemoveBackup = (slotIndex: number, backupId: string) => {
    const updatedBackups = { ...backups };
    updatedBackups[slotIndex] = updatedBackups[slotIndex].filter((id) => id !== backupId);
    if (updatedBackups[slotIndex].length === 0) {
      delete updatedBackups[slotIndex];
    }
    setBackups(updatedBackups);
  };

  const handleSubmit = () => {
    // Validate selected players, then switch to read-only
    setSelectionMode(false);
  };

  const handleEdit = () => {
    setSelectionMode(true);
  };

  return (
    <div className={`${teamBackground} w-full overflow-x-hidden`}>
        
      <div className="bg-white rounded-lg shadow-md border border-gray-300 w-full px-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center pb-4">
          {teamName} - Starting 11
        </h2>
        <br />
        {selectionMode ? (
          <div className="grid grid-cols-6 gap-4 mb-6">
            {selectedPlayers.map((selectedId, idx) => (
              <div key={idx} className="bg-white/20 rounded p-3 shadow-md transition-transform transform hover:scale-105">
                <div className="flex flex-col items-center pb-2">
                  <div className="relative mb-3">
                    <FaUserAlt className="text-3xl text-gray-800 shadow-xl transition-all duration-300 hover:shadow-2xl" />
                    <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-white rounded-full text-xs font-bold text-gray-800">
                      {idx + 1}
                    </span>
                  </div>
                  <label htmlFor={`starter-select-${idx}`} className="sr-only">Select player for position {idx + 1}</label>
                  <select
                    id={`starter-select-${idx}`}
                    className="w-full text-sm bg-white/90 rounded px-2 py-1 mb-2 text-gray-800 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedId}
                    onChange={(e) => handleStarterChange(idx, e.target.value)}
                  >
                    <option value="">Select player</option>
                    {getAvailablePlayers(idx).map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.firstName} {p.surname} - {p.specialism}
                      </option>
                    ))}
                  </select>

                  {/* Add Backup */}
                  <label htmlFor={`backup-select-${idx}`} className="sr-only">Add Backup for position {idx + 1}</label>
                  <select
                    id={`backup-select-${idx}`}
                    className="w-full text-xs bg-white/80 rounded px-2 py-1 text-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onChange={(e) => handleAddBackup(idx, e.target.value)}
                  >
                    <option value="">-- Add Backup --</option>
                    {getAvailablePlayers(idx).map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.firstName} {p.surname}
                      </option>
                    ))}
                  </select>

                  {/* Display existing backups */}
                  {(backups[idx] || []).length > 0 && (
                    <div className="mt-3 text-gray-700 text-sm space-y-1 w-full">
                      {(backups[idx] || []).map((bId) => {
                        const bPlayer = allDetails.find((x) => x._id === bId);
                        return (
                          <div
                            key={bId}
                            className="flex items-center justify-between bg-white/20 rounded px-2 py-1 transition-opacity duration-300 hover:bg-white/30"
                          >
                            <span className="text-gray-700">
                              {bPlayer?.firstName} {bPlayer?.surname}
                            </span>
                            <button
                              className="ml-2 text-red-500 hover:text-red-700"
                              onClick={() => handleRemoveBackup(idx, bId)}
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-4 mb-6">
            {selectedPlayers.map((playerId, idx) => {
              const player = allDetails.find((p) => p._id === playerId);
              return (
                <div key={idx} className="relative group bg-white/20 rounded p-3 shadow-md transition-transform transform hover:scale-105 flex flex-col items-center ">
                  <div className="relative mb-1">
                    <FaUserAlt className="text-3xl text-gray-800 shadow-xl transition-all duration-300 hover:shadow-2xl" />
                    <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-white rounded-full text-xs font-bold text-gray-800">
                      {idx + 1}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-800 text-center">
                    {player?.firstName} {player?.surname}
                  </div>
                  <div className="text-xs text-gray-600">{player?.specialism}</div>

                  {/* Hover for backups with animation */}
                  <div className="absolute z-10 left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white rounded shadow-xl p-2 border border-gray-200 animate-fadeIn">
                      <div className="font-bold text-gray-800 mb-1">Backup Players</div>
                      {backups[idx] && backups[idx].length > 0 ? (
                        backups[idx].map((bId) => {
                          const bPlayer = allDetails.find((p) => p._id === bId);
                          return (
                            <div key={bId} className="border-t border-gray-100 py-1 px-1 flex justify-between items-center">
                              <div className="text-sm text-gray-700">
                                {bPlayer?.firstName} {bPlayer?.surname}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-sm text-gray-500">No backups assigned</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-center gap-4 mt-4 mb-4">
          {selectionMode ? (
            <button
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded shadow transition-colors duration-300 transform hover:scale-105"
              onClick={handleSubmit}
            >
              Confirm Selection
            </button>
          ) : (
            <button
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded shadow transition-colors duration-300 transform hover:scale-105"
              onClick={handleEdit}
            >
              Modify Selection
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Starting11;
