// import React, { useState } from "react";

// const ChatBot = () => {
//   const [chatOpen, setChatOpen] = useState(false);
//   const [chatMessages, setChatMessages] = useState([]);
//   const [userInput, setUserInput] = useState("");

//   // Handle user pressing Enter
//   const handleKeyDown = async (e) => {
//     if (e.key === "Enter" && userInput.trim() !== "") {
//       // Open chat if not already open
//       if (!chatOpen) setChatOpen(true);

//       // Add user message
//       setChatMessages((prev) => [...prev, { sender: "user", text: userInput }]);

//       try {
//         // Make API call to OpenRouter
//         const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//           method: "POST",
//           headers: {
//             "Authorization": "Bearer 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", // Replace with your API key
//             "HTTP-Referer": "<YOUR_SITE_URL>", // Replace with your site URL
//             "X-Title": "<Nasa>", // Replace with your site title
//             "Content-Type": "application/json"
//           },
//           body: JSON.stringify({
//             "model": "openai/gpt-oss-20b:freemty",
//             "messages": [
//               {
//                 "role": "user",
//                 "content": userInput
//               }
//             ]
//           })
//         });

//         const data = await response.json();
//         const assistantReply = data.choices[0].message.content;

//         // Add assistant reply
//         setChatMessages((prev) => [
//           ...prev,
//           { sender: "assistant", text: assistantReply }
//         ]);
//       } catch (error) {
//         console.error("Error fetching from OpenRouter:", error);
//         setChatMessages((prev) => [
//           ...prev,
//           { sender: "assistant", text: "Sorry, something went wrong. Please try again." }
//         ]);
//       }

//       setUserInput(""); // Clear input
//     }
//   };

//   return (
//     <div className="absolute bottom-4 left-4">
//       {/* Floating button */}
//       <button
//         onClick={() => setChatOpen(!chatOpen)}
//         className="bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition w-12 h-12 sm:w-14 sm:h-14"
//       >
//         <span className="text-white text-xl">🤖</span>
//       </button>

//       {/* Input popup when chat is closed */}
//       {!chatOpen && (
//         <div className="absolute bottom-16 left-0 w-64 bg-black/80 p-2 rounded-xl shadow-lg border border-gray-700">
//           <input
//             type="text"
//             value={userInput}
//             onChange={(e) => setUserInput(e.target.value)}
//             onKeyDown={handleKeyDown}
//             placeholder="Where are we exploring today?"
//             className="w-full px-3 py-2 rounded-md bg-gray-900 text-white text-sm outline-none placeholder-gray-400"
//           />
//         </div>
//       )}

//       {/* Full chat interface */}
//       {chatOpen && (
//         <div className="absolute bottom-16 left-0 w-72 sm:w-80 bg-black/90 text-white rounded-xl shadow-lg border border-gray-700 flex flex-col">
//           {/* Chat messages */}
//           <div className="p-3 flex-1 max-h-64 overflow-y-auto space-y-2">
//             {chatMessages.map((msg, i) => (
//               <div
//                 key={i}
//                 className={`p-2 rounded-lg text-sm max-w-[85%] ${
//                   msg.sender === "user"
//                     ? "bg-green-600 self-end ml-auto"
//                     : "bg-gray-700 self-start mr-auto"
//                 }`}
//               >
//                 {msg.text}
//               </div>
//             ))}
//           </div>

//           {/* Input */}
//           <div className="p-2 border-t border-gray-700">
//             <input
//               type="text"
//               value={userInput}
//               onChange={(e) => setUserInput(e.target.value)}
//               onKeyDown={handleKeyDown}
//               placeholder="Type a message..."
//               className="w-full px-3 py-2 rounded-md bg-gray-800 text-white text-sm outline-none placeholder-gray-400"
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatBot;





// import React, { useState } from "react";

// const ChatBot = () => {
//   const [chatOpen, setChatOpen] = useState(false);
//   const [chatMessages, setChatMessages] = useState([]);
//   const [userInput, setUserInput] = useState("");

//   // Fetch NASA POWER data for a single point
//   const fetchNasaPowerData = async (lat, lon) => {
//     const startDate = "20250101";
//     const endDate = "20251231";
//     const parameters = "ALLSKY_SFC_SW_DWN,T2M,WS10M"; // solar, temp, wind

