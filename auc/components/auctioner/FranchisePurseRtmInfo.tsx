"use client";

import { useEffect, useState } from "react";

const FranchisePurseRTMInfo = () => {
  const [franchises, setFranchises] = useState<
    { teamName: string; remainingPurse: string; rtmCardsLeft: number }[]
  >([]);

  useEffect(() => {
    const fetchFranchise = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Auctioneer/franchises`);
        const data = await response.json();
        console.log("Fetched data:", data); // Debug API response
        setFranchises(Array.isArray(data) ? data : []); // Handle non-array responses
      } catch (error) {
        console.error("Error fetching franchises:", error);
        setFranchises([]); // Fallback to empty array in case of error
      }
    };

    fetchFranchise();
  }, []); // Dependency array ensures it only runs once

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300 col-span-3">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Franchise Purse & RTM Info</h2>
      <table className="w-full text-center border-collapse">
        <thead>
          <tr className="bg-gray-700 text-white">
            <th className="px-4 py-2">Franchise</th>
            <th className="px-4 py-2">Remaining Purse</th>
            <th className="px-4 py-2">RTM Cards Left</th>
          </tr>
        </thead>
        <tbody>
          {franchises.map((franchise, index) => (
            <tr key={index} className="hover:bg-gray-100">
              <td className="px-4 py-2 text-gray-700">{franchise.teamName}</td>
              <td className="px-4 py-2 text-gray-700">{franchise.remainingPurse}</td>
              <td className="px-4 py-2 text-gray-700">{franchise.rtmCardsLeft}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FranchisePurseRTMInfo;
