import { useState, useEffect } from 'react';
import socket from '@/socket/socket';

const UnsoldPlayers = () => {
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

  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]); // Default as empty array
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const fetchUpcomingPlayers = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/Auctioneer/unsold-players?page=${currentPage}&limit=${pageSize}&sortBy=${sortBy}&sortOrder=${sortOrder}&search=${searchTerm}`
      );
      const data = await response.json();
      setPlayers(data.docs || []);  // Ensure players are always an array
      setTotalPages(data.totalPages || 1);
      setFilteredPlayers(data.docs || []);  // Ensure filteredPlayers is initialized
    };

    fetchUpcomingPlayers();
  }, [currentPage, pageSize, sortBy, sortOrder, searchTerm]);

  const handleSelectPlayer = (player: Player) => {
    if (socket) {
      socket.emit('selectPlayer', player);
      console.log(`Selected Player: ${player.firstName} ${player.surname}`);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSortChange = (column: string) => {
    const order = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(column);
    setSortOrder(order);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300 col-span-3">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">UnSold Players</h2>

      {/* Search Input */}
      <input
        type="text"
        className="mb-4 p-2 border border-gray-300 rounded-lg w-full"
        placeholder="Search players by name, role, or country..."
        value={searchTerm}
        onChange={handleSearchChange}
      />

      <table className="w-full text-center border-collapse">
        <thead>
          <tr className="bg-gray-700 text-white">
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSortChange('setNumber')}>
              Set No
            </th>
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSortChange('firstName')}>
              Name
            </th>
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSortChange('country')}>
              Country
            </th>
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSortChange('age')}>
              Age
            </th>
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSortChange('specialism')}>
              Specialism
            </th>
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSortChange('reservePrice')}>
              Reserve Price
            </th>
            <th className="px-4 py-2">Select</th>
          </tr>
        </thead>
        <tbody>
          {filteredPlayers && filteredPlayers.length > 0 ? (
            filteredPlayers.map((player, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="px-4 py-2 text-gray-700">{player.setNumber}</td>
                <td className="px-4 py-2 text-gray-700">{`${player.firstName} ${player.surname}`}</td>
                <td className="px-4 py-2 text-gray-700">{player.country}</td>
                <td className="px-4 py-2 text-gray-700">{player.age}</td>
                <td className="px-4 py-2 text-gray-700">{player.specialism}</td>
                <td className="px-4 py-2 text-gray-700">₹{player.reservePrice.toLocaleString('en-IN')}</td>
                <td className="px-4 py-2">
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    onClick={() => handleSelectPlayer(player)}
                  >
                    Select
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center py-4 text-gray-500">
                No players found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-600 text-white rounded disabled:bg-gray-300"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-600 text-white rounded disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default UnsoldPlayers;
