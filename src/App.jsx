import React from "react";
import Navbar from "./components/Navbar";
import GlobeComponent from "./components/GlobeComponent";
import Map from "./components/Map";

function App() {
  return (
    <div className="w-full h-screen bg-black relative">
      {/* <Navbar />
      <GlobeComponent /> */}
      <Map />
    </div>
  );
}

export default App;
