import React, { useRef, useEffect, useState } from "react";
import Globe from "react-globe.gl";
import * as THREE from "three";

const GlobeComponent = () => {
  const globeEl = useRef();
  const [displayText, setDisplayText] = useState("");
  const [loopIndex, setLoopIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  const [chatOpen, setChatOpen] = useState(false);

  const messages = [
    "The home of energy discovery.",
    "Mapping regions for Solar and Wind power.",
    "Harnessing renewable energy for a sustainable future."
  ];

  // Typing effect
  useEffect(() => {
    const currentMessage = messages[loopIndex % messages.length];
    if (charIndex < currentMessage.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + currentMessage[charIndex]);
        setCharIndex(charIndex + 1);
      }, 80);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setDisplayText("");
        setCharIndex(0);
        setLoopIndex(loopIndex + 1);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [charIndex, loopIndex]);

  // Globe setup
  useEffect(() => {
    if (!globeEl.current) return;

    const controls = globeEl.current.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;
    globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2 });

    const scene = globeEl.current.scene();
    const light = new THREE.PointLight(0xffffff, 1.2, 2000);
    light.position.set(200, 200, 400);
    scene.add(light);

    const adjustGlobe = () => {
      const mesh = globeEl.current?.globeMesh?.();
      if (mesh) {
        const radius = globeEl.current.getGlobeRadius();
        mesh.scale.set(0.85, 0.85, 0.85);
        mesh.position.set(-radius * 0.4, 0, 0);
        controls.target.set(-radius * 0.4, 0, 0);
        controls.update();
      } else {
        requestAnimationFrame(adjustGlobe);
      }
    };
    adjustGlobe();
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col sm:flex-row items-center sm:items-center justify-between sm:px-12">
      {/* Globe container */}
      <div className="relative w-full sm:w-1/2 h-[300px] sm:h-full flex items-center justify-center">
        <Globe
          ref={globeEl}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          width={600}
          height={600}
        />

        {/* Overlay text on mobile */}
        <div className="top-[120%] absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4 sm:hidden">
          <h1 className="text-lg font-bold mb-2">Welcome to SolarWind</h1>
          <h2 className="text-sm text-green-300 mb-2 h-6">
            {displayText}
            <span className="border-r-2 border-green-400 animate-pulse ml-1"></span>
          </h2>
          <p className="text-xs leading-loose text-gray-200">
            At SolarWind, we specialize in{" "}
            <span className="text-green-400 font-semibold">
              identifying potential regions
            </span>{" "}
            around the globe where renewable energy can be harnessed most
            effectively. Using{" "}
            <span className="text-blue-400 font-semibold">solar radiation</span>{" "}
            and{" "}
            <span className="text-yellow-400 font-semibold">wind datasets</span>,
            we empower governments, businesses, and communities with the insights
            they need to expand into clean and sustainable energy sources. Our
            mission is simple:{" "}
            <span className="font-semibold">
              drive the transition toward a greener planet
            </span>{" "}
            by turning data into actionable opportunities.
          </p>
          <button className="mt-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-800 text-white font-bold rounded-lg transition">
            LET'S HERNESS
          </button>
        </div>
      </div>

      {/* Typing message on desktop */}
      <div className="hidden sm:block w-1/2 text-white px-10">
        <h1 className="sm:text-4xl font-bold mb-6">Welcome to SolarWind</h1>
        <h2 className="text-2xl text-green-300 mb-6 h-10">
          {displayText}
          <span className="border-r-2 border-green-400 animate-pulse ml-1"></span>
        </h2>
        <p className="text-lg leading-relaxed text-gray-200">
          At SolarWind, we specialize in{" "}
          <span className="text-green-400 font-semibold">
            identifying potential regions
          </span>{" "}
          around the globe where renewable energy can be harnessed most
          effectively. Using{" "}
          <span className="text-blue-400 font-semibold">solar radiation</span>{" "}
          and{" "}
          <span className="text-yellow-400 font-semibold">wind datasets</span>,
          we empower governments, businesses, and communities with the insights
          they need to expand into clean and sustainable energy sources. Our
          mission is simple:{" "}
          <span className="font-semibold">
            drive the transition toward a greener planet
          </span>{" "}
          by turning data into actionable opportunities.
        </p>
        <button className="mt-4 px-4 py-2 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-800 transition">
          LET'S HERNESS
        </button>
      </div>

      {/* Assistant Icon + Chat */}
      <div className="absolute bottom-4 left-4">
        {/* Floating assistant button */}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition w-14 h-14 sm:w-16 sm:h-16"
        >
          <span className="text-white text-2xl">🤖</span>
        </button>

        {/* Chat popup */}
        {chatOpen && (
          <div className="absolute bottom-20 left-0 w-64 bg-black/80 text-white p-4 rounded-xl shadow-lg border border-gray-700">
            <p className="text-sm font-semibold">Where are we exploring today?</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobeComponent;
