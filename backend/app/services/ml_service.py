# backend/app/services/ml_service.py

import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from typing import Dict, List, Tuple

class ManufacturingMLService:
    def __init__(self):
        self.scaler = StandardScaler()
        self.quality_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.initialized = False

    def _generate_synthetic_data(self, n_samples: int = 1000) -> Tuple[np.ndarray, np.ndarray]:
        """Generate synthetic manufacturing data for initial model training."""
        # Generate random parameters within realistic ranges
        cutting_speeds = np.random.uniform(50, 200, n_samples)
        feed_rates = np.random.uniform(0.1, 0.5, n_samples)
        depths_of_cut = np.random.uniform(0.5, 5.0, n_samples)
        tool_types = np.random.choice([0, 1, 2], n_samples)  # Encoded tool types

        X = np.column_stack([cutting_speeds, feed_rates, depths_of_cut, tool_types])

        # Generate quality scores based on realistic manufacturing relationships
        quality_scores = (
            100 - (cutting_speeds - 120)**2 / 400  # Optimal speed around 120
            - (feed_rates - 0.3)**2 * 200         # Optimal feed rate around 0.3
            - (depths_of_cut - 2)**2 * 5          # Optimal depth around 2
            + tool_types * 2                      # Tool type influence
            + np.random.normal(0, 2, n_samples)   # Random variation
        )
        quality_scores = np.clip(quality_scores, 0, 100)

        return X, quality_scores

    def initialize_models(self):
        """Initialize and train the ML models with synthetic data."""
        if not self.initialized:
            X, y = self._generate_synthetic_data()
            X_scaled = self.scaler.fit_transform(X)
            self.quality_model.fit(X_scaled, y)
            self.initialized = True

    def predict_quality(self, parameters: Dict) -> float:
        """Predict quality score for given manufacturing parameters."""
        if not self.initialized:
            self.initialize_models()

        # Convert parameters to feature vector
        tool_type_encoding = {
            "carbide": 0,
            "high_speed_steel": 1,
            "diamond": 2
        }

        features = np.array([[
            parameters["cutting_speed"],
            parameters["feed_rate"],
            parameters["depth_of_cut"],
            tool_type_encoding[parameters["tool_type"]]
        ]])

        # Scale features and predict
        features_scaled = self.scaler.transform(features)
        predicted_quality = self.quality_model.predict(features_scaled)[0]
        return float(predicted_quality)

    def optimize_parameters(self, current_params: Dict) -> Dict:
        """Suggest optimized parameters based on current settings."""
        if not self.initialized:
            self.initialize_models()

        # Generate a grid of potential parameters around current values
        n_variations = 50
        variations = []
        base_cutting_speed = current_params["cutting_speed"]
        base_feed_rate = current_params["feed_rate"]
        base_depth = current_params["depth_of_cut"]

        for _ in range(n_variations):
            params = {
                "cutting_speed": max(50, min(200, base_cutting_speed + np.random.uniform(-20, 20))),
                "feed_rate": max(0.1, min(0.5, base_feed_rate + np.random.uniform(-0.1, 0.1))),
                "depth_of_cut": max(0.5, min(5.0, base_depth + np.random.uniform(-0.5, 0.5))),
                "tool_type": current_params["tool_type"]
            }
            quality = self.predict_quality(params)
            variations.append((quality, params))

        # Find best parameters
        best_quality, best_params = max(variations, key=lambda x: x[0])
        return {
            "optimized_parameters": best_params,
            "predicted_quality": best_quality
        }

    def detect_anomalies(self, parameters: Dict, actual_quality: float) -> Dict:
        """Detect anomalies in the manufacturing process."""
        predicted_quality = self.predict_quality(parameters)
        quality_diff = abs(predicted_quality - actual_quality)
        
        return {
            "is_anomaly": quality_diff > 10,
            "predicted_quality": predicted_quality,
            "quality_difference": quality_diff,
            "severity": "high" if quality_diff > 15 else "medium" if quality_diff > 10 else "low"
        }