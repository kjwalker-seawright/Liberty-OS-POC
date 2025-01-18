// src/components/workflow/WorkflowTracker.jsx
import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import WorkflowStage from './WorkflowStage';
import MeasurementModal from './MeasurementModal';
import DocumentUpload from './DocumentUpload';
import ApprovalDialog from './ApprovalDialog';

const WorkflowTracker = () => {
  const [stages, setStages] = useState([]);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [measurementModal, setMeasurementModal] = useState({
    isOpen: false,
    gateName: '',
    measurementType: '',
    stageId: ''
  });
  const [documentUpload, setDocumentUpload] = useState({
    isOpen: false,
    gateName: '',
    stageId: ''
  });
  const [approvalDialog, setApprovalDialog] = useState({
    isOpen: false,
    stageId: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStages = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/workflow/stages');
        const data = await response.json();
        setStages(data);
        
        const currentIndex = data.findIndex(stage => stage.status === 'in_progress');
        setCurrentStageIndex(currentIndex >= 0 ? currentIndex : 0);
      } catch (error) {
        console.error('Error fetching workflow stages:', error);
        setError('Failed to fetch workflow stages');
      }
    };

    fetchStages();
    const interval = setInterval(fetchStages, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleProgressUpdate = async () => {
    const currentStage = stages[currentStageIndex];
    if (!currentStage) return;

    try {
      const newProgress = Math.min(100, (currentStage.progress || 0) + 20);
      const response = await fetch('http://127.0.0.1:8000/workflow/stage/progress', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          progress: newProgress,
          metrics: {
            temperature: 22 + Math.random() * 2,
            humidity: 45 + Math.random() * 5,
            spindle_speed: 1000 + Math.random() * 500,
            feed_rate: 50 + Math.random() * 20,
            total_time: newProgress * 0.5,
          }
        }),
      });
      
      if (response.ok) {
        const updatedStages = await response.json();
        setStages(updatedStages);
        
        const newCurrentIndex = updatedStages.findIndex(stage => stage.status === 'in_progress');
        if (newCurrentIndex >= 0 && newCurrentIndex !== currentStageIndex) {
          setCurrentStageIndex(newCurrentIndex);
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      setError('Failed to update stage progress');
    }
  };

  const handleMeasurement = async (measurementData) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/workflow/quality-gate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stage_id: measurementModal.stageId,
          gate_name: measurementModal.gateName,
          measurements: {
            [measurementModal.measurementType]: {
              ...measurementData,
              timestamp: new Date().toISOString(),
              inspector: "System"
            }
          }
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setStages(result.stages);
        setMeasurementModal({ isOpen: false, gateName: '', measurementType: '', stageId: '' });
      }
    } catch (error) {
      console.error('Error updating quality gate:', error);
      setError('Failed to record measurement');
    }
  };

  const handleDocumentUpload = async (fileData) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/workflow/document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stage_id: documentUpload.stageId,
          gate_name: documentUpload.gateName,
          document_url: fileData.url,
          document_type: fileData.type
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setStages(result.stages);
        setDocumentUpload({ isOpen: false, gateName: '', stageId: '' });
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      setError('Failed to upload document');
    }
  };

  const handleStageApproval = async (approverData) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/workflow/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stage_id: approvalDialog.stageId,
          approver: approverData.approver,
          notes: approverData.notes
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setStages(result.stages);
        setApprovalDialog({ isOpen: false, stageId: '' });
      }
    } catch (error) {
      console.error('Error approving stage:', error);
      setError('Failed to approve stage');
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gray-950 rounded-xl">
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Manufacturing Workflow</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleProgressUpdate}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Advance Progress (+20%)
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stages.map((stage, index) => (
            <WorkflowStage 
              key={stage.id}
              stage={stage}
              isActive={index === currentStageIndex}
              onMeasure={(gateName, measurementType) => 
                setMeasurementModal({
                  isOpen: true,
                  gateName,
                  measurementType,
                  stageId: stage.id
                })
              }
              onDocumentUpload={(gateName) => 
                setDocumentUpload({
                  isOpen: true,
                  gateName,
                  stageId: stage.id
                })
              }
              onApprove={(stageId) => 
                setApprovalDialog({
                  isOpen: true,
                  stageId
                })
              }
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      <MeasurementModal 
        isOpen={measurementModal.isOpen}
        measurementType={measurementModal.measurementType}
        onClose={() => setMeasurementModal({ isOpen: false, gateName: '', measurementType: '', stageId: '' })}
        onSubmit={handleMeasurement}
      />

      <DocumentUpload 
        isOpen={documentUpload.isOpen}
        onClose={() => setDocumentUpload({ isOpen: false, gateName: '', stageId: '' })}
        onSubmit={handleDocumentUpload}
      />

      <ApprovalDialog 
        isOpen={approvalDialog.isOpen}
        onClose={() => setApprovalDialog({ isOpen: false, stageId: '' })}
        onSubmit={handleStageApproval}
      />
    </div>
  );
};

export default WorkflowTracker;