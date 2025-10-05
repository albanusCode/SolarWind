import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";

const geoUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// 🌍 Six diverse global locations
const initialRegions = [
  { name: "Nairobi, Kenya", coordinates: [36.8219, -1.2921] },
  { name: "California, USA", coordinates: [-119.4179, 36.7783] },
  { name: "Barcelona, Spain", coordinates: [2.1734, 41.3851] },
  { name: "Sydney, Australia", coordinates: [151.2093, -33.8688] },
  { name: "New Delhi, India", coordinates: [77.209, 28.6139] },
  { name: "Rio de Janeiro, Brazil", coordinates: [-43.1729, -22.9068] },
];

const faqs = [
  {
    question: "What is solar potential?",
    answer:
      "Solar potential refers to the average amount of solar radiation a location receives daily. It’s usually measured in kWh/m²/day and helps determine how effective solar panels will be.",
  },
  {
    question: "What does wind speed indicate?",
    answer:
      "Wind speed at 10 meters (WS10M) shows the energy potential for wind turbines. Higher average speeds generally mean better conditions for wind power generation.",
  },
  {
    question: "Why use NASA POWER API data?",
    answer:
      "NASA POWER provides high-quality, satellite-based climate and energy data, making it a reliable source for renewable energy planning across the globe.",
  },
  {
    question: "How often is this data updated?",
    answer:
      "The climatology data shown here is based on long-term averages, but NASA also provides near real-time datasets that are updated daily.",
  },
];

const Insights = () => {
  const [regions, setRegions] = useState(initialRegions);
  const [openIndex, setOpenIndex] = useState(0); // first FAQ open by default

  useEffect(() => {
    const fetchNasaData = async () => {
      const updated = await Promise.all(
        initialRegions.map(async (r) => {
          const [lon, lat] = r.coordinates;

          try {
            const res = await fetch(
              `https://power.larc.nasa.gov/api/temporal/climatology/point?latitude=${lat}&longitude=${lon}&parameters=ALLSKY_SFC_SW_DWN,WS10M&community=RE&format=JSON`
            );
            const data = await res.json();

            const solar =
              data?.properties?.parameter?.ALLSKY_SFC_SW_DWN?.ANN?.toFixed(2) ||
              "N/A";
            const wind =
              data?.properties?.parameter?.WS10M?.ANN?.toFixed(2) || "N/A";

            let note = "";
            if (solar === "N/A") note = "Data unavailable.";
            else if (solar > 6) note = "Excellent solar potential.";
            else if (solar > 5) note = "Great solar opportunity.";
            else if (solar > 4) note = "Moderate solar resource.";
            else note = "Limited solar potential.";

            return { ...r, solar, wind, note };
          } catch (e) {
            console.error("NASA API error for", r.name, e);
            return { ...r, solar: "N/A", wind: "N/A", note: "Fetch failed." };
          }
        })
      );
      setRegions(updated);
    };

    fetchNasaData();
  }, []);

  const location = useLocation();
   useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        // wait for render
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
      }
    }
  }, [location]);
  return (
    <div className="relative pt-20 w-full min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center overflow-hidden">
      {/* 🌍 MAP */}
      <div className="relative w-[95vw] md:w-[80vw] h-[70vh] bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <ComposableMap
          projectionConfig={{ scale: 160 }}
          width={980}
          height={500}
          className="w-full h-full"
        >
          <ZoomableGroup>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#1f2937"
                    stroke="#4b5563"
                    strokeWidth={0.3}
                  />
                ))
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* Orange Dots + Info Boxes */}
        <div className="absolute inset-0">
          {regions.map((region, idx) => {
            const [lon, lat] = region.coordinates;
            const x = ((lon + 180) / 360) * 100;
            const y = ((90 - lat) / 180) * 100;

            return (
              <div
                key={idx}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                className="absolute group"
              >
                {/* Orange Dot */}
                <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-lg cursor-pointer transition-transform group-hover:scale-110"></div>

                {/* Info Box */}
                <div
                  className="
                    hidden sm:block          /* always visible on sm+ */
                    group-hover:block        /* show on hover for mobile */
                    absolute top-8 left-1/2 transform -translate-x-1/2
                    bg-gray-900/90 border border-green-500 text-gray-100 shadow-2xl 
                    rounded-xl p-3 w-48 backdrop-blur-md text-sm
                  "
                >
                  <h3 className="font-semibold text-green-400 mb-1 text-base">
                    {region.name}
                  </h3>
                  <p>☀️ {region.solar} kWh/m²/day</p>
                  <p>💨 {region.wind} m/s</p>
                  <p className="text-gray-400 mt-1 text-xs">{region.note}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p id="faq" className="mt-5 text-gray-400 text-sm">
        Live data sourced from NASA POWER Climate Data API.
      </p>

      {/* 🚀 FAQ Section */}
      <div className="w-full md:w-3/4 lg:w-2/3 mt-12 mb-20 px-6">
        <h3 className="text-2xl font-bold text-green-400 mb-6 text-center">
          Frequently Asked Questions
        </h3>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-gray-700 rounded-xl overflow-hidden shadow-lg bg-gray-800/50 backdrop-blur-md"
            >
              <button
                className="w-full text-left px-5 py-4 flex justify-between items-center focus:outline-none"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              >
                <span className="text-lg font-medium text-white">
                  {faq.question}
                </span>
                <span className="text-green-400 text-xl">
                  {openIndex === idx ? "−" : "+"}
                </span>
              </button>
              {openIndex === idx && (
                <div className="px-5 pb-4 text-gray-300 text-sm transition-all duration-300 ease-in-out">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Insights;