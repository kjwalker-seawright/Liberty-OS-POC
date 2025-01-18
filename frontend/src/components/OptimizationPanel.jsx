import React, { useState, useEffect } from 'react';
import { Zap, TrendingUp, Wrench, AlertTriangle } from 'lucide-react';

const OptimizationPanel = ({ currentParams, currentStage }) => {
  const [optimization, setOptimization] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOptimization = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://127.0.0.1:8000/optimize/parameters/${currentStage}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(currentParams),
        });
        const data = await response.json();
        setOptimization(data);
      } catch (error) {
        console.error('Error fetching optimization:', error);
      }
      setLoading(false);
    };

    fetchOptimization();
  }, [currentParams, currentStage]);

  if (loading || !optimization) {
    return (
      <div className="tech-card p-6 rounded-xl animate-pulse">
        <div className="h-6 w-48 bg-white/5 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 w-full bg-white/5 rounded"></div>
          <div className="h-4 w-3/4 bg-white/5 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="tech-card p-6 rounded-xl">
      <div className="flex items-center mb-6">
        <div className="p-3 rounded-lg bg-white/5">
          <Zap className="h-6 w-6 text-primary-glow" />
        </div>
        <h3 className="ml-4 text-lg font-semibold text-gray-200">AI Optimization</h3>
      </div>

      {/* Efficiency Gains */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-white/5">
          <div className="text-sm text-gray-400 mb-1">Time Reduction</div>
          <div className="text-xl font-bold text-primary-glow">
            {optimization.efficiency_gains.time_reduction}%
          </div>
        </div>
        <div className="p-4 rounded-lg bg-white/5">
          <div className="text-sm text-gray-400 mb-1">Energy Savings</div>
          <div className="text-xl font-bold text-emerald-400">
            {optimization.efficiency_gains.energy_savings}%
          </div>
        </div>
        <div className="p-4 rounded-lg bg-white/5">
          <div className="text-sm text-gray-400 mb-1">Tool Life Extension</div>
          <div className="text-xl font-bold text-yellow-400">
            {optimization.efficiency_gains.tool_life_extension}%
          </div>
        </div>
      </div>

      {/* Parameter Recommendations */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Recommended Parameters</h4>
        <div className="space-y-3">
          {Object.entries(optimization.optimized_parameters).map(([param, value]) => (
            param !== 'tool_type' && (
              <div key={param} className="flex items-center justify-between">
                <span className="text-gray-300 capitalize">{param.replace(/_/g, ' ')}</span>
                <div className="flex items-center">
                  <span className="text-gray-200">{value.toFixed(2)}</span>
                  {value > currentParams[param] ? (
                    <TrendingUp className="h-4 w-4 text-green-400 ml-2" />
                  ) : value < currentParams[param] ? (
                    <TrendingUp className="h-4 w-4 text-red-400 ml-2 transform rotate-180" />
                  ) : null}
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-3">AI Recommendations</h4>
        <div className="space-y-2">
          {optimization.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start text-sm text-gray-300">
              <Wrench className="h-4 w-4 text-primary-glow mr-2 mt-0.5 flex-shrink-0" />
              <span>{recommendation}</span>
            </div>
          ))}
        </div>
      </div>

      {optimization.quality_improvement > 0 && (
        <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="flex items-center text-green-400">
            <TrendingUp className="h-5 w-5 mr-2" />
            <span className="font-medium">
              Predicted Quality Improvement: {optimization.quality_improvement.toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {optimization.quality_improvement < 0 && (
        <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <div className="flex items-center text-red-400">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span className="font-medium">
              Warning: Quality Impact: {optimization.quality_improvement.toFixed(1)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizationPanel;