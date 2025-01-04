"use client";

import FranchisePurseRTMInfo from "@/components/auctioner/FranchisePurseRtmInfo";
import SoldPlayers from "@/components/auctioner/SoldPlayers";
import UnsoldPlayers from "@/components/auctioner/UnsoldPlayers";
import UpcomingPlayersToAuction from "@/components/auctioner/UpcomingPlayerToAuction";
import { useEffect, useState } from "react";

const Auctioneer = () => {
    
    const [showConfirm, setShowConfirm] = useState(false);

    const handleReset = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auctioneer/reset`, {
                method: 'POST',
            });
            if (response.ok) {
                // Refresh the data or show success message
                alert('Reset successful');
                window.location.reload();
            } else {
                throw new Error('Reset failed');
            }
        } catch (error) {
            console.error('Error resetting auction:', error);
            alert('Failed to reset auction');
        }
        setShowConfirm(false);
    };

    

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800">Auctioneer Dashboard</h1>
                <button
                    onClick={() => setShowConfirm(true)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Reset Auction
                </button>
            </div>

            {showConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl">
                        <h2 className="text-xl font-bold mb-4">Confirm Reset</h2>
                        <p className="mb-6">Are you sure you want to reset the auction? This action cannot be undone.</p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReset}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <FranchisePurseRTMInfo />
                <UpcomingPlayersToAuction />
                <SoldPlayers />
                <UnsoldPlayers />
            </div>
        </div>
    );
};

export default Auctioneer;