//     const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${parameters}&community=RE&longitude=${lon}&latitude=${lat}&start=${startDate}&end=${endDate}&format=JSON`;

//     try {
//       const response = await fetch(url);
//       const data = await response.json();
//       return data.properties.parameter;
//     } catch (err) {
//       console.error("NASA API error:", err);
//       return null;
//     }
//   };

//   // Generate a grid of points within the bounding box
//   const generateGrid = (bbox, rows = 4, cols = 4) => {
//     const [minLon, minLat, maxLon, maxLat] = bbox.map(Number);
//     const latStep = (maxLat - minLat) / (rows - 1);
//     const lonStep = (maxLon - minLon) / (cols - 1);

//     const points = [];
//     for (let i = 0; i < rows; i++) {
//       for (let j = 0; j < cols; j++) {
//         points.push({ lat: minLat + i * latStep, lon: minLon + j * lonStep });
//       }
//     }
//     return points;
//   };

//   // Reverse geocoding: lat/lon → address
//   const getStreetName = async (lat, lon) => {
//     try {
//       const res = await fetch(
//         `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
//       );
//       const data = await res.json();
//       return data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
//     } catch (err) {
//       console.error(err);
//       return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
//     }
//   };

//   // Get top locations for solar and wind
//   const getTopLocations = async (city) => {
//     // Geocode city
//     const geoRes = await fetch(
//       `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(city)}`
//     );
//     const geoData = await geoRes.json();
//     if (!geoData.length) return `Could not find the city "${city}".`;

//     const bbox = geoData[0].boundingbox; // [minLat, maxLat, minLon, maxLon]
//     const points = generateGrid([bbox[2], bbox[0], bbox[3], bbox[1]], 4, 4);

//     // Fetch NASA data for all points
//     const pointData = await Promise.all(
//       points.map(async (p) => {
//         const data = await fetchNasaPowerData(p.lat, p.lon);
//         if (!data) return null;
//         const avgSolar =
//           Object.values(data.ALLSKY_SFC_SW_DWN).reduce((a, b) => a + b, 0) /
//           Object.values(data.ALLSKY_SFC_SW_DWN).length;
//         const avgWind =
//           Object.values(data.WS10M).reduce((a, b) => a + b, 0) /
//           Object.values(data.WS10M).length;
//         return { ...p, avgSolar, avgWind };
//       })
//     );

//     const validPoints = pointData.filter(Boolean);

//     // Rank by solar
//     const topSolar = validPoints
//       .sort((a, b) => b.avgSolar - a.avgSolar)
//       .slice(0, 3);
//     // Rank by wind
//     const topWind = validPoints
//       .sort((a, b) => b.avgWind - a.avgWind)
//       .slice(0, 3);

//     // Convert lat/lon to addresses
//     const solarAddresses = await Promise.all(
//       topSolar.map(async (p, idx) => {
//         const address = await getStreetName(p.lat, p.lon);
//         return `${idx + 1}. ${address} - Avg Solar: ${p.avgSolar.toFixed(2)} kWh/m²/day`;
//       })
//     );
//     const windAddresses = await Promise.all(
//       topWind.map(async (p, idx) => {
//         const address = await getStreetName(p.lat, p.lon);
//         return `${idx + 1}. ${address} - Avg Wind: ${p.avgWind.toFixed(2)} m/s`;
//       })
//     );

//     return `Top Solar Locations in ${city}:\n${solarAddresses.join(
//       "\n"
//     )}\n\nTop Wind Locations in ${city}:\n${windAddresses.join("\n")}`;
//   };

//   // Handle user pressing Enter
//   const handleKeyDown = async (e) => {
//     if (e.key === "Enter" && userInput.trim() !== "") {
//       if (!chatOpen) setChatOpen(true);

//       // Add user message
//       setChatMessages((prev) => [...prev, { sender: "user", text: userInput }]);
//       const input = userInput;
//       setUserInput("");

//       // Detect location query
//       const locationRegex = /in ([a-zA-Z\s]+)/i;
//       const match = input.match(locationRegex);

//       if (match) {
//         const city = match[1].trim();
//         const topLocations = await getTopLocations(city);
//         setChatMessages((prev) => [
//           ...prev,
//           { sender: "assistant", text: topLocations },
//         ]);
//         return;
//       }

