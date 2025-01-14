// src/components/MaintenancePanel.jsx
import React from 'react';
import { Wrench, AlertOctagon } from 'lucide-react';

export const MaintenancePanel = ({ metrics }) => {
  const getHealthColor = (health) => {
    if (health > 70) return 'text-green-400';
    if (health > 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="tech-card p-6 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-3 rounded-lg bg-white/5">
            <Wrench className="h-6 w-6 text-primary-glow" />
          </div>
          <h3 className="ml-4 text-lg font-semibold text-gray-200">Maintenance Status</h3>
        </div>
        {metrics.maintenance_needed && (
          <div className="flex items-center px-3 py-1 rounded-full bg-red-400/10 text-red-400">
            <AlertOctagon className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Maintenance Required</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-white/5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Tool Health</span>
            <span className={`text-lg font-bold ${getHealthColor(metrics.tool_health)}`}>
              {metrics.tool_health.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`rounded-full h-2 ${getHealthColor(metrics.tool_health)}`}
              style={{ width: `${metrics.tool_health}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-white/5">
            <div className="text-sm text-gray-400 mb-2">Estimated Remaining Hours</div>
            <div className="text-2xl font-bold text-primary-glow">
              {metrics.estimated_remaining_hours.toFixed(1)}h
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-white/5">
            <div className="text-sm text-gray-400 mb-2">Maintenance Priority</div>
            <div className={`text-lg font-bold ${
              metrics.maintenance_priority === 'high' ? 'text-red-400' :
              metrics.maintenance_priority === 'medium' ? 'text-yellow-400' :
              'text-green-400'
            }`}>
              {metrics.maintenance_priority.toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};