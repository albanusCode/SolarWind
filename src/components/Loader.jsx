import React from "react";
import { Sun } from "lucide-react"; // using lucide-react icons

const Loader = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50">
      {/* Rotating Sun */}
      <div className="animate-spin text-yellow-400 mb-6">
        <Sun size={64} />
      </div>

      {/* Pulsing Wind Icon + Blinking Dots */}
      <div className="flex items-center space-x-2">
        <span className="text-xl font-semibold text-green-400">
          Harnessing Energy
          <span className="animate-bounce inline-block">.</span>
          <span className="animate-bounce inline-block [animation-delay:0.2s]">.</span>
          <span className="animate-bounce inline-block [animation-delay:0.4s]">.</span>
        </span>
      </div>
    </div>
  );
};

export default Loader;
