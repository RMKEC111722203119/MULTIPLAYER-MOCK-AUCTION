import FranchisePurseRTMInfo from '@/components/auctioner/FranchisePurseRtmInfo';
import PurchasedPlayers from '@/components/franchise/PurchasedPlayers';
import React from 'react'

const page = () => {

    //2*2 gridbased structure can also be used



// interface TeamData {
//     fullName: string;
//     shortName: string;
//     bgColor: string;
//     textColor: string;
// }

// const TEAMS: TeamData[] = [
//     { fullName: "Chennai Super Kings", shortName: "CSK", bgColor: "bg-yellow-500", textColor: "text-gray-900" },
//     { fullName: "Delhi Capitals", shortName: "DC", bgColor: "bg-blue-600", textColor: "text-white" },
//     { fullName: "Gujarat Titans", shortName: "GT", bgColor: "bg-teal-500", textColor: "text-white" },
//     { fullName: "Kolkata Knight Riders", shortName: "KKR", bgColor: "bg-purple-600", textColor: "text-white" },
//     { fullName: "Lucknow Super Giants", shortName: "LSG", bgColor: "bg-cyan-600", textColor: "text-white" },
//     { fullName: "Mumbai Indians", shortName: "MI", bgColor: "bg-blue-500", textColor: "text-white" },
//     { fullName: "Punjab Kings", shortName: "PBKS", bgColor: "bg-red-600", textColor: "text-white" },
//     { fullName: "Rajasthan Royals", shortName: "RR", bgColor: "bg-pink-500", textColor: "text-white" },
//     { fullName: "Royal Challengers Bangalore", shortName: "RCB", bgColor: "bg-red-500", textColor: "text-white" },
//     { fullName: "Sunrisers Hyderabad", shortName: "SRH", bgColor: "bg-orange-500", textColor: "text-white" },
// ];

// return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
//         {TEAMS.map((team) => (
//             <div 
//                 key={team.shortName}
//                 className={`${team.bgColor} ${team.textColor} p-6 rounded-lg shadow-md border border-gray-300 transition-transform hover:scale-102`}
//             >
//                 <h2 className="text-2xl font-semibold mb-4">
//                     {team.fullName}
//                     <span className="text-sm ml-2">({team.shortName})</span>
//                 </h2>
//                 <PurchasedPlayers team={team.fullName} />
//             </div>
//         ))}
//     </div>
// );



    //List 10 Ipl teams full name in a list
    const teams = [
        "Mumbai Indians",
        "Chennai Super Kings",
        "Delhi Capitals",
        "Royal Challengers Bangalore",
        "Kolkata Knight Riders",
        "Rajasthan Royals",
        "Sunrisers Hyderabad",
        "Punjab Kings",
        "Lucknow Super Giants",
        "Gujarat Titans"
      ];
      const getBackgroundColor = (team: string) => {
        switch (team) {
            case 'Chennai Super Kings':
                return 'bg-yellow-500';
            case 'Delhi Capitals':
                return 'bg-blue-600';
            case 'Gujarat Titans':
                return 'bg-teal-500';
            case 'Kolkata Knight Riders':
                return 'bg-purple-500';
            case 'Lucknow Super Giants':
                return 'bg-indigo-500';
            case 'Mumbai Indians':
                return 'bg-blue-500';
            case 'Punjab Kings':
                return 'bg-red-600';
            case 'Rajasthan Royals':
                return 'bg-pink-500';
            case 'Royal Challengers Bangalore':
                return 'bg-red-500';
            case 'Sunrisers Hyderabad':
                return 'bg-orange-500';
            default:
                return 'bg-white';
        }
    };
    return (
        <div className="grid grid-cols-2 gap-4 p-4">
            {teams.map((team) => (
                <div
                    key={team}
                    className={`${getBackgroundColor(team)} p-6 rounded-lg shadow-md border border-gray-300 col-span-3`}
                >
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">{team}</h2>
                    <PurchasedPlayers team={team} />
                </div>

                
            ))}
            <FranchisePurseRTMInfo />
        </div>
    )
    }

export default page


