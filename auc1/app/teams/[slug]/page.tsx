import BidOptions from "@/components/franchise/BidOptions";
import PurchasedPlayers from "@/components/franchise/PurchasedPlayers";
import PurseAndTeamInfo from "@/components/franchise/PurseandTeamInfo";
import Retention from "@/components/franchise/Retention";
import UpcomingPlayers from "@/components/franchise/UpcomingPlayers";

const Page = ({ params }: { params: { slug: string } }) => {
    const { slug } = params;
    const fslug = slug.replace(/%20/g, " ");
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        {/* Title */}
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          {fslug ? `${fslug.toUpperCase()} Franchise Dashboard` : "Franchise Dashboard"}
        </h1>
  
        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Purse and Team Info */}
          <PurseAndTeamInfo
            team={fslug}  
          />
  
          {/* Bidding Options */}
          <BidOptions team={fslug}/>

          {/* Retained Players */}
          <Retention team={fslug} />
          {/* Purchased Players */}
          <PurchasedPlayers team={fslug} />
  
          {/* Upcoming Players */}
          <UpcomingPlayers />
        </div>
      </div>
    );
  };
  
  export default Page;
  