//       // Fallback to OpenRouter LLM
//       try {
//         const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//           method: "POST",
//           headers: {
//             "Authorization": "Bearer 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",
//             "HTTP-Referer": "<YOUR_SITE_URL>",
//             "X-Title": "<Nasa>",
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             model: "openai/gpt-oss-20b:freemty",
//             messages: [{ role: "user", content: input }],
//           }),
//         });

//         const data = await response.json();
//         const assistantReply = data.choices[0].message.content;

//         setChatMessages((prev) => [...prev, { sender: "assistant", text: assistantReply }]);
//       } catch (error) {
//         console.error("Error fetching from OpenRouter:", error);
//         setChatMessages((prev) => [
//           ...prev,
//           { sender: "assistant", text: "Sorry, something went wrong. Please try again." },
//         ]);
//       }
//     }
//   };

//   return (
//     <div className="absolute bottom-4 left-4">
//       {/* Floating button */}
//       <button
//         onClick={() => setChatOpen(!chatOpen)}
//         className="bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition w-12 h-12 sm:w-14 sm:h-14"
//       >
//         <span className="text-white text-xl">🤖</span>
//       </button>

//       {/* Input popup when chat is closed */}
//       {!chatOpen && (
//         <div className="absolute bottom-16 left-0 w-64 bg-black/80 p-2 rounded-xl shadow-lg border border-gray-700">
//           <input
//             type="text"
//             value={userInput}
//             onChange={(e) => setUserInput(e.target.value)}
//             onKeyDown={handleKeyDown}
//             placeholder="Where are we exploring today?"
//             className="w-full px-3 py-2 rounded-md bg-gray-900 text-white text-sm outline-none placeholder-gray-400"
//           />
//         </div>
//       )}

//       {/* Full chat interface */}
//       {chatOpen && (
//         <div className="absolute bottom-16 left-0 w-72 sm:w-80 bg-black/90 text-white rounded-xl shadow-lg border border-gray-700 flex flex-col">
//           {/* Chat messages */}
//           <div className="p-3 flex-1 max-h-64 overflow-y-auto space-y-2">
//             {chatMessages.map((msg, i) => (
//               <div
//                 key={i}
//                 className={`p-2 rounded-lg text-sm max-w-[85%] ${
//                   msg.sender === "user"
//                     ? "bg-green-600 self-end ml-auto"
//                     : "bg-gray-700 self-start mr-auto"
//                 }`}
//               >
//                 {msg.text}
//               </div>
//             ))}
//           </div>

//           {/* Input */}
//           <div className="p-2 border-t border-gray-700">
//             <input
//               type="text"
//               value={userInput}
//               onChange={(e) => setUserInput(e.target.value)}
//               onKeyDown={handleKeyDown}
//               placeholder="Type a message..."
//               className="w-full px-3 py-2 rounded-md bg-gray-800 text-white text-sm outline-none placeholder-gray-400"
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatBot;




// import React, { useState } from "react";

// const ChatBot = () => {
//   const [chatOpen, setChatOpen] = useState(false);
//   const [chatMessages, setChatMessages] = useState([]);
//   const [userInput, setUserInput] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   // Fetch NASA POWER data for a single point
//   const fetchNasaPowerData = async (lat, lon) => {
//     const startDate = "20230101"; // Adjusted to a past date for available data
//     const endDate = "20231231";
//     const parameters = "ALLSKY_SFC_SW_DWN,T2M,WS10M"; // Solar, temp, wind

//     const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${parameters}&community=RE&longitude=${lon}&latitude=${lat}&start=${startDate}&end=${endDate}&format=JSON`;

//     try {
//       const response = await fetch(url);
//       if (!response.ok) throw new Error(`NASA API error: ${response.status}`);
//       const data = await response.json();
//       return data.properties.parameter;
//     } catch (err) {
//       console.error("NASA API error:", err);
//       return null;
//     }
//   };

//   // Generate a grid of points within the bounding box
//   const generateGrid = (bbox, rows = 4, cols = 4) => {
//     const [minLat, maxLat, minLon, maxLon] = bbox.map(Number);
//     const latStep = (maxLat - minLat) / (rows - 1);
//     const lonStep = (maxLon - minLon) / (cols - 1);

