import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="absolute top-0 left-0 w-full flex justify-between items-center px-4 sm:px-10 md:px-16 lg:px-22 py-4 bg-black/60 z-20">
      {/* Logo + Name */}
      <div className="flex items-center space-x-2">
        <span className="text-white text-xl">🌌</span>
        <span className="hidden sm:inline text-white font-bold text-lg cursor-pointer"
        onClick={() => navigate("/")}
        >
          SolarWind
        </span>
      </div>

      {/* Nav Links ..*/}
      <div className="flex space-x-6">
        <a
        href="#"
        className="!text-white hover:!text-blue-400 visited:!text-white active:!text-blue-500"
        >
        About
        </a>
        <a
        onClick={() => navigate("/map")}
        href="#"
        className="!text-white hover:!text-blue-400 visited:!text-white active:!text-blue-500"
        >
        Map
        </a>
        <a
        href="#"
        className="!text-white hover:!text-blue-400 visited:!text-white active:!text-blue-500"
        >
        Insights
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
