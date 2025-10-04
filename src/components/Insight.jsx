import React, { useEffect, useState } from "react";
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

const Insights = () => {
  const [regions, setRegions] = useState(initialRegions);

  useEffect(() => {
    const fetchNasaData = async () => {
      const updated = await Promise.all(
        initialRegions.map(async (r) => {
          const [lon, lat] = r.coordinates;

          try {
            // ✅ Correct NASA POWER API endpoint
            const res = await fetch(
              `https://power.larc.nasa.gov/api/temporal/climatology/point?latitude=${lat}&longitude=${lon}&parameters=ALLSKY_SFC_SW_DWN,WS10M&community=RE&format=JSON`
            );
            const data = await res.json();

            const solar =
              data?.properties?.parameter?.ALLSKY_SFC_SW_DWN?.ANN?.toFixed(2) ||
              "N/A";
            const wind =
              data?.properties?.parameter?.WS10M?.ANN?.toFixed(2) || "N/A";

            // Add short meaning text
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

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center justify-center overflow-hidden">
      <h2 className="text-3xl md:text-4xl font-bold mb-6 text-green-400">
        Global Solar & Wind Insights
      </h2>

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

            {regions.map((region, idx) => (
              <Marker key={idx} coordinates={region.coordinates}>
                <circle r={5} fill="#f97316" stroke="#fff" strokeWidth={1.2} />
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>

        {/* Always-visible info boxes */}
        <div className="absolute inset-0 pointer-events-none">
          {regions.map((region, idx) => {
            const [lon, lat] = region.coordinates;
            // crude coordinate-to-percentage mapping
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
                className="absolute pointer-events-auto transition-transform hover:scale-105"
              >
                <div className="bg-gray-900/90 border border-green-500 text-gray-100 shadow-2xl rounded-xl p-3 w-48 backdrop-blur-md text-sm">
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

      <p className="mt-5 text-gray-400 text-sm">
        Live data sourced from NASA POWER Climate Data API.
      </p>
    </div>
  );
};

export default Insights;