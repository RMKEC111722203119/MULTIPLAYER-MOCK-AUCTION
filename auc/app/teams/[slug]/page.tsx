"use client";
import { useState, useEffect } from "react";
import BidOptions from "@/components/franchise/BidOptions";
import PurchasedPlayers from "@/components/franchise/PurchasedPlayers";
import PurseAndTeamInfo from "@/components/franchise/PurseandTeamInfo";
import Retention from "@/components/franchise/Retention";
import Starting11 from "@/components/franchise/Starting11";
import UpcomingPlayers from "@/components/franchise/UpcomingPlayers";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

const Page = ({ params }: PageProps) => {
    const [slug, setSlug] = useState("");
    const [fslug, setFslug] = useState("");
    const [generatedPassword, setGeneratedPassword] = useState("");
    const [userInput, setUserInput] = useState("");
    const [unlocked, setUnlocked] = useState(false);
    const [anyTeamUnlocked, setAnyTeamUnlocked] = useState(false);

    useEffect(() => {
      const fetchSlug = async () => {
        const { slug } = await params;
        setSlug(slug);
       
        setFslug(slug.replace(/%20/g, " "));
      };
      fetchSlug();
    }, [params]);
  
    console.log(slug);
    
    useEffect(() => {
      if (!fslug) return;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.endsWith("-unlocked") && localStorage.getItem(key) === "true") {
          setAnyTeamUnlocked(true);
          break;
        }
      }
      const storedUnlocked = localStorage.getItem(`${fslug}-unlocked`);
      if (storedUnlocked === "true") {
        setUnlocked(true);
      }
      const generatePass = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let p = "";
        for (let i = 0; i < 15; i++) p += chars[Math.floor(Math.random() * chars.length)];
        return p;
      };
      setGeneratedPassword(generatePass());
      const interval = setInterval(() => {
        setGeneratedPassword(generatePass());
      }, 60000);
      return () => clearInterval(interval);
    }, [fslug]);

    const handleUnlock = () => {
      if (userInput === generatedPassword) {
        setUnlocked(true);
        localStorage.setItem(`${fslug}-unlocked`, "true");
      } else {
        alert("Wrong password");
      }
    };

    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        {/* Title */}
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          {fslug ? `${fslug.toUpperCase()} Franchise Dashboard` : "Franchise Dashboard"}
        </h1>
  
        {!unlocked && !anyTeamUnlocked && (
          <div className="text-center">
            <p className="text-blue-600 font-bold mb-2">
              Auto-generated password: {generatedPassword}
            </p>
            <input
              className="border border-gray-400 rounded px-2 py-1 mb-4"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onCopy={(e) => e.preventDefault()}
              onPaste={(e) => e.preventDefault()}
            />
            <button onClick={handleUnlock}>Unlock</button>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Always visible components */}
          <PurseAndTeamInfo team={fslug} />
          {unlocked && <BidOptions team={fslug} />}
          {unlocked && <Retention team={fslug} />}
          <PurchasedPlayers team={fslug} />
          <div className="col-span-1 lg:col-span-3">
            <Starting11 teamName={fslug} />
          </div>
          <UpcomingPlayers />
        </div>
        <br />
      </div>
    );
  };
  
  export default Page;
