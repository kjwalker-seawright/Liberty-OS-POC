// src/components/digital-twin/DigitalTwin.jsx
import React from 'react';
import Scene from './Scene';

const DigitalTwin = ({ parameters, processData }) => {
  return (
    <div className="tech-card p-6 rounded-xl">
      <div className="flex items-center mb-6">
        <div className="p-3 rounded-lg bg-white/5">
          <svg
            className="h-6 w-6 text-primary-glow"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="ml-4 text-lg font-semibold text-gray-200">Digital Twin</h3>
      </div>
      
      <div className="h-[500px]">
        <Scene parameters={parameters} processData={processData} />
      </div>
    </div>
  );
};

export default DigitalTwin;