# backend/app/services/workflow_service.py

from ..models.workflow import WorkflowStage, QualityGate, StageStatus
from datetime import datetime
from typing import List, Dict
import uuid

class WorkflowService:
    def __init__(self):
        self.stages = self._initialize_stages()
        self.current_stage_index = 0

    def _initialize_stages(self) -> List[WorkflowStage]:
        """Initialize the pump housing manufacturing workflow stages"""
        return [
            WorkflowStage(
                id=str(uuid.uuid4()),
                name="Material Setup",
                description="Initial material preparation and setup",
                quality_gates=[
                    QualityGate(
                        name="Material Verification",
                        criteria={"material_grade": 1.0}
                    )
                ]
            ),
            WorkflowStage(
                id=str(uuid.uuid4()),
                name="Initial Machining",
                description="Primary machining operations",
                quality_gates=[
                    QualityGate(
                        name="Dimensional Check",
                        criteria={"tolerance": 0.05}
                    )
                ]
            ),
            WorkflowStage(
                id=str(uuid.uuid4()),
                name="Quality Verification",
                description="Final quality checks and measurements",
                quality_gates=[
                    QualityGate(
                        name="Surface Finish",
                        criteria={"roughness": 1.6}
                    ),
                    QualityGate(
                        name="Final Dimensions",
                        criteria={"tolerance": 0.02}
                    )
                ]
            ),
            WorkflowStage(
                id=str(uuid.uuid4()),
                name="Process Completion",
                description="Final documentation and part preparation",
                quality_gates=[
                    QualityGate(
                        name="Documentation Complete",
                        criteria={"completion": 1.0}
                    )
                ]
            )
        ]

    def get_current_stage(self) -> WorkflowStage:
        """Get the currently active stage"""
        return self.stages[self.current_stage_index]

    def get_all_stages(self) -> List[WorkflowStage]:
        """Get all workflow stages"""
        return self.stages

    def update_stage_progress(self, progress: float):
        """Update the progress of the current stage"""
        current_stage = self.get_current_stage()
        current_stage.progress = min(100.0, max(0.0, progress))
        
        if progress >= 100.0:
            current_stage.status = StageStatus.COMPLETED
            current_stage.end_time = datetime.utcnow()
            if self.current_stage_index < len(self.stages) - 1:
                self.current_stage_index += 1
                self.stages[self.current_stage_index].status = StageStatus.IN_PROGRESS
                self.stages[self.current_stage_index].start_time = datetime.utcnow()

    def update_quality_gate(self, stage_index: int, gate_name: str, measurements: Dict[str, float]):
        """Update a quality gate with measurements"""
        stage = self.stages[stage_index]
        for gate in stage.quality_gates:
            if gate.name == gate_name:
                gate.measurements = measurements
                gate.passed = all(
                    measurements.get(k, 0) >= v 
                    for k, v in gate.criteria.items()
                )
                gate.status = StageStatus.COMPLETED if gate.passed else StageStatus.FAILED