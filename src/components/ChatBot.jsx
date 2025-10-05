import React, { useState } from "react";
import { createPortal } from "react-dom";

const ChatBot = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState("");

  const apiHistory = chatMessages.map(m => ({
  role: m.sender === "user" ? "user" : "assistant",
  content: m.text
}));
   
 // Handle user pressing Enter
 const handleKeyDown = async (e) => {
   if (e.key === "Enter" && userInput.trim() !== "") {
     if (!chatOpen) setChatOpen(true);
 
     setChatMessages((prev) => [...prev, { sender: "user", text: userInput }]);
    
     try {
       let reply = "";
 
       // Step 1: Ask LLM if API call is needed & extract/infer parameters if needed
       const paramCheckResponse = await fetch(
         "https://openrouter.ai/api/v1/chat/completions",
         {
           method: "POST",
           headers: {
             Authorization: "Bearer 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",
             "HTTP-Referer": "<YOUR_SITE_URL>",
             "X-Title": "<Nasa>",
             "Content-Type": "application/json",
           },
           body: JSON.stringify({
             model: "openai/gpt-oss-20b:free",
             messages: [
               {
                 role: "system",
                 content:
                   `You are an expert renewable-energy analyst and GIS consultant.
                Primary task: analyze the user’s natural-language input and generate all parameters required for a NASA POWER **regional** monthly data API request.
                
                Strong requirements (must follow exactly):
                1. Always return a **regional** result (latitude-min, latitude-max, longitude-min, longitude-max). Never return a single-point JSON schema. If the user mentions a city/coordinate, infer a small regional box around that point (see rules below).
                2. Output **only** a JSON object in this exact structure (no text, no markdown, no explanation):
                
                {
                  "start": <YYYY>,
                  "end": <YYYY>,
                  "latitude-min": <float>,
                  "latitude-max": <float>,
                  "longitude-min": <float>,
                  "longitude-max": <float>,
                  "community": "re",
                  "parameters": "ALLSKY_SFC_SW_DWN,WS10M,T2M,RH2M,PRECTOT"
                }
                
                3. If the user’s input clearly cannot or should not be mapped to a geographic area (for example a purely conceptual, policy, financial, or formatting question), return null (literal null, no quotes). For any phrasing that could reasonably map to a place (including “best place for solar in X” or “where to plant a solar farm”), **infer** a region — do not return null.
                
                Geographic inference rules:
                - If the user provides an explicit bounding box or coordinates, validate and return them (clamp to valid ranges).
                - If the user gives a city or specific coordinate, produce a **small** bounding box ≈ 2° × 2° centered on that location.
                - If the user gives a small region or province, produce a **medium** bounding box ≈ 5°–10° × 5°–10° representing that region.
                - If the user gives a country, produce an approximate national extent bounding box.
                - If the user requests a vague/qualitative “best place” (e.g., “best place for solar in Africa”), infer a **promising subregion** using known solar-resource logic (favor high insolation, low cloud/precipitation, flat/low-slope land, and proximity to roads/grid). Choose a plausible bounding box that captures that subregion rather than returning a whole continent.
                - If the user requests “global,” use:
                  latitude-min = -90, latitude-max = 90, longitude-min = -180, longitude-max = 180.
                
                Temporal rules:
                - If start/end years are provided, use them (years only, YYYY).
                - If missing, default to the **last 5 years ending in the current year** (end = current year; start = current year − 4).
                - Ensure start ≤ end and both are valid four-digit years.
                
                Validation and formatting:
                - Ensure latitude values are within [-90, 90] and longitude values within [-180, 180]. If needed, clip values to these ranges.
                - Ensure latitude-min < latitude-max and longitude-min < longitude-max. If inference produces equal values, expand by 0.5° each side.
                - Round all coordinate outputs to **one decimal place**.
                - Always set "community": "re".
                - Always set "parameters": "ALLSKY_SFC_SW_DWN,WS10M,T2M,RH2M,PRECTOT".
                
                Behavioural rules:
                - Prefer concrete inferred regions over returning null for under-specified geographic requests.
                - Avoid returning excessively large boxes (do not return global extents unless explicitly asked).
                - Do not include explanations, reasons, or extra keys in the output JSON.
                - Output must be syntactically valid JSON only.
                
                Edge cases:
                - If the user gives multiple non-contiguous locations (e.g., “compare Morocco and Kenya”), infer a single bounding box that covers both countries reasonably (expanded to contain both); do not return multiple JSON objects.
                - If the user asks for time series beyond the NASA POWER allowed span, clamp to reasonable years but still return a JSON object.
                
                If the prompt cannot be satisfied because the user’s request is purely conceptual or non-geographic, return null.
                `
               },
               {
                 role: "user",
                 content: `User input: "${userInput}"`
               }
             ],
           }),
         }
       );
 
       const paramCheckData = await paramCheckResponse.json();
       console.log("parsed params", paramCheckData)
         const parsedParams = JSON.parse(paramCheckData.choices[0].message.content);
         console.log("parsed params", parsedParams)
         
 
       if (parsedParams) {
         // Step 2: Call NASA POWER API
  // Assuming parsedParams is already defined, e.g.:
 // const parsedParams = { start: 2021, end: 2025, "latitude-min": 6, "latitude-max": 12, "longitude-min": 24, "longitude-max": 30, community: "re", parameters: "ALLSKY_SFC_SW_DWN,WS10M,T2M,RH2M,PRECTOT" };
 
 async function fetchRegionalNasaDataAnnual(parsedParams) {
   const {
     "latitude-min": latMin,
     "latitude-max": latMax,
     "longitude-min": lonMin,
     "longitude-max": lonMax,
     start,
     end,
     parameters,
     community
   } = parsedParams;
 
   const paramList = parameters.split(",").map(p => p.trim());
   const results = {};
 
   // Split range to obey NASA 10° limit
   const chunkRange = (min, max, step = 10) => {
     const chunks = [];
     for (let i = min; i < max; i += step) {
       chunks.push({ min: i, max: Math.min(i + step, max) });
     }
     return chunks;
   };
 
   const latChunks = chunkRange(latMin, latMax, 10);
   const lonChunks = chunkRange(lonMin, lonMax, 10);
 
   for (const param of paramList) {
     results[param] = [];
 
     for (const lat of latChunks) {
       for (const lon of lonChunks) {
         const nasaUrl = `https://power.larc.nasa.gov/api/temporal/monthly/regional?parameters=${param}&start=${start}&end=${end}&latitude-min=${lat.min}&latitude-max=${lat.max}&longitude-min=${lon.min}&longitude-max=${lon.max}&community=${community}&format=JSON`;
 
         try {
           const response = await fetch(nasaUrl);
           const data = await response.json();
 
           if (!response.ok || !data?.features?.length) {
             console.warn(`⚠️ Error for ${param}:`, data);
             continue;
           }
 
           // Collect all monthly values from all tiles
           const monthlyData = {};
           for (const feature of data.features) {
             const paramData = feature.properties?.parameter?.[param];
             if (!paramData) continue;
 
             for (const [key, val] of Object.entries(paramData)) {
               if (!monthlyData[key]) monthlyData[key] = [];
               monthlyData[key].push(val);
             }
           }
 
           // Average across all tiles per month
           const avgMonthly = {};
           for (const [key, arr] of Object.entries(monthlyData)) {
             avgMonthly[key] =
               arr.reduce((a, b) => a + b, 0) / arr.length;
           }
 
           // Aggregate months → annual averages
           const annualData = {};
           Object.entries(avgMonthly).forEach(([key, value]) => {
             const year = key.slice(0, 4);
             if (!annualData[year]) annualData[year] = [];
             annualData[year].push(value);
           });
 
           Object.keys(annualData).forEach((year) => {
             const values = annualData[year];
             const avg = values.reduce((a, b) => a + b, 0) / values.length;
             annualData[year] = parseFloat(avg.toFixed(2));
           });
 
           results[param].push(annualData);
         } catch (err) {
           console.error(`❌ Failed for ${param} (${lat.min}-${lat.max}, ${lon.min}-${lon.max})`, err);
         }
       }
     }
   }
 
   // Merge all chunks → single annual average per param
   const summarized = {};
   for (const param of paramList) {
     const yearlyTotals = {};
 
     results[param].forEach(tileData => {
       for (const [year, val] of Object.entries(tileData)) {
         if (!yearlyTotals[year]) yearlyTotals[year] = [];
         yearlyTotals[year].push(val);
       }
     });
 
     summarized[param] = {};
     for (const [year, vals] of Object.entries(yearlyTotals)) {
       const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
       summarized[param][year] = parseFloat(avg.toFixed(2));
     }
   }
 
   const nasaAnnualData = {
     region: { latMin, latMax, lonMin, lonMax },
     start,
     end,
     parameters: paramList,
     annual_summary: summarized,
   };
 
   console.log("✅ Annual NASA Regional Data:", nasaAnnualData);
   return nasaAnnualData;
 }
  
 const nasaAnnualData = await fetchRegionalNasaDataAnnual(parsedParams);
 
 // You can now use nasaData for heatmaps, analysis, etc.
 console.log("Final Merged Data Object:", nasaAnnualData);
 
 
         // Step 3: Ask LLM to analyze NASA data
         const analysisResponse = await fetch(
           "https://openrouter.ai/api/v1/chat/completions",
           {
             method: "POST",
             headers: {
               Authorization: "Bearer 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",
               "HTTP-Referer": "<YOUR_SITE_URL>",
               "X-Title": "<Nasa>",
               "Content-Type": "application/json",
             },
             body: JSON.stringify({
               model: "openai/gpt-oss-20b:free",
               messages: [
                 {
                   role: "system",
                   content:
                     `
                  You are a renewable-energy analyst and geospatial expert interpreting NASA POWER API and related site data for Africa.
                  
                  Your task: Recommend and describe the best locations in Africa for solar power projects based on the provided data or context.
                  
                  Guidelines:
                  1. Always mention a real location — a recognizable city or region (e.g., Garissa, Kenya; Ouarzazate, Morocco; Upington, South Africa).
                  2. Keep your response short (under 8 sentences). Focus on insight, not raw data.
                  3. Use plain, natural English — no tables, Markdown, or headings.
                  4. Include human-relevant context: land suitability, distance to grid or roads, terrain, weather stability, and policy support.
                  5. When possible, reference broader regional trends or nearby infrastructure (e.g., “close to major transmission lines” or “near existing solar developments”).
                  6. Avoid coordinates, heavy statistics, or repetition.
                  7. Write as if explaining to an investor, policymaker, or curious citizen — confident, practical, and concise.
                  8. You may use knowledge of global geography and renewable-energy policy to infer details, even if not explicitly in the data.
                  
                  Goal:
                  Produce a short, expert, but friendly summary identifying a *real place* that stands out for solar power potential, explaining why it’s promising in simple, insightful terms.

                  `}, ...apiHistory,
                 {
                   role: "user",
                   content: `User asked: "${userInput}". Here is the NASA POWER data: ${JSON.stringify(
                     nasaAnnualData
                   )}. Provide a clear, actionable answer about renewable energy potential.`
                 }
               ],
             }),
           }
         );
 
         const analysisData = await analysisResponse.json();
         reply = analysisData.choices[0].message.content;
        
         console.log(analysisData)
       } else {
         // Step 4: If no API call is needed, just respond with LLM normally
         const normalResponse = await fetch(
           "https://openrouter.ai/api/v1/chat/completions",
           {
             method: "POST",
             headers: {
               Authorization: "Bearer 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",
               "HTTP-Referer": "<YOUR_SITE_URL>",
               "X-Title": "<Nasa>",
               "Content-Type": "application/json",
             },
             body: JSON.stringify({
               model: "openai/gpt-oss-20b:free",
               messages: [{
                 role: "system", content: `
                  You are an expert renewable energy assistant. 
                  
                  - For follow-up questions, interpret the user query using previously fetched NASA POWER data if available.
                  - If no API data is needed, answer with insights, guidance, or explanations using general renewable energy knowledge.
                  - Provide clear, actionable, and concise answers.
                  - Highlight any assumptions or limitations.
                  `}, ...apiHistory, { role: "user", content: userInput }]
             }),
           }
         );
 
         const normalData = await normalResponse.json();
         reply = normalData.choices[0].message.content;
         console.log(chatMessages)
       }
 
       setChatMessages((prev) => [...prev, { sender: "assistant", text: reply }]);
     } catch (error) {
       console.error(error);
       setChatMessages((prev) => [
         ...prev,
         { sender: "assistant", text: "Sorry, something went wrong. Please try again." },
       ]);
     }
     
     setUserInput("");
   }
 };

  const chatUI = (
    <div
      id="chatbot-root"
      className="flex flex-col items-start"
      style={{
        pointerEvents: "auto",
      }}
    >
      {/* Floating Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-all w-12 h-12 sm:w-16 sm:h-16"
      >
        <span className="text-white text-xl sm:text-2xl">🤖</span>
      </button>

      {/* Chat Box */}
      {chatOpen && (
        <div className="mt-3 w-[90vw] sm:w-80 bg-black/90 text-white rounded-xl shadow-2xl border border-gray-700 flex flex-col max-h-[60vh] sm:max-h-[70vh] backdrop-blur-md">
          <div className="p-3 flex-1 overflow-y-auto space-y-2">
            {chatMessages.length === 0 && (
              <p className="text-sm text-gray-400 text-center">
                Ask me about solar or wind power 🌍
              </p>
            )}
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg text-sm max-w-[85%] break-words ${
                  msg.sender === "user"
                    ? "bg-green-600 self-end ml-auto"
                    : "bg-gray-700 self-start mr-auto"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="p-2 border-t border-gray-700 bg-gray-800">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="w-full px-3 py-2 rounded-md bg-gray-700 text-white text-sm outline-none placeholder-gray-400"
            />
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(chatUI, document.body);
};

export default ChatBot;
