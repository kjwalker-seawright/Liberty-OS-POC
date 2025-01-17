// frontend/src/components/workflow/WorkflowStage.jsx

import React from 'react';
import { CheckCircle, AlertCircle, Clock, Play, Pause } from 'lucide-react';

const StatusIcon = ({ status }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'in_progress':
      return <Play className="h-5 w-5 text-blue-500 animate-pulse" />;
    case 'failed':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case 'paused':
      return <Pause className="h-5 w-5 text-yellow-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-400" />;
  }
};

const WorkflowStage = ({ stage, isActive }) => {
  return (
    <div className={`relative p-4 rounded-lg bg-gray-900 border ${
      isActive ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-gray-800'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <StatusIcon status={stage.status} />
          <h3 className="text-lg font-semibold text-white">{stage.name}</h3>
        </div>
        <span className="text-sm text-gray-400">{Math.round(stage.progress)}%</span>
      </div>
      
      <p className="text-sm text-gray-400 mb-3">{stage.description}</p>
      
      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all duration-500"
          style={{ width: `${stage.progress}%` }}
        />
      </div>

      {/* Quality Gates */}
      {stage.quality_gates.length > 0 && (
        <div className="mt-3">
          <p className="text-sm font-medium text-gray-400 mb-2">Quality Gates</p>
          <div className="space-y-2">
            {stage.quality_gates.map((gate, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-300">{gate.name}</span>
                <StatusIcon status={gate.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowStage;