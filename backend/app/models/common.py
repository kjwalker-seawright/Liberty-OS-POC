from uuid import UUID, uuid4
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Dict, Any

class BaseProcessData(BaseModel):
    """Base model for all process-related data"""
    id: UUID = Field(default_factory=uuid4)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    pod_id: UUID = Field(default_factory=uuid4)
    version: str = "1.0"