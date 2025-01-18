# backend/app/models/workflow.py

from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from enum import Enum
from datetime import datetime

class StageStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"
    LOCKED = "locked"

class MeasurementType(str, Enum):
    DIMENSIONAL = "dimensional"
    SURFACE = "surface"
    MATERIAL = "material"
    VISUAL = "visual"
    FUNCTIONAL = "functional"
    HARDNESS = "hardness"

class InspectionMethod(str, Enum):
    CMM = "cmm"
    VISUAL = "visual"
    SURFACE_GAUGE = "surface_gauge"
    HARDNESS_TEST = "hardness_test"
    PRESSURE_TEST = "pressure_test"

class StageMetrics(BaseModel):
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    spindle_speed: Optional[float] = None
    feed_rate: Optional[float] = None
    inspection_temperature: Optional[float] = None
    measurement_uncertainty: Optional[float] = None
    total_time: Optional[float] = None
    part_status: Optional[str] = None

class QualityMeasurement(BaseModel):
    type: MeasurementType
    method: InspectionMethod
    value: float
    nominal: float
    upper_tolerance: float
    lower_tolerance: float
    unit: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    inspector: Optional[str] = None
    notes: Optional[str] = None

class QualityGate(BaseModel):
    name: str
    description: str = ""
    criteria: Dict[str, float]
    metrics: Dict[str, float] = {}
    measurements: Dict[str, QualityMeasurement] = {}
    required_measurements: List[MeasurementType] = []
    inspection_methods: List[InspectionMethod] = []
    status: StageStatus = StageStatus.PENDING
    documentation_required: bool = False
    documentation_url: Optional[str] = None
    priority: int = 1  # 1 = highest priority
    blocking: bool = True  # If true, blocks stage progression on failure

class WorkflowStage(BaseModel):
    id: str
    name: str
    description: str
    status: StageStatus
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    progress: float = 0.0
    quality_gates: List[QualityGate] = []
    metrics: StageMetrics = StageMetrics()
    requires_approval: bool = False
    approver: Optional[str] = None
    approval_date: Optional[datetime] = None