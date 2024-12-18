"use client";
import { useEffect, useState } from "react";

const PurseAndTeamInfo = ({ team }: { team: string }) => {
  const [teamNameState, setTeamNameState] = useState(team);
  const [remainingPurseState, setRemainingPurseState] = useState<number | null>(null);
  const [rtmCardsState, setRtmCardsState] = useState<number | null>(null);

  useEffect(() => {
    console.log("Fetching data for team:", team);

    const fetchTeamInfo = async () => {
      try {
        const response = await fetch(`http://localhost:5000/dashboard/team-info?team=${team}`);
        if (!response.ok) {
          throw new Error("Failed to fetch team info");
        }
        
        const data = await response.json();
        console.log("API response data:", data);

        // Since the response is an array, we access the first object
        if (data && data.length > 0) {
          const teamInfo = data[0];
          
          setTeamNameState(teamInfo.teamName || team);
          setRemainingPurseState(teamInfo.remainingPurse ?? 0); // Default to 0 if undefined
          setRtmCardsState(teamInfo.rtmCardsLeft ?? 0); // Default to 0 if undefined
        } else {
          console.error("API response doesn't contain team info");
        }
      } catch (error) {
        console.error("Error fetching team info:", error);
      }
    };

    // Fetch data if team is valid
    if (team) {
      fetchTeamInfo();
    }

  }, [team]); // Dependency on 'team' to re-fetch when team changes

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Purse and Team Info</h2>
      <p className="mb-2 text-gray-700">
        <span className="font-bold">Remaining Purse:</span>{" "}
        {remainingPurseState !== null ? `${remainingPurseState / 10000000} Cr` : "Loading..."}
      </p>
      <p className="mb-2 text-gray-700">
        <span className="font-bold">Team Name:</span> {teamNameState || "Loading..."}
      </p>
      <p className="text-gray-700">
        <span className="font-bold">RTM Cards Left:</span>{" "}
        {rtmCardsState !== null ? rtmCardsState : "Loading..."}
      </p>
    </div>
  );
};

export default PurseAndTeamInfo;





