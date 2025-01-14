# backend/app/services/enhanced_ml_service.py

import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.multioutput import MultiOutputRegressor
from typing import Dict, List, Tuple, Optional
import joblib
import json
from datetime import datetime

class EnhancedManufacturingMLService:
    def __init__(self):
        self.quality_model = MultiOutputRegressor(RandomForestRegressor(n_estimators=100, random_state=42))
        self.maintenance_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.anomaly_detector = IsolationForest(random_state=42, contamination=0.1)
        self.scaler = StandardScaler()
        self.process_history = []
        self.initialized = False

    def _generate_synthetic_training_data(self, n_samples: int = 5000) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Generate synthetic manufacturing data with realistic relationships."""
        # Generate input parameters
        cutting_speeds = np.random.uniform(50, 200, n_samples)
        feed_rates = np.random.uniform(0.1, 0.5, n_samples)
        depths_of_cut = np.random.uniform(0.5, 5.0, n_samples)
        tool_types = np.random.choice([0, 1, 2], n_samples)  # Encoded tool types
        
        # Add time-based features
        operation_times = np.random.uniform(10, 60, n_samples)
        cumulative_wear = np.cumsum(np.random.uniform(0.1, 0.5, n_samples))
        
        X = np.column_stack([
            cutting_speeds, feed_rates, depths_of_cut, tool_types,
            operation_times, cumulative_wear
        ])

        # Generate quality metrics with realistic manufacturing relationships
        surface_quality = (
            100 - (cutting_speeds - 120)**2 / 400  # Optimal speed around 120
            - (feed_rates - 0.3)**2 * 200          # Optimal feed rate around 0.3
            - (depths_of_cut - 2)**2 * 5           # Optimal depth around 2
            + tool_types * 2                       # Tool type influence
            - cumulative_wear * 0.1                # Wear impact
            + np.random.normal(0, 2, n_samples)    # Random variation
        )
        
        dimensional_accuracy = (
            100 - (cutting_speeds - 110)**2 / 450  # Slightly different optimal speed
            - (feed_rates - 0.25)**2 * 180        # Different optimal feed rate
            - (depths_of_cut - 1.8)**2 * 6        # Different optimal depth
            + tool_types * 1.5                    # Tool type influence
            - cumulative_wear * 0.15              # More sensitive to wear
            + np.random.normal(0, 1.5, n_samples) # Random variation
        )

        # Clip quality scores to realistic ranges
        quality_scores = np.column_stack([
            np.clip(surface_quality, 0, 100),
            np.clip(dimensional_accuracy, 0, 100)
        ])

        # Generate maintenance indicators
        maintenance_scores = (
            100 - cumulative_wear * 2
            - (cutting_speeds / 200) * 20
            - (depths_of_cut / 5) * 15
            + np.random.normal(0, 5, n_samples)
        ).reshape(-1, 1)

        return X, quality_scores, maintenance_scores

    def initialize_models(self):
        """Initialize and train all ML models with synthetic data."""
        if not self.initialized:
            X, quality_scores, maintenance_scores = self._generate_synthetic_training_data()
            
            # Scale features
            X_scaled = self.scaler.fit_transform(X)
            
            # Train quality prediction model
            self.quality_model.fit(X_scaled, quality_scores)
            
            # Train maintenance prediction model
            self.maintenance_model.fit(X_scaled, maintenance_scores)
            
            # Train anomaly detector
            self.anomaly_detector.fit(X_scaled)
            
            self.initialized = True

    def _prepare_features(self, parameters: Dict, history: Optional[List] = None) -> np.ndarray:
        """Prepare feature vector for prediction."""
        tool_type_encoding = {
            "carbide": 0,
            "high_speed_steel": 1,
            "diamond": 2
        }

        # Calculate cumulative wear based on history
        cumulative_wear = 0.0
        if history:
            cumulative_wear = sum(h.get('tool_wear', 0) * 0.01 for h in history)

        features = np.array([[
            parameters["cutting_speed"],
            parameters["feed_rate"],
            parameters["depth_of_cut"],
            tool_type_encoding[parameters["tool_type"]],
            parameters.get("operation_time", 30.0),  # Default if not provided
            cumulative_wear
        ]])

        return self.scaler.transform(features)

    def predict_quality(self, parameters: Dict, history: Optional[List] = None) -> Dict:
        """Predict multiple quality metrics for given parameters."""
        if not self.initialized:
            self.initialize_models()

        X_scaled = self._prepare_features(parameters, history)
        surface_quality, dimensional_accuracy = self.quality_model.predict(X_scaled)[0]

        return {
            "surface_quality": float(surface_quality),
            "dimensional_accuracy": float(dimensional_accuracy),
            "overall_quality": float((surface_quality + dimensional_accuracy) / 2)
        }

    def predict_maintenance(self, parameters: Dict, history: Optional[List] = None) -> Dict:
        """Predict maintenance requirements and tool health."""
        if not self.initialized:
            self.initialize_models()

        X_scaled = self._prepare_features(parameters, history)
        maintenance_score = float(self.maintenance_model.predict(X_scaled)[0])

        # Calculate remaining tool life
        tool_health = max(0, maintenance_score)
        maintenance_needed = tool_health < 70

        return {
            "tool_health": tool_health,
            "maintenance_needed": maintenance_needed,
            "estimated_remaining_hours": tool_health * 0.5,  # Rough estimation
            "maintenance_priority": "high" if tool_health < 50 else "medium" if tool_health < 70 else "low"
        }

    def detect_anomalies(self, parameters: Dict, history: Optional[List] = None) -> Dict:
        """Detect and analyze process anomalies."""
        if not self.initialized:
            self.initialize_models()

        X_scaled = self._prepare_features(parameters, history)
        anomaly_score = self.anomaly_detector.score_samples(X_scaled)[0]
        
        # Analyze potential causes
        causes = []
        if parameters["cutting_speed"] > 180:
            causes.append("High cutting speed")
        if parameters["feed_rate"] > 0.4:
            causes.append("Excessive feed rate")
        if parameters["depth_of_cut"] > 4:
            causes.append("Deep cut depth")

        return {
            "is_anomaly": anomaly_score < -0.5,
            "anomaly_score": float(anomaly_score),
            "severity": "high" if anomaly_score < -0.7 else "medium" if anomaly_score < -0.5 else "low",
            "potential_causes": causes
        }

    def optimize_parameters(self, current_params: Dict, history: Optional[List] = None) -> Dict:
        """Optimize manufacturing parameters for best quality while considering maintenance."""
        if not self.initialized:
            self.initialize_models()

        # Generate parameter combinations to test
        n_variations = 100
        best_params = None
        best_score = -float('inf')
        
        for _ in range(n_variations):
            test_params = current_params.copy()
            # Randomly adjust parameters within constraints
            test_params["cutting_speed"] = max(50, min(200, current_params["cutting_speed"] + np.random.uniform(-20, 20)))
            test_params["feed_rate"] = max(0.1, min(0.5, current_params["feed_rate"] + np.random.uniform(-0.1, 0.1)))
            test_params["depth_of_cut"] = max(0.5, min(5.0, current_params["depth_of_cut"] + np.random.uniform(-0.5, 0.5)))
            
            # Predict quality and maintenance for this combination
            quality_pred = self.predict_quality(test_params, history)
            maint_pred = self.predict_maintenance(test_params, history)
            
            # Calculate combined score (weighted average of quality and maintenance)
            combined_score = (
                0.7 * quality_pred["overall_quality"] +
                0.3 * maint_pred["tool_health"]
            )
            
            if combined_score > best_score:
                best_score = combined_score
                best_params = test_params

        return {
            "optimized_parameters": best_params,
            "predicted_quality": float(best_score),
            "quality_improvement": float(best_score - self.predict_quality(current_params, history)["overall_quality"])
        }

    def update_process_history(self, parameters: Dict, metrics: Dict):
        """Update process history with new data."""
        self.process_history.append({
            "timestamp": datetime.now().isoformat(),
            "parameters": parameters,
            "metrics": metrics
        })
        
        # Keep only recent history
        self.process_history = self.process_history[-1000:]