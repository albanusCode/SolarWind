import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import GlobeComponent from "./components/GlobeComponent";
import Map from "./components/Map";
import About from "./components/About";
import Footer from "./components/Footer";
import Insights from "./components/Insight";

function App() {
  return (
    <Router>
      <div className="w-full min-h-screen relative">
        <Navbar />
        <Routes>
          <Route path="/" element={<GlobeComponent />} />
          <Route path="/about" element={<About />} />
          <Route path="/map" element={<Map />} />
          <Route path="/insight" element={<Insights />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
