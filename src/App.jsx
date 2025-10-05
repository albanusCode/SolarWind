import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import GlobeComponent from "./components/GlobeComponent";
import Map from "./components/Map";
import About from "./components/About";
import Footer from "./components/Footer";
import Insights from "./components/Insight";
import Loader from "./components/Loader"; // ✅ import your themed loader

// Wrap routes in a loader handler
function PageWrapper() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true); // start loading on route change
    const timer = setTimeout(() => setLoading(false), 4000); // 4s delay
    return () => clearTimeout(timer);
  }, [location]);

  if (loading) return <Loader />; // ✅ use the solar/wind loader

  return (
    <Routes>
      <Route path="/" element={<GlobeComponent />} />
      <Route path="/about" element={<About />} />
      <Route path="/map" element={<Map />} />
      <Route path="/insight" element={<Insights />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <div className="w-full min-h-screen relative">
        <Navbar />
        <PageWrapper />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
