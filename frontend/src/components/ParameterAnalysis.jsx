// src/components/ParameterAnalysis.jsx
import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  Timer,
  Gauge,
  BarChart2
} from 'lucide-react';

const AnalysisCard = ({ title, value, unit, icon, trend, color = "primary-glow" }) => (
  <div className="p-4 rounded-lg bg-white/5">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-gray-400">{title}</span>
      {icon}
    </div>
    <div className={`text-xl font-bold text-${color}`}>
      {value}{unit && <span className="text-sm ml-1">{unit}</span>}
    </div>
    {trend && (
      <div className="mt-1 text-sm text-gray-400">
        {trend}
      </div>
    )}
  </div>
);

const ParameterAnalysis = ({ currentParams }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://127.0.0.1:8000/analyze/parameters', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(currentParams),
        });
        const data = await response.json();
        setAnalysis(data);
      } catch (error) {
        console.error('Error fetching analysis:', error);
      }
      setLoading(false);
    };

    fetchAnalysis();
  }, [currentParams]);

  if (loading || !analysis) {
    return (
      <div className="tech-card p-6 rounded-xl animate-pulse">
        <div className="h-6 w-48 bg-white/5 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-white/5 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="tech-card p-6 rounded-xl">
      <div className="flex items-center mb-6">
        <div className="p-3 rounded-lg bg-white/5">
          <BarChart2 className="h-6 w-6 text-primary-glow" />
        </div>
        <h3 className="ml-4 text-lg font-semibold text-gray-200">Parameter Analysis</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <AnalysisCard
          title="Surface Quality"
          value={`${analysis.quality_impacts.surface_finish.score.toFixed(1)}%`}
          icon={<Gauge className="h-5 w-5 text-emerald-400" />}
          trend={analysis.quality_impacts.surface_finish.limiting_factor}
        />
        <AnalysisCard
          title="Tool Load"
          value={analysis.parameter_interactions.tool_load}
          unit="kN"
          icon={<Activity className="h-5 w-5 text-yellow-400" />}
          trend={`Pattern: ${analysis.quality_impacts.tool_wear_rate.wear_pattern}`}
        />
        <AnalysisCard
          title="Material Removal"
          value={analysis.efficiency_impacts.material_removal_rate}
          unit="cm³/min"
          icon={<Zap className="h-5 w-5 text-primary-glow" />}
        />
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Process Health Indicators</h4>
        
        {/* Energy Efficiency */}
        <div className="bg-white/5 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Energy Efficiency</span>
            <span className="text-sm font-medium text-primary-glow">
              {analysis.efficiency_impacts.energy_efficiency.score.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-900 rounded-full h-2">
            <div 
              className="bg-primary-glow rounded-full h-2 transition-all duration-500"
              style={{ width: `${analysis.efficiency_impacts.energy_efficiency.score}%` }}
            />
          </div>
        </div>

        {/* Tool Life */}
        <div className="bg-white/5 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Tool Life Remaining</span>
            <span className="text-sm font-medium text-yellow-400">
              {analysis.efficiency_impacts.tool_life.remaining_percentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-900 rounded-full h-2">
            <div 
              className="bg-yellow-400 rounded-full h-2 transition-all duration-500"
              style={{ width: `${analysis.efficiency_impacts.tool_life.remaining_percentage}%` }}
            />
          </div>
          {analysis.efficiency_impacts.tool_life.replacement_warning && (
            <div className="flex items-center mt-2 text-sm text-red-400">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span>Tool replacement recommended</span>
            </div>
          )}
        </div>

        {/* Dimensional Accuracy */}
        <div className="bg-white/5 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Dimensional Accuracy</span>
            <span className="text-sm font-medium text-emerald-400">
              Tolerance: {analysis.quality_impacts.dimensional_accuracy.tolerance_range}
            </span>
          </div>
          <div className="w-full bg-gray-900 rounded-full h-2">
            <div 
              className="bg-emerald-400 rounded-full h-2 transition-all duration-500"
              style={{ width: `${analysis.quality_impacts.dimensional_accuracy.score}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParameterAnalysis;