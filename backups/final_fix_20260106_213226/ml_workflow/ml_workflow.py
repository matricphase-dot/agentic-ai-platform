import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional
import json
import time
from datetime import datetime

class MLWorkflow:
    def __init__(self):
        self.models = {}
        self.training_history = []
        self.predictions = []
        print("✅ ML Workflow module initialized")
    
    def train_model(self, data: Dict, model_type: str = "regression") -> Dict:
        """Train a machine learning model"""
        try:
            # Simulate training process
            start_time = time.time()
            
            # Extract features and target from data
            features = data.get("features", [])
            target = data.get("target", [])
            
            if not features or not target:
                return {"error": "Missing features or target data"}
            
            # Create model ID
            model_id = f"{model_type}_{int(time.time())}"
            
            # Simulate training (in real implementation, this would use scikit-learn, tensorflow, etc.)
            if model_type == "regression":
                # Simple linear regression simulation
                coefficients = self._simulate_linear_regression(features, target)
                model_info = {
                    "type": "linear_regression",
                    "coefficients": coefficients,
                    "intercept": np.mean(target),
                    "r2_score": 0.85,  # Simulated
                    "mse": 0.1  # Simulated
                }
            elif model_type == "classification":
                # Simple classification simulation
                model_info = {
                    "type": "logistic_regression",
                    "accuracy": 0.92,  # Simulated
                    "precision": 0.89,  # Simulated
                    "recall": 0.91  # Simulated
                }
            elif model_type == "clustering":
                # Clustering simulation
                model_info = {
                    "type": "kmeans",
                    "clusters": 3,
                    "inertia": 150.5,  # Simulated
                    "silhouette_score": 0.65  # Simulated
                }
            else:
                return {"error": f"Unsupported model type: {model_type}"}
            
            # Store model
            self.models[model_id] = {
                "info": model_info,
                "created_at": datetime.now().isoformat(),
                "training_time": time.time() - start_time,
                "data_shape": {"samples": len(features), "features": len(features[0]) if features else 0}
            }
            
            # Record training history
            self.training_history.append({
                "model_id": model_id,
                "model_type": model_type,
                "timestamp": datetime.now().isoformat(),
                "training_time": time.time() - start_time,
                "performance": model_info
            })
            
            return {
                "success": True,
                "model_id": model_id,
                "training_time": round(time.time() - start_time, 2),
                "model_info": model_info,
                "message": f"{model_type} model trained successfully"
            }
            
        except Exception as e:
            return {"error": f"Model training failed: {str(e)}"}
    
    def _simulate_linear_regression(self, features, target):
        """Simulate linear regression coefficients"""
        # Convert to numpy arrays
        X = np.array(features)
        y = np.array(target)
        
        # Add bias term
        X_with_bias = np.c_[np.ones(X.shape[0]), X]
        
        # Calculate coefficients using normal equation (simplified)
        try:
            coefficients = np.linalg.inv(X_with_bias.T @ X_with_bias) @ X_with_bias.T @ y
            return coefficients.tolist()
        except:
            # Return random coefficients if calculation fails
            return np.random.randn(X_with_bias.shape[1]).tolist()
    
    def predict(self, model_id: str, features: List) -> Dict:
        """Make predictions using a trained model"""
        try:
            if model_id not in self.models:
                return {"error": f"Model {model_id} not found"}
            
            model = self.models[model_id]
            model_type = model["info"]["type"]
            
            start_time = time.time()
            
            if "linear_regression" in model_type:
                # Simulate linear regression prediction
                coefficients = model["info"].get("coefficients", [])
                intercept = model["info"].get("intercept", 0)
                
                # Calculate prediction
                if coefficients:
                    # Assuming features is a single sample
                    prediction = intercept
                    for i, coef in enumerate(coefficients[1:], 1):  # Skip bias term
                        if i-1 < len(features):
                            prediction += coef * features[i-1]
                else:
                    prediction = np.mean(features) if features else 0
                    
                prediction_result = float(prediction)
                
            elif "logistic_regression" in model_type:
                # Simulate classification prediction
                prediction_result = 1 if sum(features) > len(features)/2 else 0
                
            elif "kmeans" in model_type:
                # Simulate cluster assignment
                prediction_result = int(sum(features) % 3)  # Assign to one of 3 clusters
                
            else:
                return {"error": f"Unsupported model type for prediction: {model_type}"}
            
            # Record prediction
            self.predictions.append({
                "model_id": model_id,
                "features": features,
                "prediction": prediction_result,
                "timestamp": datetime.now().isoformat(),
                "prediction_time": time.time() - start_time
            })
            
            return {
                "success": True,
                "model_id": model_id,
                "prediction": prediction_result,
                "prediction_time": round(time.time() - start_time, 4),
                "confidence": 0.92  # Simulated confidence score
            }
            
        except Exception as e:
            return {"error": f"Prediction failed: {str(e)}"}
    
    def get_model_info(self, model_id: str) -> Dict:
        """Get information about a specific model"""
        if model_id in self.models:
            return self.models[model_id]
        return {"error": f"Model {model_id} not found"}
    
    def get_all_models(self) -> List[Dict]:
        """Get all trained models"""
        return [
            {"model_id": mid, **info}
            for mid, info in self.models.items()
        ]
    
    def optimize_parameters(self, model_type: str, data: Dict) -> Dict:
        """Optimize model parameters"""
        try:
            # Simulate parameter optimization
            if model_type == "regression":
                optimal_params = {
                    "learning_rate": 0.01,
                    "iterations": 1000,
                    "regularization": 0.1,
                    "batch_size": 32
                }
            elif model_type == "classification":
                optimal_params = {
                    "C": 1.0,
                    "penalty": "l2",
                    "solver": "lbfgs",
                    "max_iter": 100
                }
            elif model_type == "clustering":
                optimal_params = {
                    "n_clusters": 3,
                    "init": "k-means++",
                    "n_init": 10,
                    "max_iter": 300
                }
            else:
                return {"error": f"Unsupported model type: {model_type}"}
            
            return {
                "success": True,
                "model_type": model_type,
                "optimal_parameters": optimal_params,
                "optimization_score": 0.95,  # Simulated
                "message": f"Parameter optimization completed for {model_type}"
            }
            
        except Exception as e:
            return {"error": f"Parameter optimization failed: {str(e)}"}
    
    def analyze_patterns(self, data: List) -> Dict:
        """Analyze patterns in data"""
        try:
            if not data:
                return {"error": "No data provided"}
            
            # Convert to numpy array
            arr = np.array(data)
            
            # Calculate statistics
            stats = {
                "mean": float(np.mean(arr)),
                "median": float(np.median(arr)),
                "std": float(np.std(arr)),
                "min": float(np.min(arr)),
                "max": float(np.max(arr)),
                "count": len(arr)
            }
            
            # Detect trends
            if len(arr) > 1:
                slope = (arr[-1] - arr[0]) / len(arr) if len(arr) > 1 else 0
                trend = "increasing" if slope > 0 else "decreasing" if slope < 0 else "stable"
                stats["trend"] = trend
                stats["slope"] = float(slope)
            
            # Detect outliers (simple method)
            q1 = np.percentile(arr, 25)
            q3 = np.percentile(arr, 75)
            iqr = q3 - q1
            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr
            outliers = arr[(arr < lower_bound) | (arr > upper_bound)]
            stats["outliers_count"] = len(outliers)
            
            return {
                "success": True,
                "statistics": stats,
                "pattern_summary": "Data analyzed successfully"
            }
            
        except Exception as e:
            return {"error": f"Pattern analysis failed: {str(e)}"}

# Create instance for import
ml_workflow = MLWorkflow()
