import React, { useRef, useEffect, useState } from "react";
import Globe from "react-globe.gl";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";

const GlobeComponent = () => {
  const globeEl = useRef();
  const [displayText, setDisplayText] = useState("");
  const [loopIndex, setLoopIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState("");

  const messages = [
    "The home of energy discovery.",
    "Mapping regions for Solar and Wind power.",
    "Harnessing renewable energy for a sustainable future.",
  ];

  // Typing effect for main banner
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
  const navigate = useNavigate();

  // Handle user pressing Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && userInput.trim() !== "") {
      // Open chat if not already open
      if (!chatOpen) setChatOpen(true);

      // Add user message
      setChatMessages((prev) => [...prev, { sender: "user", text: userInput }]);

      // Fake assistant reply
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          { sender: "assistant", text: `Exploring: ${userInput}` },
        ]);
      }, 800);

      setUserInput(""); // Clear input
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col sm:flex-row items-center justify-between sm:px-12">
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

        {/* Mobile text overlay */}
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

      {/* Desktop text */}
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
        <button
          className="mt-4 px-4 py-2 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-800 transition"
          onClick={() => navigate("/map")}
        >
          LET'S HERNES
        </button>
      </div>

      {/* Assistant Icon + Chat */}
      <div className="absolute bottom-4 left-4">
        {/* Floating button */}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition w-12 h-12 sm:w-14 sm:h-14"
        >
          <span className="text-white text-xl">🤖</span>
        </button>

        {/* Input popup when chat is closed */}
        {!chatOpen && (
          <div className="absolute bottom-16 left-0 w-64 bg-black/80 p-2 rounded-xl shadow-lg border border-gray-700">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Where are we exploring today?"
              className="w-full px-3 py-2 rounded-md bg-gray-900 text-white text-sm outline-none placeholder-gray-400"
            />
          </div>
        )}

        {/* Full chat interface */}
        {chatOpen && (
          <div className="absolute bottom-16 left-0 w-72 sm:w-80 bg-black/90 text-white rounded-xl shadow-lg border border-gray-700 flex flex-col">
            {/* Chat messages */}
            <div className="p-3 flex-1 max-h-64 overflow-y-auto space-y-2">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-lg text-sm max-w-[85%] ${
                    msg.sender === "user"
                      ? "bg-green-600 self-end ml-auto"
                      : "bg-gray-700 self-start mr-auto"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-2 border-t border-gray-700">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="w-full px-3 py-2 rounded-md bg-gray-800 text-white text-sm outline-none placeholder-gray-400"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobeComponent;
