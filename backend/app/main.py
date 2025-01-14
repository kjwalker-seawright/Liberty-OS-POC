# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Optional
import numpy as np
from .services.ml_service import ManufacturingMLService

app = FastAPI(title="Liberty OS POC")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML Service
ml_service = ManufacturingMLService()
ml_service.initialize_models()

# Data models
class MachiningParameters(BaseModel):
    cutting_speed: float
    feed_rate: float
    depth_of_cut: float
    tool_type: str

class ProcessSimulation(BaseModel):
    operation_time: float
    quality_score: float
    energy_consumption: float
    tool_wear: float
    optimization_suggestions: Optional[Dict] = None
    anomaly_detection: Optional[Dict] = None

def simulate_machining_process(params: MachiningParameters) -> ProcessSimulation:
    """Simulate a CNC machining process with given parameters."""
    # Base calculations with realistic ranges
    operation_time = 30 + np.random.normal(0, 2)
    
    # Adjust operation time based on parameters
    speed_factor = params.cutting_speed / 100.0
    feed_factor = params.feed_rate / 0.2
    operation_time = operation_time * (1 / speed_factor) * (1 / feed_factor)
    
    # Get quality prediction from ML model
    quality_score = ml_service.predict_quality(params.dict())
    
    # Calculate energy consumption (kWh)
    energy_consumption = (
        operation_time / 60 * params.cutting_speed * params.depth_of_cut * 0.1
    )
    
    # Calculate tool wear (0-100%)
    tool_wear = min(100, (
        operation_time / 240 * 
        (params.cutting_speed / 100) * 
        (params.depth_of_cut / 2) * 
        100
    ))
    
    # Get optimization suggestions
    optimization_data = ml_service.optimize_parameters(params.dict())
    
    # Check for anomalies
    anomaly_data = ml_service.detect_anomalies(params.dict(), quality_score)
    
    return ProcessSimulation(
        operation_time=round(operation_time, 2),
        quality_score=round(quality_score, 2),
        energy_consumption=round(energy_consumption, 2),
        tool_wear=round(tool_wear, 2),
        optimization_suggestions=optimization_data,
        anomaly_detection=anomaly_data
    )

@app.get("/")
async def root():
    return {"message": "Liberty OS POC API"}

@app.post("/simulate/machining")
async def simulate_machining(params: MachiningParameters):
    """Simulate a machining operation with given parameters."""
    result = simulate_machining_process(params)
    return result

@app.post("/optimize/parameters")
async def optimize_parameters(params: MachiningParameters):
    """Get optimized parameters for current settings."""
    return ml_service.optimize_parameters(params.dict())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)