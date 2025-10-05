import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import { useState, useEffect } from "react";
import countriesData from "../data/countries.json";
import L from "leaflet";
import "leaflet.heat";
import { Marker, Tooltip } from "react-leaflet";
import Select from "react-select";

const solarIcon = new L.Icon({
  iconUrl: "/icons/location-pin.png",   // put your solar icon in public/icons
  iconSize: [32, 32],
  iconAnchor: [16, 32],          // bottom center of icon
  popupAnchor: [0, -32],
});

const windIcon = new L.Icon({
  iconUrl: "/icons/location-pin.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

function getBestPoints(features, param) {
  const data = features.map(f => {
    const p = f.properties.parameter[param];
    const ann = p?.ANN;
    return { ...f, ann };
  }).filter(f => f.ann !== undefined);

  if (param === "ALLSKY_KT") {
    // solar clearness index: best if >0.65
    return data.filter(f => f.ann > 0.60);
  }

  if (param === "WS50M") {
    // wind speed: best if >6 m/s
    return data.filter(f => f.ann > 6);
  }

  // fallback
  return data;
}

function transformToGeoJSON(features, param, selectedCountry) {
  const geojson = {
    type: "FeatureCollection",
    features: features.map((f) => {
      const [lon, lat] = f.geometry.coordinates; // drop altitude
      const annualValue = f.properties.parameter[param].ANN;

      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [lon, lat],
        },
        properties: {
          value: annualValue, // main data Leaflet will color by
        },
      };
    })
     // only keep points that fall inside land polygons
      .filter((f) =>
      selectedCountry
        ? isPointOnLand(f.geometry.coordinates, { features: [selectedCountry] })
        : false
      )
  };

  return geojson;
}

