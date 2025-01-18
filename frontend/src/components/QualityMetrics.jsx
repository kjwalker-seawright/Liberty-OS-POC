// src/components/QualityMetrics.jsx
import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';

export const QualityMetrics = ({ metrics }) => (
  <div className="tech-card p-6 rounded-xl">
    <div className="flex items-center mb-6">
      <div className="p-3 rounded-lg bg-white/5">
        <CheckCircle className="h-6 w-6 text-primary-glow" />
      </div>
      <h3 className="ml-4 text-lg font-semibold text-gray-200">Quality Analysis</h3>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 rounded-lg bg-white/5">
        <div className="text-sm text-gray-400 mb-2">Surface Quality</div>
        <div className="text-2xl font-bold text-primary-glow">
          {metrics.surface_quality.toFixed(1)}%
        </div>
      </div>
      
      <div className="p-4 rounded-lg bg-white/5">
        <div className="text-sm text-gray-400 mb-2">Dimensional Accuracy</div>
        <div className="text-2xl font-bold text-primary-glow">
          {metrics.dimensional_accuracy.toFixed(1)}%
        </div>
      </div>
      
      <div className="p-4 rounded-lg bg-white/5">
        <div className="text-sm text-gray-400 mb-2">Overall Quality</div>
        <div className="text-2xl font-bold text-primary-glow">
          {metrics.overall_quality.toFixed(1)}%
        </div>
      </div>
    </div>
  </div>
);