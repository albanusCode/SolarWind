import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 w-full flex justify-between items-center px-4 sm:px-10 md:px-16 lg:px-22 py-4 bg-black/60 z-50 backdrop-blur-md">
      <div className="flex items-center space-x-2">
        <span
          className="text-white text-xl cursor-pointer"
          onClick={() => navigate("/")}
        >
          🌌
        </span>
        <span
          className="hidden sm:inline text-white font-bold text-lg cursor-pointer"
          onClick={() => navigate("/")}
        >
          SolarWind
        </span>
      </div>

      <div className="flex space-x-6">
        {/* About */}
        <button
          onClick={() => navigate("/about")}
          className={`text-white hover:text-blue-400 cursor-pointer pb-1 ${
            location.pathname === "/about" ? "border-b-2 border-green-500" : ""
          }`}
        >
          About
        </button>

        {/* Insights */}
        <button
          onClick={() => navigate("/insight")}
          className={`text-white cursor-pointer hover:text-blue-400 pb-1 ${
            location.pathname === "/insight" ? "border-b-2 border-green-500" : ""
          }`}
        >
          Insights
        </button>

        {/* Map */}
        <button
          onClick={() => navigate("/map")}
          className="text-white cursor-pointer border border-white rounded-full px-4 py-1 hover:bg-white hover:text-black transition"
        >
          Map
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
