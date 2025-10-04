import React, { useRef, useEffect, useState } from "react";
import Globe from "react-globe.gl";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import ChatBot from "./ChatBot";

const GlobeComponent = () => {
  const globeEl = useRef();
  const [displayText, setDisplayText] = useState("");
  const [loopIndex, setLoopIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  const messages = [
    "The home of energy discovery.",
    "Mapping regions for Solar and Wind power.",
    "Harnessing renewable energy for a sustainable future.",
  ];

  // Typing effect
  useEffect(() => {
    const currentMessage = messages[loopIndex % messages.length];
    if (charIndex < currentMessage.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + currentMessage[charIndex]);
        setCharIndex((prev) => prev + 1);
      }, 80);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setDisplayText("");
        setCharIndex(0);
        setLoopIndex((prev) => prev + 1);
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

  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Content wrapper for scrolling */}
      <main className="flex-1 flex flex-col sm:flex-row items-center justify-between sm:px-12 py-10">
        {/* Globe container */}
        <div className="relative w-full sm:w-1/2 h-[400px] sm:h-[80vh] flex items-center justify-center">
          <Globe
            ref={globeEl}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
            width={600}
            height={600}
          />

          {/* Mobile overlay text */}
          <div className="absolute top-[50%] bottom-0 left-0 right-0 px-4 pb-6 text-center text-white sm:hidden">
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
              where renewable energy can be harnessed most effectively. Using{" "}
              <span className="text-blue-400 font-semibold">
                solar radiation
              </span>{" "}
              and{" "}
              <span className="text-yellow-400 font-semibold">
                wind datasets
              </span>
              , we empower communities with insights for clean energy. Our
              mission:{" "}
              <span className="font-semibold">
                drive the transition toward a greener planet.
              </span>
            </p>
            <button className="mt-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-800 text-white font-bold rounded-lg transition">
              LET'S HARNESS
            </button>
          </div>
        </div>

        {/* Desktop text section */}
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
            <span className="text-blue-400 font-semibold">
              solar radiation
            </span>{" "}
            and{" "}
            <span className="text-yellow-400 font-semibold">wind datasets</span>
            , we empower governments, businesses, and communities with insights
            for a cleaner, sustainable future. Our mission:{" "}
            <span className="font-semibold">
              drive the transition toward a greener planet
            </span>{" "}
            by turning data into opportunity.
          </p>
          <button
            className="mt-6 px-5 py-3 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-800 transition"
            onClick={() => navigate("/map")}
          >
            LET'S HARNESS
          </button>
        </div>
      </main>

      {/* ChatBot Floating Component */}
      <ChatBot />
    </div>
  );
};

export default GlobeComponent;
