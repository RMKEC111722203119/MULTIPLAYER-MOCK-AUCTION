"use client";
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { FaGavel, FaUsers, FaMoneyBillWave } from 'react-icons/fa';
import socket from '@/socket/socket';
import axios from 'axios';

interface Player {
  firstName: string;
  surname: string;
  specialism: string;
  reservePrice: number;
  country: string;
  soldStatus?: string;
  soldPrice?: number;
  soldTeam?: string;
}

interface AuctionState {
  currentPlayer: Player | null;
  highestBid: number;
  highestBidTeam: string;
}

const teamColors: { [key: string]: string } = {
  "Mumbai Indians": "text-blue-500",
  "Chennai Super Kings": "text-yellow-500",
  "Delhi Capitals": "text-blue-600",
  "Royal Challengers Bangalore": "text-red-600",
  "Kolkata Knight Riders": "text-purple-700",
  "Rajasthan Royals": "text-pink-500",
  "Sunrisers Hyderabad": "text-orange-500",
  "Punjab Kings": "text-red-500",
  "Lucknow Super Giants": "text-cyan-600",
  "Gujarat Titans": "text-teal-500",
};

const AuctionSpace = () => {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
useEffect(() => {
    // Initialize with fake data
    const fakePlayer: Player = {
        firstName: "waiting for",
        surname: "Auction to start",
        specialism: "loading...",
        reservePrice: 0,
        country: "Loading...",
    };

    setCurrentPlayer(fakePlayer);
    setHighestBid(fakePlayer.reservePrice);
    setHighestBidTeam("Mumbai Indians");
}, []);
  const [highestBid, setHighestBid] = useState<number>(0);
  const [highestBidTeam, setHighestBidTeam] = useState<string>('');
  const pathname = usePathname();
  const [isAuctioneer, setIsAuctioneer] = useState<boolean>(true);
  const [showRtmCard, setShowRtmCard] = useState<boolean>(false);
  const [rtmAmount, setRtmAmount] = useState<number>(0);
  const [selectedTeam, setSelectedTeam] = useState<string>('');

  const teamNames = [
    "Mumbai Indians",
    "Chennai Super Kings",
    "Delhi Capitals",
    "Royal Challengers Bangalore",
    "Kolkata Knight Riders",
    "Rajasthan Royals",
    "Sunrisers Hyderabad",
    "Punjab Kings",
    "Lucknow Super Giants",
    "Gujarat Titans",
  ];

  useEffect(() => {
    if (pathname === '/Auctioneer') {
      setIsAuctioneer(true);
    } else {
      setIsAuctioneer(false);
    }
  }, [pathname]);

  useEffect(() => {
    socket.emit("getAuctionState", (data: AuctionState) => {
      setCurrentPlayer(data.currentPlayer);
      setHighestBid(data.highestBid);
      setHighestBidTeam(data.highestBidTeam);
    });

    socket.on('playerSelected', (player: Player) => {
      setCurrentPlayer(null); // Trigger exit animation
      setTimeout(() => {
        setCurrentPlayer(player); // Trigger enter animation
        setHighestBid(player.reservePrice);
        setHighestBidTeam('');
      }, 300); // Match this duration with the exit animation duration
    });

    socket.on('updateBid', (data: { amount: number; teamName: string }) => {
      setHighestBid(data.amount);
      setHighestBidTeam(data.teamName);
    });

    return () => {
      socket.off('playerSelected');
      socket.off('updateBid');
    };
  }, []);

  const handleAuctionAction = (action: string) => {
    if (currentPlayer) {
      socket.emit('auctionAction', { player: currentPlayer, action });
    }
  };

  const handleRtmClick = () => {
    setShowRtmCard(true);
  };

  const handleRtmSubmit = async () => {
    if (currentPlayer) {
      const updatedPlayer = { ...currentPlayer, soldStatus: "sold", soldPrice: rtmAmount, soldTeam: selectedTeam };
      try {
        await axios.post("http://localhost:5000/auctioneer/rtm", {
          payload: updatedPlayer,
        });
      } catch (error) {
        window.alert("Error submitting RTM: " + error);
      }
      handleAuctionAction('rtm');
    }
    setShowRtmCard(false);
  };

  const handleRtmCancel = () => {
    setShowRtmCard(false);
  };

  return (
    <div className="p-6 bg-gradient-to-r from-gray-100 to-gray-300 shadow-lg rounded-lg">
      {/* JSX Code as in the original */}
    </div>
  );
};

export default AuctionSpace;
