# D:\AGENTIC_AI\src\agentic_ai\analytics.py
"""
Advanced analytics and reporting system
- Usage analytics
- Performance metrics
- Cost analysis
- ROI calculator
- Custom reports
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import json
import matplotlib.pyplot as plt
import seaborn as sns
from io import BytesIO
import base64

class AnalyticsEngine:
    """Advanced analytics engine for Agentic AI"""
    
    def __init__(self):
        self.metrics = {
            "agent_performance": [],
            "task_completion": [],
            "user_engagement": [],
            "cost_analysis": [],
            "system_health": []
        }
    
    def track_agent_performance(self, agent_id: str, task_id: str, 
                                success: bool, time_taken: float, cost: float):
        """Track agent performance metrics"""
        metric = {
            "timestamp": datetime.now().isoformat(),
            "agent_id": agent_id,
            "task_id": task_id,
            "success": success,
            "time_taken": time_taken,
            "cost": cost,
            "efficiency": (1 / time_taken) * 100 if time_taken > 0 else 0
        }
        self.metrics["agent_performance"].append(metric)
        return metric
    
    def generate_performance_report(self, start_date: datetime, end_date: datetime):
        """Generate comprehensive performance report"""
        # Filter metrics by date
        filtered_metrics = [
            m for m in self.metrics["agent_performance"]
            if start_date <= datetime.fromisoformat(m["timestamp"]) <= end_date
        ]
        
        if not filtered_metrics:
            return {"error": "No data for selected period"}
        
        # Calculate key metrics
        df = pd.DataFrame(filtered_metrics)
        
        report = {
            "period": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "summary": {
                "total_tasks": len(df),
                "success_rate": (df["success"].sum() / len(df)) * 100,
                "avg_completion_time": df["time_taken"].mean(),
                "total_cost": df["cost"].sum(),
                "avg_cost_per_task": df["cost"].mean()
            },
            "agent_breakdown": df.groupby("agent_id").agg({
                "success": "mean",
                "time_taken": "mean",
                "cost": "sum",
                "task_id": "count"
            }).rename(columns={"task_id": "task_count"}).to_dict(orient="index"),
            "daily_trends": self._calculate_daily_trends(df),
            "recommendations": self._generate_recommendations(df)
        }
        
        return report
    
    def calculate_roi(self, investment: float, revenue_generated: float, time_saved_hours: float):
        """Calculate Return on Investment"""
        hourly_rate = 50  # Average hourly rate
        time_saved_value = time_saved_hours * hourly_rate
        total_benefit = revenue_generated + time_saved_value
        
        roi_percentage = ((total_benefit - investment) / investment) * 100
        payback_period = investment / (total_benefit / 12)  # Months
        
        return {
            "investment": investment,
            "revenue_generated": revenue_generated,
            "time_saved_hours": time_saved_hours,
            "time_saved_value": time_saved_value,
            "total_benefit": total_benefit,
            "roi_percentage": roi_percentage,
            "payback_period_months": payback_period,
            "recommendation": "High ROI" if roi_percentage > 100 else "Medium ROI" if roi_percentage > 50 else "Low ROI"
        }
    
    def generate_visual_report(self, report_data: Dict):
        """Generate visual charts from report data"""
        # Create figure with multiple subplots
        fig, axes = plt.subplots(2, 2, figsize=(12, 10))
        
        # Plot 1: Success rate by agent
        agent_data = report_data.get("agent_breakdown", {})
        agents = list(agent_data.keys())
        success_rates = [agent_data[agent].get("success", 0) * 100 for agent in agents]
        
        axes[0, 0].bar(agents, success_rates)
        axes[0, 0].set_title("Success Rate by Agent")
        axes[0, 0].set_ylabel("Success Rate (%)")
        axes[0, 0].tick_params(axis='x', rotation=45)
        
        # Plot 2: Cost distribution
        costs = [agent_data[agent].get("cost", 0) for agent in agents]
        axes[0, 1].pie(costs, labels=agents, autopct='%1.1f%%')
        axes[0, 1].set_title("Cost Distribution by Agent")
        
        # Plot 3: Daily trends
        daily_trends = report_data.get("daily_trends", {})
        days = list(daily_trends.keys())
        tasks_completed = [daily_trends[day].get("tasks_completed", 0) for day in days]
        
        axes[1, 0].plot(days, tasks_completed, marker='o')
        axes[1, 0].set_title("Daily Task Completion")
        axes[1, 0].set_xlabel("Date")
        axes[1, 0].set_ylabel("Tasks Completed")
        axes[1, 0].tick_params(axis='x', rotation=45)
        
        # Plot 4: Efficiency metrics
        efficiency_metrics = [
            report_data["summary"]["success_rate"],
            report_data["summary"]["avg_completion_time"],
            report_data["summary"]["avg_cost_per_task"]
        ]
        metric_names = ["Success Rate", "Avg Time", "Avg Cost"]
        
        axes[1, 1].bar(metric_names, efficiency_metrics)
        axes[1, 1].set_title("Key Efficiency Metrics")
        axes[1, 1].tick_params(axis='x', rotation=45)
        
        plt.tight_layout()
        
        # Save to base64 string
        buf = BytesIO()
        plt.savefig(buf, format='png', dpi=150)
        buf.seek(0)
        img_str = base64.b64encode(buf.read()).decode('utf-8')
        plt.close()
        
        return img_str
    
    def _calculate_daily_trends(self, df):
        """Calculate daily trends from dataframe"""
        if df.empty:
            return {}
        
        df['date'] = pd.to_datetime(df['timestamp']).dt.date
        daily = df.groupby('date').agg({
            'task_id': 'count',
            'success': 'mean',
            'time_taken': 'mean',
            'cost': 'sum'
        }).rename(columns={'task_id': 'tasks_completed'})
        
        return daily.to_dict(orient='index')
    
    def _generate_recommendations(self, df):
        """Generate AI-powered recommendations"""
        recommendations = []
        
        if not df.empty:
            # Find best performing agent
            best_agent = df.groupby('agent_id')['success'].mean().idxmax()
            recommendations.append(f"Use {best_agent} for critical tasks (highest success rate)")
            
            # Find most expensive agent
            expensive_agent = df.groupby('agent_id')['cost'].mean().idxmax()
            recommendations.append(f"Optimize usage of {expensive_agent} (highest cost)")
            
            # Time-based recommendations
            avg_time = df['time_taken'].mean()
            if avg_time > 60:  # More than 60 seconds
                recommendations.append("Consider optimizing agent configurations for faster execution")
        
        return recommendations