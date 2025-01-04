"use client";
import React, { useState, useEffect } from 'react';
import PurchasedPlayers from '@/components/franchise/PurchasedPlayers';
import Starting11 from '@/components/franchise/Starting11';

const TeamComparison = () => {
  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');
  const [showStarting11, setShowStarting11] = useState(false);
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);

  // Track voted positions and user sessions
  const [votedPositions, setVotedPositions] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('voted-positions');
    return new Set(saved ? JSON.parse(saved) : []);
  });

  const [userSessions, setUserSessions] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('user-voting-sessions');
    return saved ? JSON.parse(saved) : {};
  });

  const [currentSession, setCurrentSession] = useState(() => {
    return localStorage.getItem('current-session') || '1';
  });

  // Modified point state to track points per session
  const [playerPoints, setPlayerPoints] = useState<Record<string, Record<string, number>>>(() => {
    const saved = localStorage.getItem('player-comparison-points');
    return saved ? JSON.parse(saved) : {};
  });

  // Add scoring history state
  const [scoringHistory, setScoringHistory] = useState<Array<{
    session: string;
    winner: string;
    team1: string; // Added team1 name
    team2: string; // Added team2 name
    team1Points: number;
    team2Points: number;
  }>>(() => {
    const saved = localStorage.getItem('scoring-history');
    return saved ? JSON.parse(saved) : [];
  });

  // Modified session state to include draw option
  const [currentVotes, setCurrentVotes] = useState<Record<number, string>>({});

  useEffect(() => {
    localStorage.setItem('voted-positions', JSON.stringify(Array.from(votedPositions)));
    localStorage.setItem('player-comparison-points', JSON.stringify(playerPoints));
    localStorage.setItem('user-voting-sessions', JSON.stringify(userSessions));
    localStorage.setItem('current-session', currentSession);
    localStorage.setItem('scoring-history', JSON.stringify(scoringHistory));
  }, [votedPositions, playerPoints, userSessions, currentSession, scoringHistory]);

  // Calculate cumulative scores
  useEffect(() => {
    if (team1 && team2) {
      const team1Wins = scoringHistory.filter(s => s.winner === team1).length;
      const team2Wins = scoringHistory.filter(s => s.winner === team2).length;
      
      setTeam1Score(team1Wins);
      setTeam2Score(team2Wins);
    }
  }, [scoringHistory, team1, team2]);

  const handleVote = (teamName: string, playerIndex: number) => {
    if (votedPositions.has(playerIndex)) {
      return; // Position already voted
    }

    setVotedPositions(prev => new Set([...prev, playerIndex]));
    setCurrentVotes(prev => ({
      ...prev,
      [playerIndex]: teamName
    }));

    // If all positions are voted, calculate session winner
    if (votedPositions.size === 10) {
      const team1Votes = Object.values(currentVotes).filter(team => team === team1).length;
      const team2Votes = Object.values(currentVotes).filter(team => team === team2).length;
      
      let sessionWinner = 'draw';
      if (team1Votes > team2Votes) sessionWinner = team1;
      else if (team2Votes > team1Votes) sessionWinner = team2;

      // Update scoring history with team names
      setScoringHistory(prev => [...prev, {
        session: currentSession,
        winner: sessionWinner,
        team1: team1, // Added team1 name
        team2: team2, // Added team2 name
        team1Points: team1Votes,
        team2Points: team2Votes
      }]);

      // Start new session
      const nextSession = String(Number(currentSession) + 1);
      setCurrentSession(nextSession);
      setVotedPositions(new Set());
      setCurrentVotes({});
    }
  };

  // Reset voting function
  const resetVoting = () => {
    setPlayerPoints({});
    setScoringHistory([]);
    setVotedPositions(new Set());
    setCurrentSession('1');
    setCurrentVotes({});
    localStorage.removeItem('player-comparison-points');
    localStorage.removeItem('scoring-history');
    localStorage.removeItem('voted-positions');
    localStorage.removeItem('current-session');
  };

  // Handle skip voting
  const handleSkipVote = (playerIndex: number) => {
    if (votedPositions.has(playerIndex)) return;
    setVotedPositions(prev => new Set([...prev, playerIndex]));
    setCurrentVotes(prev => ({
      ...prev,
      [playerIndex]: 'skip'
    }));

    // If all positions are voted, calculate session winner
    if (votedPositions.size + 1 === 11) {
      const team1Votes = Object.values(currentVotes).filter(team => team === team1).length;
      const team2Votes = Object.values(currentVotes).filter(team => team === team2).length;

      let sessionWinner = 'draw';
      if (team1Votes > team2Votes) sessionWinner = team1;
      else if (team2Votes > team1Votes) sessionWinner = team2;

      // Update scoring history with team names
      setScoringHistory(prev => [...prev, {
        session: currentSession,
        winner: sessionWinner,
        team1: team1, // Added team1 name
        team2: team2, // Added team2 name
        team1Points: team1Votes,
        team2Points: team2Votes
      }]);

      // Start new session
      const nextSession = String(Number(currentSession) + 1);
      setCurrentSession(nextSession);
      setVotedPositions(new Set());
      setCurrentVotes({});
    }
  };

  const VotingButtons = ({ teamName, playerIndex }: { teamName: string, playerIndex: number }) => (
    <div className="flex justify-center mt-1">
      {!votedPositions.has(playerIndex) ? (
        <>
          <button
            onClick={() => handleVote(teamName, playerIndex)}
            className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Vote
          </button>
          <button
            onClick={() => handleSkipVote(playerIndex)}
            className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors ml-2"
          >
            Skip
          </button>
        </>
      ) : (
        <span className="text-xs font-medium px-3 py-1 bg-gray-100 rounded text-gray-800">
          {(playerPoints[currentSession]?.[`${teamName}-${playerIndex}`] || 0) === 1 ? 'Selected' : 'Voted'}
        </span>
      )}
    </div>
  );

  // Add session indicator
  const SessionIndicator = () => (
    <div className="text-center mb-4">
      <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
        Voting Session: {currentSession}
      </span>
    </div>
  );

  // Add scoring history display component
  const ScoringHistory = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-gray-800">
      <h3 className="text-2xl font-bold mb-4">Scoring History</h3>
      <div className="space-y-4">
        {scoringHistory.map((session, index) => (
          <div key={index} className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <span className="font-medium">Session {session.session}:</span>
              <span className={session.winner === session.team1 ? 'text-green-600 font-bold' : 'text-gray-700'}>
                {session.team1}: {session.team1Points}
              </span>
              <span className={session.winner === 'draw' ? 'text-blue-600 font-bold' : 'text-gray-700'}>-</span>
              <span className={session.winner === session.team2 ? 'text-green-600 font-bold' : 'text-gray-700'}>
                {session.team2}: {session.team2Points}
              </span>
            </div>
            <span className="mt-2 md:mt-0 text-sm font-medium px-3 py-1 rounded-full bg-gray-200 text-gray-800">
              {session.winner === 'draw' ? 'Draw' : `Winner: ${session.winner}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const teams = [
    'Chennai Super Kings',
    'Delhi Capitals',
    'Gujarat Titans',
    'Kolkata Knight Riders',
    'Lucknow Super Giants',
    'Mumbai Indians',
    'Punjab Kings',
    'Rajasthan Royals',
    'Royal Challengers Bangalore',
    'Sunrisers Hyderabad'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="w-full"> {/* Changed from max-w-7xl mx-auto to w-full */}

        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 border-b-4 border-blue-500 pb-4">
          Team Comparison Arena
        </h1>
        
        <SessionIndicator />
        
        <div className="flex flex-col items-center gap-6 mb-8">
          <div className="flex justify-center gap-8 w-full">
            <div className="w-64">
              <select
                value={team1}
                onChange={(e) => setTeam1(e.target.value)}
                className="w-full p-3 border-2 rounded-lg bg-white shadow-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">Select Team 1</option>
                {teams.map((team) => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-gray-700">VS</div>
              <div className="mt-4 flex gap-2">
                <span className="px-4 py-2 bg-blue-500 text-white rounded-lg">{team1Score}</span>
                <span className="px-4 py-2 bg-blue-500 text-white rounded-lg">{team2Score}</span>
              </div>
            </div>

            <div className="w-64">
              <select
                value={team2}
                onChange={(e) => setTeam2(e.target.value)}
                className="w-full p-3 border-2 rounded-lg bg-white shadow-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">Select Team 2</option>
                {teams.map((team) => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setShowStarting11(false)}
              className={`px-6 py-2 rounded-lg transition-all ${!showStarting11 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-200 text-gray-700'}`}
            >
              Squad Comparison
            </button>
            <button
              onClick={() => setShowStarting11(true)}
              className={`px-6 py-2 rounded-lg transition-all ${showStarting11 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-200 text-gray-700'}`}
            >
              Starting 11 Comparison
            </button>
          </div>
        </div>

        {(team1 || team2) && (
          <div className="grid grid-cols-2 gap-8 w-full"> {/* Added w-full to utilize full width */}
            {team1 && (
              <div className="rounded-xl overflow-hidden shadow-2xl bg-white w-full">
                <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-6">
                  <h2 className="text-2xl font-bold text-center text-white">{team1}</h2>
                </div>
                <div className="p-6">
                  {showStarting11 ? (
                    <>
                      <Starting11 teamName={team1} />
                      <div className="mt-4 grid grid-cols-6 gap-2">
                        {Array(11).fill(0).map((_, idx) => (
                          <VotingButtons key={idx} teamName={team1} playerIndex={idx} />
                        ))}
                      </div>
                    </>
                  ) : (
                    <PurchasedPlayers team={team1} />
                  )}
                </div>
              </div>
            )}
            
            {team2 && (
              <div className="rounded-xl overflow-hidden shadow-2xl bg-white w-full">
                <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-6">
                  <h2 className="text-2xl font-bold text-center text-white">{team2}</h2>
                </div>
                <div className="p-6">
                  {showStarting11 ? (
                    <>
                      <Starting11 teamName={team2} />
                      <div className="mt-4 grid grid-cols-6 gap-2">
                        {Array(11).fill(0).map((_, idx) => (
                          <VotingButtons key={idx} teamName={team2} playerIndex={idx} />
                        ))}
                      </div>
                    </>
                  ) : (
                    <PurchasedPlayers team={team2} />
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Move Scoring History below voting */}
        {(team1 || team2) && <ScoringHistory />}

        {/* Add Reset Voting button */}
        <div className="flex justify-center mt-4">
          <button
            onClick={resetVoting}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Reset Voting
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamComparison;
