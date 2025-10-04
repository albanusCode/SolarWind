import React from "react";
import Navbar from "./components/Navbar";
import GlobeComponent from "./components/GlobeComponent";

function App() {
  return (
    <div className="w-full h-screen bg-black relative">
      <Navbar />
      <GlobeComponent />
    </div>
  );
}

export default App;