function HeatmapLayer({ geoData, dataType }) {
  const map = useMap();

  useEffect(() => {
    if (!geoData) return;

    const heatPoints = geoData.features.map((f) => {
    const lat = f.geometry.coordinates[1];
    const lon = f.geometry.coordinates[0];
    const v = f.properties.value;

      // Normalize and amplify (maps roughly 0.55–0.7 -> 0–1)
      let intensity;
      if (dataType === "ALLSKY_KT") {
        intensity = Math.pow(Math.max(0, Math.min(1, (v - 0.55) / (0.7 - 0.55))), 0.6);
      } else if (dataType === "WS50M") {
        intensity = Math.max(0, Math.min(1, (v - 3) / (12 - 3))); // 3–12 m/s scaled
      }

      return [lat, lon, intensity];
    });

    const heatLayer = L.heatLayer(heatPoints, {
      radius: 35,
      blur: 25,
      maxZoom: 10,
      max: 1.0,
      gradient: {
        0.0: "#2b00ff",   // deep blue
        0.2: "#6a00ff",   // violet
        0.4: "#ff00ff",   // magenta
        0.6: "#ff4d00",   // orange
        0.8: "#ffb300",   // gold
        1.0: "#ffff00",   // yellow-white
      },
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [geoData, map, dataType]);

  return null;
}

function BestPointsLayer({ geoData, dataType }) {
  if (!geoData) return null;

  return (
    <>
      {geoData.features.map((f, i) => {
        const [lon, lat] = f.geometry.coordinates;
        const v = f.properties.value;

        return (
          <Marker
            key={i}
            position={[lat, lon]}
            icon={dataType === "ALLSKY_KT" ? solarIcon : windIcon}
          >
            <Tooltip direction="top">
              <div>
                <strong>{dataType === "ALLSKY_KT" ? "Solar clearness" : "Wind speed"}:</strong> {v.toFixed(2)}<br />
                <strong>Lat:</strong> {lat.toFixed(2)}<br />
                <strong>Lon:</strong> {lon.toFixed(2)}
              </div>
            </Tooltip>
          </Marker>
        );
      })}
    </>
  );
}

function getBoundingBox(feature) {
  let coords = [];

  const extractCoords = (geom) => {
    if (geom.type === "Polygon") {
      geom.coordinates.forEach(ring => coords.push(...ring));
    } else if (geom.type === "MultiPolygon") {
      geom.coordinates.forEach(poly =>
        poly.forEach(ring => coords.push(...ring))
      );
    }
  };

  extractCoords(feature.geometry);

  const lons = coords.map(c => c[0]);
  const lats = coords.map(c => c[1]);

  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  // console.log("bounding box:", minLat, maxLat, minLon, maxLon)

  return { minLon, maxLon, minLat, maxLat };
}

function ZoomToCountry({ feature }) {
  const map = useMap();

  useEffect(() => {
    if (!feature) return;

    // Get bounding box from geometry
    const bounds = L.geoJSON(feature).getBounds();
    map.fitBounds(bounds, { padding: [20, 20], maxZoom: 6 }); // smooth zoom to area
  }, [feature, map]);

  return null; // it doesn't render anything itself
}

function pointInPolygon(point, polygon) {
  // point = [lon, lat]
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    const intersect =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

function isPointOnLand(point, countriesData) {
  for (const country of countriesData.features) {
    const geom = country.geometry;
    if (!geom || !geom.type || !geom.coordinates) continue; // skip invalid

    if (geom.type === "Polygon") {
      for (const ring of geom.coordinates) {
        if (pointInPolygon(point, ring)) return true;
      }
    } else if (geom.type === "MultiPolygon") {
      for (const poly of geom.coordinates) {
        for (const ring of poly) {
          if (pointInPolygon(point, ring)) return true;
        }
      }
    }
  }
  return false;
}

async function fetchTiledNASAData(param, minLon, maxLon, minLat, maxLat) {
  const MAX_SPAN = 10;
  const MAX_TILES = 16; // cap at 4×4 tiles = 160°×160° area max
  const promises = [];

  const numLonTiles = Math.ceil((maxLon - minLon) / MAX_SPAN);
  const numLatTiles = Math.ceil((maxLat - minLat) / MAX_SPAN);
  const totalTiles = numLonTiles * numLatTiles;

  // console.log(`Fetching ${totalTiles} NASA tiles...`);

  // Safety: if it's too many tiles (e.g., Russia, Canada)
  if (totalTiles > MAX_TILES) {
    console.warn("Country too large — sampling central region only.");

    const midLon = (minLon + maxLon) / 2;
    const midLat = (minLat + maxLat) / 2;

    minLon = midLon - (MAX_SPAN * 2);
    maxLon = midLon + (MAX_SPAN * 2);
    minLat = midLat - (MAX_SPAN * 2);
    maxLat = midLat + (MAX_SPAN * 2);
  }

  for (let lon = minLon; lon < maxLon; lon += MAX_SPAN) {
    for (let lat = minLat; lat < maxLat; lat += MAX_SPAN) {
      const tileMinLon = lon;
      const tileMaxLon = Math.min(lon + MAX_SPAN, maxLon);
      const tileMinLat = lat;
      const tileMaxLat = Math.min(lat + MAX_SPAN, maxLat);

      const url = `https://power.larc.nasa.gov/api/temporal/climatology/regional?parameters=${param}&community=RE&longitude-min=${tileMinLon}&longitude-max=${tileMaxLon}&latitude-min=${tileMinLat}&latitude-max=${tileMaxLat}&format=JSON`;

      promises.push(
        fetch(url)
          .then((res) => res.json())
          .then((data) => data.features || [])
          .catch((err) => {
            console.warn("NASA tile failed:", err);
            return [];
          })
      );
    }
  }

  const tiles = await Promise.all(promises);
  return tiles.flat();
}

export default function Map() {
  const [geoData, setGeoData] = useState(null);
  const [bestPoints, setBestPoints] = useState(null);
  const [dataType, setDataType] = useState("ALLSKY_KT"); // solar by default
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [aiInsight, setAiInsight] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);


  useEffect(() => {

  async function loadData() {
    if (!selectedCountry) return;

    setLoading(true);
    try {
      const { minLon, maxLon, minLat, maxLat } = getBoundingBox(selectedCountry);
      const features = await fetchTiledNASAData(dataType, minLon, maxLon, minLat, maxLat);

      const filtered = getBestPoints(features, dataType);
      const formattedAll = transformToGeoJSON(features, dataType, selectedCountry);
      const formattedBest = transformToGeoJSON(filtered, dataType, selectedCountry);
      setGeoData(formattedAll);
      setBestPoints(formattedBest);

       const insightText = await generateInsights(formattedAll, formattedBest, dataType, selectedCountry);
       setAiInsight(insightText);
    } catch (err) {
      console.error("Data load failed:", err);
    } finally {
      setLoading(false);
    }
  }


    loadData();
  }, [dataType, selectedCountry]);

  async function generateInsights(geoData, bestPoints, dataType, selectedCountry) {
  if (!geoData || !selectedCountry) return "No data available for analysis.";

  const values = geoData.features.map((f) => f.properties.value);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);

  const payload = {
    country: selectedCountry?.properties?.name,
    dataType,
    summaryStats: {
      average: avg,
      min,
      max,
      totalPoints: values.length,
      bestPointsCount: bestPoints?.features?.length || 0,
    },
    sampleData: geoData.features.slice(0, 50).map((f) => ({
      coordinates: f.geometry.coordinates,
      value: f.properties.value,
    })),
  };

  const dataTypeName =
    dataType === "ALLSKY_KT" ? "Solar (ALLSKY_KT)" : "Wind (WS50M)";

  const systemPrompt = `You are “GeoRenew Expert” — a domain expert in renewable energy geospatial analytics.  
Your input:  
- country name  
- data type (ALLSKY_KT or WS50M)  
- summary statistics: average, min, max, total points, best point count  
- sample of spatial points (lat/lon + value)  

Your task: produce an **insight summary** that a policy-maker, renewable energy planner, or investor would want. Cover:

1. Overall potential: how good is the resource vs common benchmarks  
2. Spatial patterns: where it’s strongest or weakest, any clustering or zones  
3. Anomalies or surprises: what stands out  
4. Risks or limitations: what could reduce the usefulness  
5. Actionable recommendation: what one should do next (e.g. where to site, what further data to collect, what threshold to aim for)

Requirements:  
- Plain text only (no JSON, minimal bullet points allowed)  
- Tone: professional but accessible  
- Length: about 80-120 words  
- Do *not* speculate beyond data (if sample does not show pattern, say “not enough evidence for spatial cluster”)  

Output format:

🤖 AI Insight — {country}, {dataTypeName}  
{Analytical summary: ~2 paragraphs}  
Key Recommendation: {one strong next-step}
`;

  const userPrompt = `
Country: ${payload.country}
Data Type: ${dataTypeName}
Summary: ${JSON.stringify(payload.summaryStats)}
Sample Data: ${JSON.stringify(payload.sampleData.slice(0, 5))}
`;

  try {
    const normalResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer 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",
        "HTTP-Referer": "https://yourapp.com", // replace with your domain
        "X-Title": "GeoRenew Insight",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    const normalData = await normalResponse.json();
    const reply = normalData?.choices?.[0]?.message?.content?.trim();

    return reply || "No insight generated.";
  } catch (err) {
    console.error("Insight generation failed:", err);
    return "⚠️ Insight unavailable (API error).";
  }
}


   return (
    <>
    <div
      style={{
        position: "absolute",
        top: 16,
        right: 16,
        zIndex: 1000,
        background: "rgba(255, 255, 255, 0.7)",
        padding: "16px",
        borderRadius: "16px",
        width: "260px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.3)",
      }}
    >
      <div
        style={{
          marginBottom: "10px",
          fontWeight: 600,
          fontSize: "14px",
          color: "#222",
          letterSpacing: "0.3px",
        }}
      >
        🌍 Select Country
      </div>

      <Select
        options={countriesData.features.map((f) => ({
          value: f.properties.name,
          label: f.properties.name,
          feature: f,
        }))}
        onChange={(opt) => setSelectedCountry(opt.feature)}
        placeholder="Search country..."
        isSearchable
        styles={{
          control: (base, state) => ({
            ...base,
            borderRadius: "10px",
            borderColor: state.isFocused ? "#ffcf33" : "rgba(0,0,0,0.1)",
            boxShadow: "none",
            background: "rgba(255,255,255,0.9)",
            minHeight: "42px",
            fontSize: "14px",
            "&:hover": { borderColor: "#ffcf33" },
          }),
          menu: (base) => ({
            ...base,
            borderRadius: "10px",
            backgroundColor: "rgba(255,255,255,0.95)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            zIndex: 3000,
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused
              ? "rgba(255,207,51,0.15)"
              : state.isSelected
              ? "#ffcf33"
              : "transparent",
            color: state.isSelected ? "#000" : "#222",
            fontWeight: state.isSelected ? 600 : 400,
            cursor: "pointer",
            padding: "8px 12px",
            transition: "all 0.15s ease",
          }),
          placeholder: (base) => ({ ...base, color: "#666" }),
          singleValue: (base) => ({ ...base, color: "#222" }),
        }}
      />

      <div
        style={{
          marginTop: "16px",
          display: "flex",
          borderRadius: "10px",
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.1)",
          background: "rgba(255,255,255,0.9)",
        }}
      >
        {[
          { label: "☀️ Solar", key: "ALLSKY_KT", activeColor: "#ffcf33", textColor: "#000" },
          { label: "💨 Wind", key: "WS50M", activeColor: "#33c2ff", textColor: "#fff" },
        ].map((btn) => (
          <button
            key={btn.key}
            onClick={() => setDataType(btn.key)}
            style={{
              flex: 1,
              background:
                dataType === btn.key ? btn.activeColor : "transparent",
              color:
                dataType === btn.key
                  ? btn.textColor
                  : "#444",
              fontWeight: 600,
              fontSize: "13px",
              padding: "8px 0",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
              userSelect: "none",
              WebkitTapHighlightColor: "transparent",
            }}
            onFocus={(e) => e.target.blur()} // 👈 prevents ugly outline
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>


    {loading && (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          zIndex: 2000,
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            border: "4px solid rgba(0,0,0,0.1)",
            borderTop: "4px solid #ffcf33",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: "12px",
          }}
        ></div>
        <div style={{ fontWeight: 600, color: "#333", fontSize: "15px" }}>
          Fetching {dataType === "ALLSKY_KT" ? "Solar" : "Wind"} Data...
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    )}
 {/* Sidebar AI Insights */}
{geoData && !loading && (
  <>
    {/* Toggle Button */}
    <button
      onClick={() => setShowSidebar((prev) => !prev)}
      style={{
  position: "absolute",
  top: "190px",
  right: showSidebar ? "290px" : "10px",
  zIndex: 1100,
  background: "rgba(255, 255, 255, 0.85)", // 👈 light glass
  color: "#1e293b", // dark text
  border: "1px solid rgba(255,255,255,0.4)",
  borderRadius: "50%",
  width: "28px",
  height: "28px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "700",
  transition: "right 0.3s ease-in-out, background 0.2s, color 0.2s",
  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
  backdropFilter: "blur(8px)", // softens against dark map
}}
onMouseEnter={(e) => {
  e.currentTarget.style.background = "rgba(255,255,255,0.95)";
  e.currentTarget.style.color = "#0f172a";
}}
onMouseLeave={(e) => {
  e.currentTarget.style.background = "rgba(255,255,255,0.85)";
  e.currentTarget.style.color = "#1e293b";
}}

    >
      {showSidebar ? "→" : "←"}
    </button>

    {/* Sidebar */}
    <div
      style={{
        position: "absolute",
        top: "189px",
        right: showSidebar ? "16px" : "-300px", // 👈 slide in/out
        zIndex: 1000,
        background: "rgba(255, 255, 255, 0.7)",
        padding: "12px",
        borderRadius: "14px",
        width: "262px",
        height: "250px",
        overflowY: "auto",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.3)",
        fontFamily: "Inter, sans-serif",
        color: "#222",
        fontSize: "9px",
        lineHeight: "1.3",
        transition: "right 0.4s ease-in-out",
      }}
      className="styled-scroll"
    >
      {/* --- Header --- */}
      <div
        style={{
          fontWeight: 700,
          marginBottom: "8px",
          fontSize: "9.5px",
          letterSpacing: "0.2px",
        }}
      >
        📊 Data Insights
      </div>

      {/* --- Top Row (Country + Type) --- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "6px",
          marginBottom: "5px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1 }}>
          <strong>Country:</strong>{" "}
          {selectedCountry?.properties?.name || "N/A"}
        </div>
        <div style={{ flex: 1 }}>
          <strong>Type:</strong>{" "}
          {dataType === "ALLSKY_KT" ? "Solar (ALLSKY_KT)" : "Wind (WS50M)"}
        </div>
      </div>

      {/* --- Key Stats --- */}
      <div
        style={{
          marginBottom: "6px",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <div>
          <strong>Total Points:</strong>{" "}
          {geoData.features.length.toLocaleString()}
        </div>
        <div>
          <strong>Best Points:</strong>{" "}
          {bestPoints?.features?.length?.toLocaleString() || 0}
        </div>
      </div>

      {/* --- Summary Stats --- */}
      <div
        style={{
          marginTop: "6px",
          borderTop: "1px solid #ddd",
          paddingTop: "6px",
        }}
      >
        {(() => {
          const values = geoData.features.map((f) => f.properties.value);
          const avg = values.reduce((a, b) => a + b, 0) / values.length || 0;
          const max = Math.max(...values);
          const min = Math.min(...values);
          return (
            <>
              <div>
                <strong>Average:</strong> {avg.toFixed(3)}
              </div>
              <div>
                <strong>Max:</strong> {max.toFixed(3)}
              </div>
              <div>
                <strong>Min:</strong> {min.toFixed(3)}
              </div>
            </>
          );
        })()}
      </div>

      {/* --- AI Insight Section --- */}
      {aiInsight && (
        <div
          style={{
            marginTop: "8px",
            paddingTop: "6px",
            borderTop: "1px solid #ddd",
            fontSize: "9px",
            lineHeight: "1.4",
            color: "#222",
            whiteSpace: "pre-line",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              marginBottom: "4px",
              fontSize: "9.5px",
            }}
          >
            🤖 AI Insight
          </div>
          {aiInsight}
        </div>
      )}
    </div>
  </>
)}


    
    <MapContainer
      center={[-1.286389, 36.817223]}
      zoom={6}
      style={{ height: "calc(100vh - 64px)", width: "100%", marginTop: "64px" }}
    >
      {/* <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      /> */}

    {/* <TileLayer
  url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
  attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
/> */}

<TileLayer
  url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
  attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
/>






       <ZoomToCountry feature={selectedCountry} />
      {geoData && <HeatmapLayer geoData={geoData} dataType={dataType}  />}
      {bestPoints && <BestPointsLayer geoData={bestPoints} dataType={dataType} />}
    </MapContainer>
    </>
  );
}
