// frontend/src/components/workflow/WorkflowTracker.jsx

import React, { useState, useEffect } from 'react';
import WorkflowStage from './WorkflowStage';

const WorkflowTracker = () => {
  const [stages, setStages] = useState([]);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  useEffect(() => {
    // Fetch initial workflow stages
    fetchStages();

    // Poll for updates
    const interval = setInterval(fetchStages, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStages = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/workflow/stages');
      const data = await response.json();
      setStages(data);
      
      // Find current stage index
      const currentIndex = data.findIndex(stage => stage.status === 'in_progress');
      setCurrentStageIndex(currentIndex >= 0 ? currentIndex : 0);
    } catch (error) {
      console.error('Error fetching workflow stages:', error);
    }
  };

  return (
    <div className="p-6 bg-gray-950 rounded-xl">
      <h2 className="text-xl font-bold text-white mb-6">Manufacturing Workflow</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stages.map((stage, index) => (
          <WorkflowStage 
            key={stage.id}
            stage={stage}
            isActive={index === currentStageIndex}
          />
        ))}
      </div>
    </div>
  );
};

export default WorkflowTracker;