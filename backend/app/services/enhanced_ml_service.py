# backend/app/services/enhanced_ml_service.py

import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.multioutput import MultiOutputRegressor
from typing import Dict, List, Tuple, Optional
import joblib
from datetime import datetime

class EnhancedManufacturingMLService:
    def __init__(self):
        self.initialized = False

    def initialize_models(self):
        """Initialize the service. In production, this would load or train models."""
        if not self.initialized:
            self.initialized = True

    def _to_python_type(self, value):
        """Convert numpy types to Python native types."""
        if isinstance(value, (np.int_, np.intc, np.intp, np.int8, np.int16, np.int32, 
                            np.int64, np.uint8, np.uint16, np.uint32, np.uint64)):
            return int(value)
        elif isinstance(value, (np.float_, np.float16, np.float32, np.float64)):
            return float(value)
        elif isinstance(value, (np.bool_)):
            return bool(value)
        elif isinstance(value, np.ndarray):
            return self._to_python_type(value.item()) if value.size == 1 else [self._to_python_type(x) for x in value]
        return value

    def predict_quality(self, parameters: Dict) -> Dict:
        """Predict multiple quality metrics for given parameters."""
        if not self.initialized:
            self.initialize_models()

        # Generate some realistic quality metrics
        surface_quality = 85 + np.random.normal(0, 5)
        dimensional_accuracy = 88 + np.random.normal(0, 4)
        overall_quality = (surface_quality + dimensional_accuracy) / 2

        return {
            "surface_quality": self._to_python_type(surface_quality),
            "dimensional_accuracy": self._to_python_type(dimensional_accuracy),
            "overall_quality": self._to_python_type(overall_quality)
        }

    def predict_maintenance(self, parameters: Dict) -> Dict:
        """Predict maintenance requirements and tool health."""
        if not self.initialized:
            self.initialize_models()

        # Generate realistic maintenance metrics
        tool_health = max(0, 100 - np.random.normal(20, 5))
        maintenance_needed = tool_health < 70
        estimated_hours = tool_health * 0.5

        return {
            "tool_health": self._to_python_type(tool_health),
            "maintenance_needed": self._to_python_type(maintenance_needed),
            "estimated_remaining_hours": self._to_python_type(estimated_hours),
            "maintenance_priority": "high" if tool_health < 50 else "medium" if tool_health < 70 else "low"
        }

    def detect_anomalies(self, parameters: Dict) -> Dict:
        """Detect and analyze process anomalies."""
        if not self.initialized:
            self.initialize_models()

        # Generate realistic anomaly metrics
        anomaly_score = np.random.normal(-0.2, 0.3)
        is_anomaly = anomaly_score < -0.5
        
        causes = []
        if parameters["cutting_speed"] > 180:
            causes.append("High cutting speed")
        if parameters["feed_rate"] > 0.4:
            causes.append("Excessive feed rate")
        if parameters["depth_of_cut"] > 4:
            causes.append("Deep cut depth")

        return {
            "is_anomaly": self._to_python_type(is_anomaly),
            "anomaly_score": self._to_python_type(anomaly_score),
            "severity": "high" if anomaly_score < -0.7 else "medium" if anomaly_score < -0.5 else "low",
            "potential_causes": causes
        }

    def optimize_parameters(self, current_params: Dict) -> Dict:
        """Optimize manufacturing parameters."""
        if not self.initialized:
            self.initialize_models()

        # Generate optimized parameters
        optimized_params = {
            "cutting_speed": self._to_python_type(min(200, current_params["cutting_speed"] * (1 + np.random.normal(0, 0.1)))),
            "feed_rate": self._to_python_type(min(0.5, current_params["feed_rate"] * (1 + np.random.normal(0, 0.1)))),
            "depth_of_cut": self._to_python_type(min(5.0, current_params["depth_of_cut"] * (1 + np.random.normal(0, 0.1)))),
            "tool_type": current_params["tool_type"]
        }
        
        predicted_quality = 90 + np.random.normal(0, 2)
        quality_improvement = predicted_quality - 85  # Assuming current quality is around 85

        return {
            "optimized_parameters": optimized_params,
            "predicted_quality": self._to_python_type(predicted_quality),
            "quality_improvement": self._to_python_type(quality_improvement)
        }
    
    def get_parameter_optimization(self, parameters: Dict, current_stage: str) -> Dict:
        """Get optimized parameters based on current stage and conditions"""
        if not self.initialized:
            self.initialize_models()

        # Base optimization factors for each stage
        stage_factors = {
            "Material Setup": {"cutting_speed": 1.0, "feed_rate": 1.0, "depth_of_cut": 1.0},
            "Initial Machining": {"cutting_speed": 1.2, "feed_rate": 0.9, "depth_of_cut": 1.1},
            "Quality Verification": {"cutting_speed": 0.9, "feed_rate": 0.8, "depth_of_cut": 0.9},
            "Process Completion": {"cutting_speed": 1.0, "feed_rate": 1.0, "depth_of_cut": 1.0}
        }

        # Get stage-specific factors
        factors = stage_factors.get(current_stage, {"cutting_speed": 1.0, "feed_rate": 1.0, "depth_of_cut": 1.0})

        # Calculate optimized parameters
        optimized_params = {
            "cutting_speed": min(200, parameters["cutting_speed"] * factors["cutting_speed"]),
            "feed_rate": min(0.5, parameters["feed_rate"] * factors["feed_rate"]),
            "depth_of_cut": min(5.0, parameters["depth_of_cut"] * factors["depth_of_cut"]),
            "tool_type": parameters["tool_type"]
        }

        # Predict quality improvements
        current_quality = self.predict_quality(parameters)
        optimized_quality = self.predict_quality(optimized_params)
        quality_improvement = optimized_quality["overall_quality"] - current_quality["overall_quality"]

        # Calculate efficiency gains
        efficiency_gains = {
            "time_reduction": round(((1 - factors["cutting_speed"]) * 100), 1),
            "energy_savings": round(((1 - factors["feed_rate"] * factors["depth_of_cut"]) * 100), 1),
            "tool_life_extension": round(((1 - max(factors.values())) * 100), 1)
        }

        return {
            "optimized_parameters": optimized_params,
            "quality_improvement": quality_improvement,
            "efficiency_gains": efficiency_gains,
            "recommendations": self._generate_recommendations(parameters, optimized_params, current_stage)
        }

    def _generate_recommendations(self, current_params: Dict, optimized_params: Dict, stage: str) -> List[str]:
        """Generate specific recommendations based on parameter differences"""
        recommendations = []
        
        # Analyze parameter changes
        if optimized_params["cutting_speed"] > current_params["cutting_speed"]:
            recommendations.append("Increase cutting speed to improve material removal rate")
        elif optimized_params["cutting_speed"] < current_params["cutting_speed"]:
            recommendations.append("Reduce cutting speed to improve surface finish")

        if optimized_params["feed_rate"] > current_params["feed_rate"]:
            recommendations.append("Increase feed rate to reduce operation time")
        elif optimized_params["feed_rate"] < current_params["feed_rate"]:
            recommendations.append("Reduce feed rate to improve dimensional accuracy")

        if optimized_params["depth_of_cut"] > current_params["depth_of_cut"]:
            recommendations.append("Increase depth of cut for faster material removal")
        elif optimized_params["depth_of_cut"] < current_params["depth_of_cut"]:
            recommendations.append("Reduce depth of cut to minimize tool wear")

        return recommendations
    
    def analyze_parameter_relationships(self, parameters: Dict) -> Dict:
        """Analyze how parameters interact and affect quality/efficiency"""
        
        # Calculate parameter interactions
        speed_feed_interaction = (parameters["cutting_speed"] * parameters["feed_rate"]) / 20
        depth_load = parameters["depth_of_cut"] * parameters["feed_rate"] * 100
        tool_load = (parameters["cutting_speed"] * parameters["feed_rate"] * parameters["depth_of_cut"]) / 4

        # Quality impact analysis
        quality_impacts = {
            "surface_finish": self._calculate_surface_finish_impact(parameters),
            "dimensional_accuracy": self._calculate_dimensional_accuracy(parameters),
            "tool_wear_rate": self._calculate_tool_wear_rate(parameters)
        }

        # Efficiency analysis
        efficiency_impacts = {
            "material_removal_rate": self._calculate_material_removal_rate(parameters),
            "energy_efficiency": self._calculate_energy_efficiency(parameters),
            "tool_life": self._calculate_tool_life(parameters)
        }

        return {
            "parameter_interactions": {
                "speed_feed_interaction": round(speed_feed_interaction, 2),
                "depth_load": round(depth_load, 2),
                "tool_load": round(tool_load, 2)
            },
            "quality_impacts": quality_impacts,
            "efficiency_impacts": efficiency_impacts,
            "optimization_space": self._calculate_optimization_space(parameters)
        }

    def _calculate_surface_finish_impact(self, parameters: Dict) -> Dict:
        base_impact = (parameters["cutting_speed"] / 100) * (0.2 / parameters["feed_rate"])
        return {
            "score": min(100, max(0, base_impact * 80)),
            "confidence": min(100, max(0, 85 + np.random.normal(0, 5))),
            "limiting_factor": self._get_limiting_factor(parameters)
        }

    def _calculate_dimensional_accuracy(self, parameters: Dict) -> Dict:
        base_accuracy = 100 - (parameters["feed_rate"] * 100) - (parameters["depth_of_cut"] * 10)
        return {
            "score": min(100, max(0, base_accuracy)),
            "confidence": min(100, max(0, 90 + np.random.normal(0, 3))),
            "tolerance_range": f"±{(parameters['feed_rate'] * 0.1):.3f}mm"
        }

    def _calculate_tool_wear_rate(self, parameters: Dict) -> Dict:
        wear_rate = (parameters["cutting_speed"] * parameters["feed_rate"] * parameters["depth_of_cut"]) / 10
        return {
            "rate": min(100, max(0, wear_rate)),
            "estimated_life": max(0, 100 - wear_rate * 5),
            "wear_pattern": self._predict_wear_pattern(parameters)
        }

    def _calculate_material_removal_rate(self, parameters: Dict) -> float:
        return round(parameters["cutting_speed"] * parameters["feed_rate"] * parameters["depth_of_cut"] * 0.8, 2)

    def _calculate_energy_efficiency(self, parameters: Dict) -> Dict:
        base_efficiency = 100 - (parameters["cutting_speed"] * 0.2) - (parameters["depth_of_cut"] * 10)
        return {
            "score": min(100, max(0, base_efficiency)),
            "consumption_rate": round(parameters["cutting_speed"] * parameters["depth_of_cut"] * 0.05, 2),
            "optimization_potential": min(100, max(0, 100 - base_efficiency))
        }

    def _calculate_tool_life(self, parameters: Dict) -> Dict:
        base_life = 100 - (parameters["cutting_speed"] * 0.3) - (parameters["feed_rate"] * 100) - (parameters["depth_of_cut"] * 10)
        return {
            "remaining_percentage": min(100, max(0, base_life)),
            "estimated_hours": round(max(0, base_life * 0.5), 1),
            "replacement_warning": base_life < 30
        }

    def _get_limiting_factor(self, parameters: Dict) -> str:
        if parameters["cutting_speed"] > 150:
            return "High cutting speed"
        elif parameters["feed_rate"] > 0.3:
            return "Excessive feed rate"
        elif parameters["depth_of_cut"] > 3:
            return "Deep cut depth"
        return "None"

    def _predict_wear_pattern(self, parameters: Dict) -> str:
        if parameters["cutting_speed"] > 150:
            return "Flank wear dominant"
        elif parameters["feed_rate"] > 0.3:
            return "Crater wear dominant"
        return "Normal wear pattern"

    def _calculate_optimization_space(self, parameters: Dict) -> Dict:
        return {
            "cutting_speed": {
                "min": max(50, parameters["cutting_speed"] * 0.8),
                "optimal": parameters["cutting_speed"] * 1.1,
                "max": min(200, parameters["cutting_speed"] * 1.2)
            },
            "feed_rate": {
                "min": max(0.1, parameters["feed_rate"] * 0.8),
                "optimal": parameters["feed_rate"] * 1.05,
                "max": min(0.5, parameters["feed_rate"] * 1.2)
            },
            "depth_of_cut": {
                "min": max(0.5, parameters["depth_of_cut"] * 0.8),
                "optimal": parameters["depth_of_cut"] * 1.05,
                "max": min(5, parameters["depth_of_cut"] * 1.2)
            }
        }