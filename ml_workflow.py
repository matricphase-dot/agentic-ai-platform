"""
ml_workflow.py - ML-POWERED WORKFLOW OPTIMIZATION
"""
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import joblib
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any
import os

class MLWorkflowOptimizer:
    def __init__(self):
        print("🧠 Initializing ML Workflow Optimizer...")
        
        # Initialize ML components
        self.vectorizer = TfidfVectorizer(max_features=100)
        self.cluster_model = None
        self.workflow_data = []
        
        # Load existing data
        self.load_workflow_data()
    
    def load_workflow_data(self):
        """Load existing workflow data for training"""
        data_path = "database/workflow_patterns.json"
        if os.path.exists(data_path):
            try:
                with open(data_path, 'r') as f:
                    self.workflow_data = json.load(f)
                print(f"✅ Loaded {len(self.workflow_data)} workflow patterns")
            except:
                self.workflow_data = []
        
        # Add sample data if empty
        if not self.workflow_data:
            self.workflow_data = self.create_sample_data()
    
    def create_sample_data(self):
        """Create sample workflow patterns"""
        return [
            {
                "id": 1,
                "name": "File Organization",
                "description": "Organize files by type and date",
                "category": "file_management",
                "steps": 5,
                "duration": 120,
                "success_rate": 0.95,
                "frequency": "daily"
            },
            {
                "id": 2,
                "name": "Email Processing",
                "description": "Sort and respond to emails",
                "category": "communication",
                "steps": 8,
                "duration": 300,
                "success_rate": 0.88,
                "frequency": "hourly"
            },
            {
                "id": 3,
                "name": "Data Backup",
                "description": "Backup important files to cloud",
                "category": "backup",
                "steps": 3,
                "duration": 600,
                "success_rate": 0.99,
                "frequency": "weekly"
            }
        ]
    
    def analyze_workflow_patterns(self, workflows: List[Dict]) -> Dict:
        """Analyze workflow patterns using ML"""
        try:
            # Extract features from workflow descriptions
            descriptions = [w.get("description", "") for w in workflows]
            
            if len(descriptions) > 1:
                # Vectorize text
                X = self.vectorizer.fit_transform(descriptions)
                
                # Cluster similar workflows
                n_clusters = min(3, len(workflows))
                kmeans = KMeans(n_clusters=n_clusters, random_state=42)
                clusters = kmeans.fit_predict(X)
                
                # Calculate similarities
                similarity_matrix = cosine_similarity(X)
                
                # Find patterns
                patterns = self.extract_patterns(workflows, clusters, similarity_matrix)
                
                return {
                    "success": True,
                    "clusters": clusters.tolist(),
                    "patterns": patterns,
                    "similarity_matrix": similarity_matrix.tolist(),
                    "total_workflows": len(workflows),
                    "unique_patterns": len(set(clusters))
                }
            else:
                return {
                    "success": True,
                    "message": "Need more workflows for pattern analysis",
                    "patterns": []
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "patterns": []
            }
    
    def extract_patterns(self, workflows, clusters, similarity_matrix):
        """Extract common patterns from clustered workflows"""
        patterns = []
        
        for cluster_id in set(clusters):
            # Get workflows in this cluster
            cluster_indices = [i for i, c in enumerate(clusters) if c == cluster_id]
            cluster_workflows = [workflows[i] for i in cluster_indices]
            
            # Calculate cluster statistics
            avg_steps = np.mean([w.get("steps", 0) for w in cluster_workflows])
            avg_duration = np.mean([w.get("duration", 0) for w in cluster_workflows])
            avg_success = np.mean([w.get("success_rate", 0) for w in cluster_workflows])
            
            # Find most common category
            categories = [w.get("category", "unknown") for w in cluster_workflows]
            common_category = max(set(categories), key=categories.count)
            
            # Extract keywords from descriptions
            descriptions = [w.get("description", "") for w in cluster_workflows]
            common_words = self.extract_common_words(descriptions)
            
            patterns.append({
                "cluster_id": int(cluster_id),
                "workflow_count": len(cluster_workflows),
                "common_category": common_category,
                "average_steps": round(avg_steps, 1),
                "average_duration": round(avg_duration, 1),
                "average_success_rate": round(avg_success, 2),
                "common_words": common_words[:5],  # Top 5 words
                "example_workflows": [w["name"] for w in cluster_workflows[:3]]
            })
        
        return patterns
    
    def extract_common_words(self, descriptions: List[str]) -> List[str]:
        """Extract common words from descriptions"""
        from collections import Counter
        import re
        
        all_words = []
        for desc in descriptions:
            words = re.findall(r'\b\w{4,}\b', desc.lower())  # Words with 4+ chars
            all_words.extend(words)
        
        word_counts = Counter(all_words)
        
        # Filter out common stop words
        stop_words = {'that', 'with', 'from', 'this', 'have', 'what', 'when'}
        filtered = {word: count for word, count in word_counts.items() 
                   if word not in stop_words}
        
        # Return top words
        return [word for word, _ in sorted(filtered.items(), key=lambda x: x[1], reverse=True)]
    
    def predict_optimization(self, workflow: Dict) -> Dict:
        """Predict optimizations for a workflow"""
        predictions = []
        
        # Rule-based predictions
        steps = workflow.get("steps", 0)
        duration = workflow.get("duration", 0)
        
        if steps > 10:
            predictions.append({
                "type": "simplification",
                "confidence": 0.85,
                "suggestion": "Break into smaller sub-workflows",
                "estimated_savings": f"Reduce steps by {steps - 8}"
            })
        
        if duration > 300:  # 5 minutes
            predictions.append({
                "type": "parallelization",
                "confidence": 0.75,
                "suggestion": "Run steps in parallel where possible",
                "estimated_savings": f"Reduce time by {duration // 2} seconds"
            })
        
        if workflow.get("success_rate", 1.0) < 0.9:
            predictions.append({
                "type": "reliability",
                "confidence": 0.9,
                "suggestion": "Add error handling and retry logic",
                "estimated_savings": f"Increase success rate to 95%"
            })
        
        # Add ML-based predictions if we have similar workflows
        similar = self.find_similar_workflows(workflow)
        if similar:
            best_similar = max(similar, key=lambda x: x["similarity"])
            if best_similar["success_rate"] > workflow.get("success_rate", 0):
                predictions.append({
                    "type": "learning",
                    "confidence": best_similar["similarity"],
                    "suggestion": f"Adopt pattern from '{best_similar['name']}'",
                    "estimated_savings": f"Improve success by {best_similar['success_rate'] - workflow.get('success_rate', 0):.2%}"
                })
        
        return {
            "predictions": predictions,
            "total_potential_savings": len(predictions),
            "workflow_complexity": self.calculate_complexity_score(workflow)
        }
    
    def find_similar_workflows(self, workflow: Dict, limit: int = 3) -> List[Dict]:
        """Find similar workflows using ML"""
        # This would use embeddings in production
        # For now, use simple keyword matching
        
        query_desc = workflow.get("description", "").lower()
        query_words = set(query_desc.split())
        
        similarities = []
        for wf in self.workflow_data:
            wf_desc = wf.get("description", "").lower()
            wf_words = set(wf_desc.split())
            
            # Simple Jaccard similarity
            if query_words and wf_words:
                similarity = len(query_words & wf_words) / len(query_words | wf_words)
            else:
                similarity = 0
            
            if similarity > 0.3:  # Threshold
                similarities.append({
                    "name": wf.get("name"),
                    "similarity": round(similarity, 2),
                    "category": wf.get("category"),
                    "success_rate": wf.get("success_rate", 0)
                })
        
        # Sort by similarity
        similarities.sort(key=lambda x: x["similarity"], reverse=True)
        return similarities[:limit]
    
    def calculate_complexity_score(self, workflow: Dict) -> float:
        """Calculate workflow complexity score (0-1)"""
        score = 0
        
        # Steps complexity
        steps = workflow.get("steps", 1)
        score += min(0.3, steps / 30)
        
        # Duration complexity
        duration = workflow.get("duration", 0)
        score += min(0.3, duration / 1800)  # 30 minutes max
        
        # Category complexity weights
        category = workflow.get("category", "")
        if category in ["data_processing", "automation"]:
            score += 0.2
        elif category in ["file_management", "backup"]:
            score += 0.1
        
        # Success rate inverse (lower success = more complex)
        success = workflow.get("success_rate", 1.0)
        score += (1 - success) * 0.2
        
        return min(1.0, round(score, 2))
    
    def suggest_schedule(self, workflow: Dict) -> Dict:
        """Suggest optimal schedule for workflow"""
        category = workflow.get("category", "")
        frequency = workflow.get("frequency", "manual")
        
        # ML-based scheduling suggestions
        suggestions = {
            "file_management": {"best_time": "03:00", "frequency": "daily"},
            "backup": {"best_time": "02:00", "frequency": "daily"},
            "data_processing": {"best_time": "04:00", "frequency": "hourly"},
            "communication": {"best_time": "09:00", "frequency": "hourly"},
            "maintenance": {"best_time": "01:00", "frequency": "weekly"}
        }
        
        default = {"best_time": "00:00", "frequency": "manual"}
        schedule = suggestions.get(category, default)
        
        return {
            "suggested_schedule": schedule,
            "reason": f"Based on {category} workflow patterns",
            "predicted_success": 0.85,
            "estimated_runtime": workflow.get("duration", 0)
        }

# Test the ML optimizer
if __name__ == "__main__":
    ml = MLWorkflowOptimizer()
    
    # Analyze patterns
    patterns = ml.analyze_workflow_patterns(ml.workflow_data)
    
    print("\n📊 ML Workflow Analysis:")
    print(f"Total workflows: {patterns.get('total_workflows')}")
    print(f"Unique patterns: {patterns.get('unique_patterns')}")
    
    # Test prediction
    test_workflow = {
        "name": "Report Generation",
        "description": "Generate daily sales reports from database",
        "category": "data_processing",
        "steps": 15,
        "duration": 900,
        "success_rate": 0.82
    }
    
    prediction = ml.predict_optimization(test_workflow)
    print(f"\n🔮 Optimization Predictions for '{test_workflow['name']}':")
    for pred in prediction.get("predictions", []):
        print(f"  • {pred['suggestion']} (confidence: {pred['confidence']})")
    
    print(f"  Complexity Score: {prediction.get('workflow_complexity')}")