// src/components/AnomalyDetection.jsx
import React from 'react';
import { AlertCircle } from 'lucide-react';

export const AnomalyDetection = ({ anomalyData }) => (
  <div className="tech-card p-6 rounded-xl">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <div className="p-3 rounded-lg bg-white/5">
          <AlertCircle className="h-6 w-6 text-primary-glow" />
        </div>
        <h3 className="ml-4 text-lg font-semibold text-gray-200">Process Monitoring</h3>
      </div>
      {anomalyData.is_anomaly && (
        <div className={`px-3 py-1 rounded-full ${
          anomalyData.severity === 'high' ? 'bg-red-400/10 text-red-400' :
          anomalyData.severity === 'medium' ? 'bg-yellow-400/10 text-yellow-400' :
          'bg-green-400/10 text-green-400'
        }`}>
          {anomalyData.severity.toUpperCase()} Severity
        </div>
      )}
    </div>

    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-white/5">
        <div className="text-sm text-gray-400 mb-2">Process Status</div>
        <div className={`text-lg font-bold ${anomalyData.is_anomaly ? 'text-red-400' : 'text-green-400'}`}>
          {anomalyData.is_anomaly ? 'Anomaly Detected' : 'Normal Operation'}
        </div>
      </div>

      {anomalyData.is_anomaly && anomalyData.potential_causes.length > 0 && (
        <div className="p-4 rounded-lg bg-white/5">
          <div className="text-sm text-gray-400 mb-2">Potential Causes</div>
          <ul className="space-y-2">
            {anomalyData.potential_causes.map((cause, index) => (
              <li key={index} className="flex items-center text-red-400">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span>{cause}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>
);