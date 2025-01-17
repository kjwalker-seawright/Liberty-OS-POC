# backend/app/models/workflow.py

from pydantic import BaseModel
from typing import List, Optional, Dict
from enum import Enum
from datetime import datetime

class StageStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"

class QualityGate(BaseModel):
    name: str
    criteria: Dict[str, float]
    status: StageStatus = StageStatus.PENDING
    measurements: Optional[Dict[str, float]] = None
    passed: Optional[bool] = None

class WorkflowStage(BaseModel):
    id: str
    name: str
    description: str
    status: StageStatus = StageStatus.PENDING
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    progress: float = 0.0
    quality_gates: List[QualityGate] = []
    metrics: Optional[Dict[str, float]] = None