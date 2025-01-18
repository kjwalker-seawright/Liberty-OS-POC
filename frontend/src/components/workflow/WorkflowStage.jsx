// src/components/workflow/WorkflowStage.jsx
import React, { useState } from 'react';
import { 
  CheckCircle, AlertCircle, Clock, Play, Pause, Lock, Shield, 
  FileCheck, ClipboardCheck, Upload, Info, AlertTriangle
} from 'lucide-react';

const QualityGate = ({ gate, onMeasure, onDocumentUpload }) => {
  const [showDetails, setShowDetails] = useState(false);

  const renderMeasurementStatus = (measurement) => {
    if (gate.measurements[measurement]) {
      const measurementData = gate.measurements[measurement];
      const isWithinTolerance = 
        measurementData.value >= measurementData.nominal + measurementData.lower_tolerance &&
        measurementData.value <= measurementData.nominal + measurementData.upper_tolerance;

      return (
        <div className="flex items-center space-x-2">
          <span className={`text-xs ${isWithinTolerance ? 'text-green-400' : 'text-red-400'}`}>
            {measurementData.value.toFixed(3)} {measurementData.unit}
          </span>
          {isWithinTolerance ? 
            <CheckCircle className="h-3 w-3 text-green-400" /> :
            <AlertTriangle className="h-3 w-3 text-red-400" />
          }
        </div>
      );
    }
    return (
      <button
        onClick={() => onMeasure(gate.name, measurement)}
        className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
      >
        Take Measurement
      </button>
    );
  };

  return (
    <div className="mt-2">
      <div 
        className="flex items-center justify-between p-2 bg-white/5 rounded cursor-pointer hover:bg-white/10 transition-colors"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center space-x-2">
          <Shield className={`h-4 w-4 ${
            gate.status === 'completed' ? 'text-green-400' :
            gate.status === 'failed' ? 'text-red-400' :
            'text-gray-400'
          }`} />
          <span className="text-sm text-gray-300">{gate.name}</span>
          {gate.documentation_required && (
            <FileCheck className="h-4 w-4 text-yellow-500" />
          )}
          {gate.blocking && (
            <Lock className="h-3 w-3 text-gray-500" />
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Info className={`h-4 w-4 ${showDetails ? 'text-primary-glow' : 'text-gray-500'}`} />
        </div>
      </div>

      {showDetails && (
        <div className="mt-1 ml-2 p-2 bg-white/5 rounded text-xs space-y-2">
          <p className="text-gray-400">{gate.description}</p>
          
          <div className="space-y-2">
            <p className="text-gray-300 font-medium">Required Measurements:</p>
            {gate.required_measurements.map((measurement, idx) => (
              <div key={idx} className="flex justify-between items-center p-1 bg-black/20 rounded">
                <span className="text-gray-400">{measurement}</span>
                {renderMeasurementStatus(measurement)}
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <p className="text-gray-300 font-medium">Inspection Methods:</p>
            <div className="flex flex-wrap gap-2">
              {gate.inspection_methods.map((method, idx) => (
                <span key={idx} className="px-2 py-1 bg-white/5 rounded text-gray-400">
                  {method}
                </span>
              ))}
            </div>
          </div>

          {gate.documentation_required && (
            <div className="mt-2 p-2 bg-black/20 rounded">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Documentation</span>
                {gate.documentation_url ? (
                  <a 
                    href={gate.documentation_url}
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="flex items-center space-x-1 text-primary-glow hover:underline"
                  >
                    <FileCheck className="h-3 w-3" />
                    <span>View Document</span>
                  </a>
                ) : (
                  <button 
                    onClick={() => onDocumentUpload(gate.name)}
                    className="flex items-center space-x-1 text-gray-400 hover:text-primary-glow"
                  >
                    <Upload className="h-3 w-3" />
                    <span>Upload Document</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const StageProgress = ({ progress, isActive }) => (
  <div className="mt-2">
    <div className="flex justify-between text-xs text-gray-400 mb-1">
      <span>Progress</span>
      <span>{Math.round(progress)}%</span>
    </div>
    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
      <div 
        className={`h-full transition-all duration-500 ${
          isActive ? 'bg-blue-500' : 'bg-gray-600'
        }`}
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);

const MetricItem = ({ label, value, unit }) => {
  if (value === null || value === undefined) return null;
  
  const formattedValue = typeof value === 'number' 
    ? Number(value).toFixed(2) 
    : value;
  
  return (
    <div className="flex items-center justify-between py-1 px-2 bg-white/5 rounded hover:bg-white/10 transition-colors">
      <span className="text-xs text-gray-400">{label}:</span>
      <span className="text-xs text-gray-200">
        {formattedValue} {unit}
      </span>
    </div>
  );
};

const WorkflowStage = ({ 
  stage, 
  isActive, 
  onMeasure, 
  onDocumentUpload, 
  onApprove 
}) => {
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
      case 'locked':
        return <Lock className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className={`relative p-4 rounded-lg bg-gray-900 border ${
      isActive ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-gray-800'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <StatusIcon status={stage.status} />
          <h3 className="text-lg font-semibold text-white">{stage.name}</h3>
        </div>
        <div className="flex items-center space-x-2">
          {stage.approval_date && (
            <div className="flex items-center space-x-1 text-green-400">
              <ClipboardCheck className="h-4 w-4" />
              <span className="text-xs">Approved</span>
            </div>
          )}
          {stage.start_time && (
            <span className="text-xs text-gray-400">
              {new Date(stage.start_time).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
      
      <p className="text-sm text-gray-400 mb-3">{stage.description}</p>
      
      <StageProgress progress={stage.progress} isActive={isActive} />

      {stage.quality_gates.length > 0 && (
        <div className="mt-3 space-y-1">
          {stage.quality_gates.map((gate, index) => (
            <QualityGate 
              key={index} 
              gate={gate}
              onMeasure={onMeasure}
              onDocumentUpload={onDocumentUpload}
            />
          ))}
        </div>
      )}

      {stage.metrics && (
        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <MetricItem 
              label="Temperature"
              value={stage.metrics.temperature} 
              unit="°C"
            />
            <MetricItem 
              label="Spindle Speed"
              value={stage.metrics.spindle_speed} 
              unit="RPM"
            />
            <MetricItem 
              label="Feed Rate"
              value={stage.metrics.feed_rate} 
              unit="mm/min"
            />
            <MetricItem 
              label="Total Time"
              value={stage.metrics.total_time} 
              unit="min"
            />
          </div>
        </div>
      )}

      {stage.requires_approval && isActive && !stage.approval_date && 
       stage.quality_gates.every(gate => gate.status === 'completed') && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <button
            onClick={() => onApprove(stage.id)}
            className="w-full px-4 py-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors flex items-center justify-center space-x-2"
          >
            <ClipboardCheck className="h-4 w-4" />
            <span>Approve Stage</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkflowStage;