from .common import BaseProcessData
from pydantic import Field
from typing import Dict, Optional

class MachiningParameters(BaseProcessData):
    cutting_speed: float = Field(..., ge=0)
    feed_rate: float = Field(..., ge=0)
    depth_of_cut: float = Field(..., ge=0)
    tool_type: str

class ProcessMetrics(BaseProcessData):
    operation_time: float
    quality_score: float
    energy_consumption: float
    tool_wear: float
    anomaly_score: Optional[float] = None