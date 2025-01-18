# backend/app/main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import numpy as np
from datetime import datetime

from .services.enhanced_ml_service import EnhancedManufacturingMLService
from .services.workflow_service import WorkflowService

app = FastAPI(title="Liberty OS")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
workflow_service = WorkflowService()
ml_service = EnhancedManufacturingMLService()

# Base models
class MachiningParameters(BaseModel):
    cutting_speed: float
    feed_rate: float
    depth_of_cut: float
    tool_type: str

class ProcessSimulation(BaseModel):
    operation_time: float
    quality_metrics: Dict
    maintenance_metrics: Dict
    energy_consumption: float
    tool_wear: float
    optimization_suggestions: Optional[Dict] = None
    anomaly_detection: Optional[Dict] = None

class ProgressUpdate(BaseModel):
    progress: float
    metrics: Optional[Dict] = None

class QualityGateUpdate(BaseModel):
    stage_id: str
    gate_name: str
    measurements: Dict

# Workflow endpoints
@app.get("/workflow/stages")
async def get_workflow_stages():
    """Get all workflow stages and their status"""
    return workflow_service.get_all_stages()

@app.get("/workflow/current")
async def get_current_stage():
    """Get the currently active workflow stage"""
    return workflow_service.get_current_stage()

@app.put("/workflow/stage/progress")
async def update_stage_progress(update: ProgressUpdate):
    """Update the progress of the current stage"""
    workflow_service.update_stage_progress(update.progress, update.metrics)
    return workflow_service.get_all_stages()

@app.post("/workflow/quality-gate")
async def update_quality_gate(update: QualityGateUpdate):
    """Update a quality gate with measurements"""
    success = workflow_service.update_quality_gate(
        update.stage_id,
        update.gate_name,
        update.measurements
    )
    return {
        "success": success,
        "stages": workflow_service.get_all_stages()
    }

@app.get("/workflow/stage/{stage_id}/metrics")
async def get_stage_metrics(stage_id: str):
    """Get metrics for a specific stage"""
    stage = next((s for s in workflow_service.stages if s.id == stage_id), None)
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    return stage.metrics

# Machining simulation and optimization
def simulate_machining_process(params: MachiningParameters) -> ProcessSimulation:
    """Simulate a CNC machining process with given parameters."""
    # Calculate basic metrics
    operation_time = 30 + np.random.normal(0, 2)
    
    # Adjust operation time based on parameters
    speed_factor = params.cutting_speed / 100.0
    feed_factor = params.feed_rate / 0.2
    operation_time = operation_time * (1 / speed_factor) * (1 / feed_factor)
    
    # Get ML predictions
    quality_metrics = ml_service.predict_quality(params.dict())
    maintenance_metrics = ml_service.predict_maintenance(params.dict())
    optimization_data = ml_service.optimize_parameters(params.dict())
    anomaly_data = ml_service.detect_anomalies(params.dict())
    
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

    return ProcessSimulation(
        operation_time=round(operation_time, 2),
        quality_metrics=quality_metrics,
        maintenance_metrics=maintenance_metrics,
        energy_consumption=round(energy_consumption, 2),
        tool_wear=round(tool_wear, 2),
        optimization_suggestions=optimization_data,
        anomaly_detection=anomaly_data
    )

# Application endpoints
@app.on_event("startup")
async def startup_event():
    """Initialize ML models on startup."""
    ml_service.initialize_models()

@app.get("/")
async def root():
    return {"message": "Liberty OS API"}

@app.post("/simulate/machining")
async def simulate_machining(params: MachiningParameters):
    """Simulate a machining operation with given parameters."""
    try:
        result = simulate_machining_process(params)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/optimize/parameters")
async def optimize_parameters(params: MachiningParameters):
    """Get optimized parameters for current settings."""
    try:
        return ml_service.optimize_parameters(params.dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/maintenance")
async def analyze_maintenance(params: MachiningParameters):
    """Get detailed maintenance analysis."""
    try:
        return ml_service.predict_maintenance(params.dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect/anomalies")
async def detect_anomalies(params: MachiningParameters):
    """Detect and analyze process anomalies."""
    try:
        return ml_service.detect_anomalies(params.dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/optimize/parameters/{stage}")
async def optimize_parameters(stage: str, params: MachiningParameters):
    """Get optimized parameters for current manufacturing stage"""
    try:
        return ml_service.get_parameter_optimization(params.dict(), stage)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/parameters")
async def analyze_parameters(params: MachiningParameters):
    """Get detailed parameter relationship analysis"""
    try:
        return ml_service.analyze_parameter_relationships(params.dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))