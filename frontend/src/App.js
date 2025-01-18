// src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Settings, AlertCircle, Cpu, Activity, TrendingUp, BarChart2 } from 'lucide-react';
import { MetricCard } from './components/MetricCard';
import { ProgressRing } from './components/ProgressRing';
import { ParameterControl } from './components/ParameterControl';
import { QualityMetrics } from './components/QualityMetrics';
import { MaintenancePanel } from './components/MaintenancePanel';
import { AnomalyDetection } from './components/AnomalyDetection';
import WorkflowTracker from './components/workflow/WorkflowTracker';
import OptimizationPanel from './components/OptimizationPanel';
import ParameterAnalysis from './components/ParameterAnalysis';
import DigitalTwin from './components/digital-twin/DigitalTwin';

function App() {
  const [processData, setProcessData] = useState(null);
  const [parameters, setParameters] = useState({
    cutting_speed: 100.0,
    feed_rate: 0.2,
    depth_of_cut: 2.0,
    tool_type: "carbide"
  });
  const [history, setHistory] = useState([]);
  const [currentStage, setCurrentStage] = useState("Initial Machining");

  const simulateMachining = useCallback(async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/simulate/machining', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parameters),
      });
      const data = await response.json();
      setProcessData(data);
      setHistory(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        ...data
      }].slice(-10));
    } catch (error) {
      console.error('Error:', error);
    }
  }, [parameters]);

  useEffect(() => {
    simulateMachining();
    const interval = setInterval(simulateMachining, 5000);
    return () => clearInterval(interval);
  }, [simulateMachining]);

  useEffect(() => {
    const fetchCurrentStage = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/workflow/current');
        const data = await response.json();
        setCurrentStage(data.name);
      } catch (error) {
        console.error('Error fetching current stage:', error);
      }
    };

    fetchCurrentStage();
    const interval = setInterval(fetchCurrentStage, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!processData) return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-glow mx-auto"></div>
        <p className="mt-4 text-gray-400">Initializing Liberty OS...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B1120] text-gray-100">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-glow to-secondary-glow">
                  Liberty OS
                </h1>
                <p className="mt-1 text-sm text-gray-400">Intelligent Maritime Manufacturing Control Center</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-sm text-gray-400">System Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Basic Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Operation Time"
            value={`${processData.operation_time} min`}
            icon={<Settings className="h-6 w-6 text-primary-glow" />}
            trend={processData.operation_time < 35 ? "positive" : "negative"}
          />
          <MetricCard
            title="Quality Score"
            value={`${processData.quality_metrics.overall_quality.toFixed(1)}%`}
            icon={<AlertCircle className="h-6 w-6 text-emerald-400" />}
            trend={processData.quality_metrics.overall_quality > 85 ? "positive" : "negative"}
            detail="AI Predicted"
          />
          <MetricCard
            title="Energy Usage"
            value={`${processData.energy_consumption} kWh`}
            icon={<Cpu className="h-6 w-6 text-yellow-400" />}
            trend={processData.energy_consumption < 5 ? "positive" : "negative"}
          />
          <MetricCard
            title="Tool Wear"
            value={`${processData.tool_wear}%`}
            icon={<Activity className="h-6 w-6 text-red-400" />}
            trend={processData.tool_wear < 50 ? "positive" : "negative"}
          />
        </div>

        {/* Digital Twin Section */}
        <div className="mb-8">
          <DigitalTwin
            parameters={parameters}
            processData={processData}
          />
        </div>

        {/* Workflow Tracker */}
        <div className="mb-8">
          <WorkflowTracker />
        </div>

        {/* Advanced ML Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <QualityMetrics metrics={processData.quality_metrics} />
          <MaintenancePanel metrics={processData.maintenance_metrics} />
        </div>

        {/* Optimization Panel */}
        <div className="mb-8">
          <OptimizationPanel 
            currentParams={parameters} 
            currentStage={currentStage} 
          />
        </div>

        {/* After the OptimizationPanel */}
        <div className="mb-8">
          <ParameterAnalysis currentParams={parameters} />
        </div>

        {/* Process Monitoring and Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="tech-card chart-container p-6 rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-white/5">
                  <BarChart2 className="h-6 w-6 text-primary-glow" />
                </div>
                <h3 className="ml-4 text-lg font-semibold text-gray-200">Performance Metrics</h3>
              </div>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="qualityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C5F4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22C5F4" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="wearGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="rgba(255,255,255,0.5)"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.5)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(13, 17, 23, 0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="quality_metrics.overall_quality" 
                    name="Quality Score" 
                    stroke="#22C5F4" 
                    fill="url(#qualityGradient)"
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="tool_wear" 
                    name="Tool Wear" 
                    stroke="#EF4444" 
                    fill="url(#wearGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <AnomalyDetection anomalyData={processData.anomaly_detection} />
        </div>

        {/* Parameter Controls */}
        <div className="tech-card p-6 rounded-xl">
          <div className="flex items-center mb-6">
            <div className="p-3 rounded-lg bg-white/5">
              <Settings className="h-6 w-6 text-primary-glow" />
            </div>
            <h3 className="ml-4 text-lg font-semibold text-gray-200">Process Parameters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ParameterControl
              label="Cutting Speed"
              value={parameters.cutting_speed}
              min={50}
              max={200}
              step={1}
              onChange={(e) => setParameters(prev => ({ ...prev, cutting_speed: parseFloat(e.target.value) }))}
              unit="m/min"
            />
            <ParameterControl
              label="Feed Rate"
              value={parameters.feed_rate}
              min={0.1}
              max={0.5}
              step={0.1}
              onChange={(e) => setParameters(prev => ({ ...prev, feed_rate: parseFloat(e.target.value) }))}
              unit="mm/rev"
            />
            <ParameterControl
              label="Depth of Cut"
              value={parameters.depth_of_cut}
              min={0.5}
              max={5}
              step={0.5}
              onChange={(e) => setParameters(prev => ({ ...prev, depth_of_cut: parseFloat(e.target.value) }))}
              unit="mm"
            />
            <div className="tech-card p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-400 mb-2">Tool Type</label>
              <select
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-glow text-gray-200"
                value={parameters.tool_type}
                onChange={(e) => setParameters(prev => ({ ...prev, tool_type: e.target.value }))}
              >
                <option value="carbide">Carbide</option>
                <option value="high_speed_steel">High Speed Steel</option>
                <option value="diamond">Diamond</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;