//     const points = [];
//     for (let i = 0; i < rows; i++) {
//       for (let j = 0; j < cols; j++) {
//         points.push({ lat: minLat + i * latStep, lon: minLon + j * lonStep });
//       }
//     }
//     return points;
//   };

//   // Reverse geocoding: lat/lon → address
//   const getStreetName = async (lat, lon) => {
//     try {
//       const res = await fetch(
//         `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
//         { headers: { "User-Agent": "NasaChatBot/1.0" } } // Nominatim requires User-Agent
//       );
//       if (!res.ok) throw new Error(`Nominatim API error: ${res.status}`);
//       const data = await res.json();
//       return data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
//     } catch (err) {
//       console.error("Reverse geocoding error:", err);
//       return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
//     }
//   };

//   // Geocode city to bounding box
//   const geocodeCity = async (city) => {
//     try {
//       const res = await fetch(
//         `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(city)}`,
//         { headers: { "User-Agent": "NasaChatBot/1.0" } }
//       );
//       if (!res.ok) throw new Error(`Geocoding API error: ${res.status}`);
//       const data = await res.json();
//       if (!data.length) return null;
//       return data[0].boundingbox; // [minLat, maxLat, minLon, maxLon]
//     } catch (err) {
//       console.error("Geocoding error:", err);
//       return null;
//     }
//   };

//   // Get top locations for solar and wind
//   const getTopLocations = async (city) => {
//     setIsLoading(true);
//     const bbox = await geocodeCity(city);
//     if (!bbox) {
//       setIsLoading(false);
//       return `Could not find the city "${city}". Please check the spelling or try another location.`;
//     }

//     const points = generateGrid([bbox[0], bbox[1], bbox[2], bbox[3]], 4, 4);

//     // Fetch NASA data for all points
//     const pointData = await Promise.all(
//       points.map(async (p) => {
//         const data = await fetchNasaPowerData(p.lat, p.lon);
//         if (!data) return null;
//         const avgSolar =
//           Object.values(data.ALLSKY_SFC_SW_DWN).reduce((a, b) => a + b, 0) /
//           Object.values(data.ALLSKY_SFC_SW_DWN).length;
//         const avgWind =
//           Object.values(data.WS10M).reduce((a, b) => a + b, 0) /
//           Object.values(data.WS10M).length;
//         const avgTemp =
//           Object.values(data.T2M).reduce((a, b) => a + b, 0) /
//           Object.values(data.T2M).length;
//         return { ...p, avgSolar, avgWind, avgTemp };
//       })
//     );

//     const validPoints = pointData.filter(Boolean);
//     if (!validPoints.length) {
//       setIsLoading(false);
//       return `No valid data found for ${city}. Please try another location.`;
//     }

//     // Rank by solar and wind
//     const topSolar = validPoints
//       .sort((a, b) => b.avgSolar - a.avgSolar)
//       .slice(0, 3);
//     const topWind = validPoints
//       .sort((a, b) => b.avgWind - a.avgWind)
//       .slice(0, 3);

//     // Convert lat/lon to addresses
//     const solarAddresses = await Promise.all(
//       topSolar.map(async (p, idx) => {
//         const address = await getStreetName(p.lat, p.lon);
//         return `${idx + 1}. ${address}\n   - Solar: ${p.avgSolar.toFixed(2)} kWh/m²/day\n   - Temp: ${p.avgTemp.toFixed(2)} °C`;
//       })
//     );
//     const windAddresses = await Promise.all(
//       topWind.map(async (p, idx) => {
//         const address = await getStreetName(p.lat, p.lon);
//         return `${idx + 1}. ${address}\n   - Wind: ${p.avgWind.toFixed(2)} m/s\n   - Temp: ${p.avgTemp.toFixed(2)} °C`;
//       })
//     );

//     setIsLoading(false);
//     return `### Top Solar Locations in ${city}:\n${solarAddresses.join(
//       "\n"
//     )}\n\n### Top Wind Locations in ${city}:\n${windAddresses.join("\n")}`;
//   };

//   // Fallback to OpenRouter LLM
//   const queryOpenRouter = async (input) => {
//     try {
//       const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//         method: "POST",
//         headers: {
//           "Authorization": "Bearer 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",
//           "HTTP-Referer": window.location.origin,
//           "X-Title": "NasaChatBot",
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           model: "openai/gpt-oss-20b:freemty",
//           messages: [{ role: "user", content: input }],
//         }),
//       });

//       if (!response.ok) throw new Error(`OpenRouter API error: ${response.status}`);
//       const data = await response.json();
//       return data.choices[0].message.content;
//     } catch (error) {
//       console.error("OpenRouter error:", error);
//       return "Sorry, I couldn't process your request. Please try again later.";
//     }
//   };

//   // Handle user input
//   const handleKeyDown = async (e) => {
//     if (e.key !== "Enter" || userInput.trim() === "") return;

//     if (!chatOpen) setChatOpen(true);
//     setChatMessages((prev) => [...prev, { sender: "user", text: userInput }]);
//     const input = userInput.trim();
//     setUserInput("");
//     setIsLoading(true);

//     // Enhanced location detection
//     const locationKeywords = ["in", "near", "at", "around"];
//     const words = input.toLowerCase().split(/\s+/);
//     let city = null;
//     for (let i = 0; i < words.length; i++) {
//       if (locationKeywords.includes(words[i]) && i + 1 < words.length) {
//         city = words.slice(i + 1).join(" ");
//         break;
//       }
//     }

//     if (city) {
//       const topLocations = await getTopLocations(city);
//       setChatMessages((prev) => [...prev, { sender: "assistant", text: topLocations }]);
//     } else {
//       // Fallback to OpenRouter for general queries
//       const assistantReply = await queryOpenRouter(input);
//       setChatMessages((prev) => [...prev, { sender: "assistant", text: assistantReply }]);
//     }

//     setIsLoading(false);
//   };

//   return (
//     <div className="absolute bottom-4 left-4">
//       {/* Floating button */}
//       <button
//         onClick={() => setChatOpen(!chatOpen)}
//         className="bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition w-12 h-12 sm:w-14 sm:h-14"
//       >
//         <span className="text-white text-xl">🤖</span>
//       </button>

//       {/* Input popup when chat is closed */}
//       {!chatOpen && (
//         <div className="absolute bottom-16 left-0 w-64 bg-black/80 p-2 rounded-xl shadow-lg border border-gray-700">
//           <input
//             type="text"
//             value={userInput}
//             onChange={(e) => setUserInput(e.target.value)}
//             onKeyDown={handleKeyDown}
//             placeholder="Ask about solar/wind in a city..."
//             className="w-full px-3 py-2 rounded-md bg-gray-900 text-white text-sm outline-none placeholder-gray-400"
//             disabled={isLoading}
//           />
//         </div>
//       )}

//       {/* Full chat interface */}
//       {chatOpen && (
//         <div className="absolute bottom-16 left-0 w-72 sm:w-80 bg-black/90 text-white rounded-xl shadow-lg border border-gray-700 flex flex-col">
//           {/* Chat messages */}
//           <div className="p-3 flex-1 max-h-64 overflow-y-auto space-y-2">
//             {chatMessages.map((msg, i) => (
//               <div
//                 key={i}
//                 className={`p-2 rounded-lg text-sm max-w-[85%] whitespace-pre-wrap ${
//                   msg.sender === "user"
//                     ? "bg-green-600 self-end ml-auto"
//                     : "bg-gray-700 self-start mr-auto"
//                 }`}
//               >
//                 {msg.text}
//               </div>
//             ))}
//             {isLoading && (
//               <div className="text-sm text-gray-400">Loading...</div>
//             )}
//           </div>

//           {/* Input */}
//           <div className="p-2 border-t border-gray-700">
//             <input
//               type="text"
//               value={userInput}
//               onChange={(e) => setUserInput(e.target.value)}
//               onKeyDown={handleKeyDown}
//               placeholder="Type a message..."
//               className="w-full px-3 py-2 rounded-md bg-gray-800 text-white text-sm outline-none placeholder-gray-400"
//               disabled={isLoading}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatBot;



import React, { useState } from "react";

