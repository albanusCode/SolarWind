import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import GlobeComponent from "./components/GlobeComponent";
import Map from "./components/Map";

function App() {
  return (
    <Router>
      <div className="w-full h-screen bg-black relative">
        <Navbar />
        <Routes>
          <Route path="/" element={<GlobeComponent />} />
          <Route path="/map" element={<Map />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
