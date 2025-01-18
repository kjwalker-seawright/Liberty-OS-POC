from typing import List, Dict, Optional
from datetime import datetime
import uuid
from ..models.workflow import (
    WorkflowStage, 
    QualityGate, 
    StageStatus, 
    StageMetrics, 
    QualityMeasurement,
    MeasurementType,
    InspectionMethod
)

class WorkflowService:
    def __init__(self):
        self.stages = self._initialize_stages()
        self.current_stage_index = 0

    def _initialize_stages(self) -> List[WorkflowStage]:
        """Initialize pump housing manufacturing workflow stages with enhanced quality gates"""
        return [
            WorkflowStage(
                id=str(uuid.uuid4()),
                name="Material Setup",
                description="Initial material preparation and setup verification",
                status=StageStatus.IN_PROGRESS,
                start_time=datetime.utcnow(),
                progress=0.0,
                quality_gates=[
                    QualityGate(
                        name="Material Verification",
                        description="Verify material properties and composition",
                        criteria={"material_grade": 1.0},
                        required_measurements=[
                            MeasurementType.MATERIAL,
                            MeasurementType.HARDNESS
                        ],
                        inspection_methods=[
                            InspectionMethod.HARDNESS_TEST
                        ],
                        blocking=True,
                        documentation_required=True
                    ),
                    QualityGate(
                        name="Setup Validation",
                        description="Validate machine setup and alignment",
                        criteria={"alignment": 0.01},
                        required_measurements=[
                            MeasurementType.DIMENSIONAL
                        ],
                        inspection_methods=[
                            InspectionMethod.CMM
                        ],
                        blocking=True
                    )
                ],
                metrics=StageMetrics(
                    temperature=22.0,
                    humidity=45.0,
                    spindle_speed=0.0,
                    feed_rate=0.0,
                    total_time=0.0
                ),
                requires_approval=True
            ),
            WorkflowStage(
                id=str(uuid.uuid4()),
                name="Initial Machining",
                description="Primary machining operations and roughing",
                status=StageStatus.PENDING,
                quality_gates=[
                    QualityGate(
                        name="Dimensional Check",
                        description="Verify rough machining dimensions",
                        criteria={"tolerance": 0.05},
                        required_measurements=[
                            MeasurementType.DIMENSIONAL
                        ],
                        inspection_methods=[
                            InspectionMethod.CMM,
                            InspectionMethod.VISUAL
                        ]
                    ),
                    QualityGate(
                        name="Surface Quality",
                        description="Check surface roughness after machining",
                        criteria={"roughness": 1.6},
                        required_measurements=[
                            MeasurementType.SURFACE
                        ],
                        inspection_methods=[
                            InspectionMethod.SURFACE_GAUGE
                        ]
                    )
                ],
                metrics=StageMetrics(
                    temperature=22.0,
                    spindle_speed=0.0,
                    feed_rate=0.0,
                    total_time=0.0
                )
            ),
            WorkflowStage(
                id=str(uuid.uuid4()),
                name="Quality Verification",
                description="Final quality checks and measurements",
                status=StageStatus.PENDING,
                progress=0.0,
                quality_gates=[
                    QualityGate(
                        name="Final Dimensions",
                        criteria={"tolerance": 0.02},
                        metrics={"measurement": 0.0}
                    ),
                    QualityGate(
                        name="Surface Finish",
                        criteria={"roughness": 0.8},
                        metrics={"ra_value": 0.0}
                    ),
                    QualityGate(
                        name="Geometric Tolerances",
                        criteria={"roundness": 0.01},
                        metrics={"deviation": 0.0}
                    )
                ],
                metrics=StageMetrics(
                    temperature=22.0,
                    inspection_temperature=22.0,
                    measurement_uncertainty=0.001,
                    total_time=0.0
                )
            ),
            WorkflowStage(
                id=str(uuid.uuid4()),
                name="Process Completion",
                description="Final documentation and part preparation",
                status=StageStatus.PENDING,
                progress=0.0,
                quality_gates=[
                    QualityGate(
                        name="Documentation Complete",
                        criteria={"completion": 1.0},
                        metrics={"progress": 0.0}
                    ),
                    QualityGate(
                        name="Part Cleaning",
                        criteria={"cleanliness": 0.95},
                        metrics={"residue": 0.0}
                    )
                ],
                metrics=StageMetrics(
                    total_time=0.0,
                    part_status="Not Started"
                )
            )
        ]

    def get_current_stage(self) -> WorkflowStage:
        """Get the currently active stage"""
        return self.stages[self.current_stage_index]

    def get_all_stages(self) -> List[WorkflowStage]:
        """Get all workflow stages"""
        return self.stages

    def update_stage_progress(self, progress: float, metrics: Optional[Dict] = None):
        """Update the progress of the current stage"""
        current_stage = self.get_current_stage()
        current_stage.progress = min(100.0, max(0.0, progress))
        
        if metrics:
            float_metrics = {}
            for k, v in metrics.items():
                if isinstance(v, (int, float)):
                    float_metrics[k] = float(v)
                else:
                    float_metrics[k] = v
            current_stage.metrics = StageMetrics(**float_metrics)
        
        if progress >= 100.0 and self.all_gates_passed(current_stage):
            if current_stage.requires_approval and not current_stage.approval_date:
                return  # Wait for approval before advancing
            
            current_stage.status = StageStatus.COMPLETED
            current_stage.end_time = datetime.utcnow()
            
            if self.current_stage_index < len(self.stages) - 1:
                self.current_stage_index += 1
                next_stage = self.stages[self.current_stage_index]
                next_stage.status = StageStatus.IN_PROGRESS
                next_stage.start_time = datetime.utcnow()
                self._initialize_stage_metrics(next_stage)

    def update_quality_gate(self, stage_id: str, gate_name: str, measurements: Dict) -> bool:
        """Update a quality gate with measurements"""
        for stage in self.stages:
            if stage.id == stage_id:
                for gate in stage.quality_gates:
                    if gate.name == gate_name and gate.status != StageStatus.COMPLETED:
                        return self._process_quality_gate(gate, measurements)
        return False

    def _process_quality_gate(self, gate: QualityGate, measurements: Dict) -> bool:
        """Process and validate quality gate measurements"""
        quality_measurements = {}
        
        for measurement_type in gate.required_measurements:
            if measurement_type.value not in measurements:
                return False
            
            data = measurements[measurement_type.value]
            measurement = QualityMeasurement(
                type=measurement_type,
                method=gate.inspection_methods[0],  # Default to first method
                value=data.get('value', 0.0),
                nominal=data.get('nominal', 0.0),
                upper_tolerance=data.get('upper_tolerance', 0.0),
                lower_tolerance=data.get('lower_tolerance', 0.0),
                unit=data.get('unit', ''),
                inspector=data.get('inspector'),
                notes=data.get('notes')
            )
            quality_measurements[measurement_type.value] = measurement
            
        gate.measurements = quality_measurements
        passed = self._evaluate_measurements(gate)
        gate.status = StageStatus.COMPLETED if passed else StageStatus.FAILED
        return passed

    def _evaluate_measurements(self, gate: QualityGate) -> bool:
        """Evaluate all measurements against criteria"""
        for measurement in gate.measurements.values():
            if not self._is_within_tolerance(measurement):
                return False
        return True

    def _is_within_tolerance(self, measurement: QualityMeasurement) -> bool:
        """Check if measurement is within tolerance limits"""
        return (measurement.value >= measurement.nominal + measurement.lower_tolerance and
                measurement.value <= measurement.nominal + measurement.upper_tolerance)

    def approve_stage(self, stage_id: str, approver: str) -> bool:
        """Approve a stage for progression"""
        for stage in self.stages:
            if stage.id == stage_id and stage.requires_approval:
                if self.all_gates_passed(stage):
                    stage.approver = approver
                    stage.approval_date = datetime.utcnow()
                    return True
        return False

    def all_gates_passed(self, stage: WorkflowStage) -> bool:
        """Check if all gates are passed and documentation is complete"""
        for gate in stage.quality_gates:
            if gate.status != StageStatus.COMPLETED:
                return False
            if gate.documentation_required and not gate.documentation_url:
                return False
        return True

    def _initialize_stage_metrics(self, stage: WorkflowStage):
        """Initialize default metrics for a stage"""
        stage.metrics = StageMetrics(
            temperature=22.0,
            spindle_speed=0.0,
            feed_rate=0.0,
            total_time=0.0
        )