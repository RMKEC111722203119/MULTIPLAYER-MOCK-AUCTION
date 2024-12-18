import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-800 text-white p-4 shadow-lg z-50 transition-all duration-300">
      <div className="flex items-center justify-between">
        {/* Logo or Title */}
        <div className="text-2xl font-semibold">
          <a href="github/rmkec111722203119" className="hover:text-yellow-400 transition-colors duration-300">
            IPL Auction System
          </a>
        </div>

        {/* Navbar Links */}
        <div className="hidden md:flex space-x-6">
          {/* <a href="/dashboard" className="hover:text-yellow-400 transition-colors duration-300">Dashboard</a>
          <a href="/players" className="hover:text-yellow-400 transition-colors duration-300">Players</a>
          <a href="/auction" className="hover:text-yellow-400 transition-colors duration-300">Auction</a> */}
          <Link href="/teams" className="hover:text-yellow-400 transition-colors duration-300">Teams</Link>
          {/* <a href="/rules" className="hover:text-yellow-400 transition-colors duration-300">Rules</a> */}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button className="text-xl" aria-label="Toggle menu">
            <i className="fas fa-bars"></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu (Hidden by default, will show when menu is toggled)
      <div className="md:hidden mt-4 space-y-4">
        <a href="/dashboard" className="block text-lg transition-colors duration-300 hover:text-yellow-400">Dashboard</a>
        <a href="/players" className="block text-lg transition-colors duration-300 hover:text-yellow-400">Players</a>
        <a href="/auction" className="block text-lg transition-colors duration-300 hover:text-yellow-400">Auction</a>
        <a href="/teams" className="block text-lg transition-colors duration-300 hover:text-yellow-400">Teams</a>
        <a href="/rules" className="block text-lg transition-colors duration-300 hover:text-yellow-400">Rules</a>
      </div> */}
    </nav>
  );
};

export default Navbar;
