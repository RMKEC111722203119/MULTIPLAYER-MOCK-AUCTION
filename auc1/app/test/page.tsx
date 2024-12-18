"use client";
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { FaGavel, FaUsers, FaGamepad, FaSpinner } from 'react-icons/fa';

const teamColors: { [key: string]: string } = {
  "Mumbai Indians": "bg-blue-500",
  "Chennai Super Kings": "bg-yellow-500",
  "Delhi Capitals": "bg-blue-600",
  "Royal Challengers Bangalore": "bg-red-600",
  "Kolkata Knight Riders": "bg-purple-700",
  "Rajasthan Royals": "bg-pink-500",
  "Sunrisers Hyderabad": "bg-orange-500",
  "Punjab Kings": "bg-red-500",
  "Lucknow Super Giants": "bg-cyan-600",
  "Gujarat Titans": "bg-teal-500",
};

const LandingPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const teams = Object.keys(teamColors);

  const handleNavigation = (path: string) => {
    setLoading(path);
    router.push(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-100 to-gray-200">
      {/* Header */}
      <div className="relative py-12">
        <div className="absolute inset-0">
          <img
            src="/images/ipl_background.jpg"
            alt="IPL Background"
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="relative z-10">
          <h1 className="text-5xl font-extrabold text-center text-gray-800 transition-transform transform hover:scale-105">
            Welcome to IPL Auction
          </h1>
          <p className="text-center text-gray-600 mt-4 transition-opacity opacity-80 hover:opacity-100">
            Experience the excitement of the IPL Auction Platform
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4">
        {/* Features Section */}
        <section className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-gray-800 mb-8">Features</h2>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="w-64 p-6 bg-white rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
              <FaGavel className="text-indigo-600 text-4xl mx-auto mb-4" />
              <h3 className="font-bold text-xl mb-2">Real-Time Bidding</h3>
              <p className="text-gray-600">
                Bid on players as an auctioneer or team representative.
              </p>
            </div>
            <div className="w-64 p-6 bg-white rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
              <FaUsers className="text-indigo-600 text-4xl mx-auto mb-4" />
              <h3 className="font-bold text-xl mb-2">Team Management</h3>
              <p className="text-gray-600">
                Manage your team's roster, finances, and strategies.
              </p>
            </div>
            <div className="w-64 p-6 bg-white rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
              <FaGamepad className="text-indigo-600 text-4xl mx-auto mb-4" />
              <h3 className="font-bold text-xl mb-2">Multiplayer</h3>
              <p className="text-gray-600">
                Compete and collaborate with other players in dynamic auctions.
              </p>
            </div>
          </div>
        </section>

        {/* Auctioneer and Team Selection */}
        <div className="flex flex-col items-center gap-8">
          {/* Auctioneer Button */}
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">Enter as Auctioneer</h2>
            <button
              onClick={() => handleNavigation('/Auctioneer')}
              className="flex items-center bg-indigo-600 text-white font-bold py-4 px-10 rounded-full hover:bg-indigo-700 transition-all duration-300 shadow-xl transform hover:scale-105"
            >
              <FaGavel className="mr-2 text-2xl" />
              Enter as Auctioneer
              {loading === '/Auctioneer' && (
                <FaSpinner className="animate-spin ml-3 text-xl" />
              )}
            </button>
          </div>

          {/* Team Selection */}
          <div className="text-center mt-8 pb-8">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">Select Your Team</h2>
            <div className="flex flex-wrap justify-center gap-6">
              {teams.map((team) => (
                <button
                  key={team}
                  onClick={() => handleNavigation(`/teams/${team}`)}
                  className={`${teamColors[team]} flex items-center justify-center text-white font-bold py-3 px-6 rounded-lg shadow-md w-48 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl`}
                >
                  {/* Example Icon: FaUsers (you can customize per team if needed) */}
                  <FaUsers className="mr-2 text-xl" />
                  {team}
                  {loading === `/teams/${team}` && (
                    <FaSpinner className="animate-spin ml-2 text-lg" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      
    </div>
  );
};

export default LandingPage;