const ChatBot = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState("");

  // Reverse geocode lat/lon to street
  const getStreetName = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await res.json();
      return data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    } catch {
      return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }
  };

  // Fetch NASA POWER data for a single point
  const fetchNasaPowerData = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://power.larc.nasa.gov/api/temporal/daily/point?latitude=${lat}&longitude=${lon}&parameters=ALLSKY_SFC_SW_DWN,WS10M&format=JSON`
      );
      const data = await res.json();
      return data.properties ? data.properties.parameter : null;
    } catch {
      return null;
    }
  };

  // Get top solar + wind locations for a city
  const getTopLocations = async (location) => {
    try {
      // Geocode city center
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
          location
        )}`
      );
      const geoData = await geoRes.json();
      if (!geoData.length) return `Could not find "${location}".`;

      const city = geoData[0];
      const centerLat = parseFloat(city.lat);
      const centerLon = parseFloat(city.lon);

      // Small grid around city center (~5 km)
      const delta = 0.025;
      const points = [
        { lat: centerLat, lon: centerLon },
        { lat: centerLat + delta, lon: centerLon },
        { lat: centerLat - delta, lon: centerLon },
        { lat: centerLat, lon: centerLon + delta },
        { lat: centerLat, lon: centerLon - delta },
        { lat: centerLat + delta, lon: centerLon + delta },
        { lat: centerLat - delta, lon: centerLon - delta },
      ];

      const pointData = await Promise.all(
        points.map(async (p) => {
          const data = await fetchNasaPowerData(p.lat, p.lon);
          if (!data) return null;

          const solarValues = Object.values(data.ALLSKY_SFC_SW_DWN || {});
          const windValues = Object.values(data.WS10M || {});

          const avgSolar =
            solarValues.reduce((a, b) => a + b, 0) / solarValues.length || 0;
          const avgWind =
            windValues.reduce((a, b) => a + b, 0) / windValues.length || 0;

          if (avgSolar <= 0 && avgWind <= 0) return null;

          return { ...p, avgSolar, avgWind };
        })
      );

      const validPoints = pointData.filter(Boolean);
      if (!validPoints.length)
        return `NASA POWER data unavailable for "${location}". Consider trying a nearby area.`;

      // Rank points
      const topSolar = validPoints
        .sort((a, b) => b.avgSolar - a.avgSolar)
        .slice(0, 3);
      const topWind = validPoints
        .sort((a, b) => b.avgWind - a.avgWind)
        .slice(0, 3);

      // Get readable addresses
      const solarAddresses = await Promise.all(
        topSolar.map(async (p, idx) => {
          const address = await getStreetName(p.lat, p.lon);
          return `${idx + 1}. ${address} - Avg Solar: ${p.avgSolar.toFixed(
            2
          )} kWh/m²/day`;
        })
      );

      const windAddresses = await Promise.all(
        topWind.map(async (p, idx) => {
          const address = await getStreetName(p.lat, p.lon);
          return `${idx + 1}. ${address} - Avg Wind: ${p.avgWind.toFixed(2)} m/s`;
        })
      );

      return `Top Solar Locations in ${location}:\n${solarAddresses.join(
        "\n"
      )}\n\nTop Wind Locations in ${location}:\n${windAddresses.join("\n")}`;
    } catch (err) {
      console.error(err);
      return "Error fetching top locations. Please try again.";
    }
  };

  // Handle user pressing Enter
  const handleKeyDown = async (e) => {
    if (e.key === "Enter" && userInput.trim() !== "") {
      if (!chatOpen) setChatOpen(true);

      setChatMessages((prev) => [...prev, { sender: "user", text: userInput }]);

      try {
        // Detect if user asked about power locations
        const locationRegex = /in ([a-zA-Z\s]+)/i;
        const match = userInput.match(locationRegex);
        let reply;

        if (
          /power station|solar|wind/i.test(userInput) &&
          match &&
          match[1]
        ) {
          reply = await getTopLocations(match[1]);
        } else {
          // Default OpenRouter fallback
          const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization:
                  "Bearer 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",
                "HTTP-Referer": "<YOUR_SITE_URL>",
                "X-Title": "<Nasa>",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "openai/gpt-oss-20b:freemty",
                messages: [{ role: "user", content: userInput }],
              }),
            }
          );

          const data = await response.json();
          reply = data.choices[0].message.content;
        }

        setChatMessages((prev) => [...prev, { sender: "assistant", text: reply }]);
      } catch (error) {
        console.error(error);
        setChatMessages((prev) => [
          ...prev,
          {
            sender: "assistant",
            text: "Sorry, something went wrong. Please try again.",
          },
        ]);
      }

      setUserInput("");
    }
  };

  return (
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
  );
};

export default ChatBot;
