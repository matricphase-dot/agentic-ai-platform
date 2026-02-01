# D:\AGENTIC_AI\examples\student_assistant_agent.py
"""
Student Assistant Agent
Built by Aditya Mehra (Student Founder)
Helps students with academic tasks
"""

from agentic_sdk import AgentBase, action
from datetime import datetime, timedelta
from typing import List, Dict, Any
import json


class StudentAssistantAgent(AgentBase):
    """AI assistant for student tasks"""
    
    def __init__(self):
        super().__init__(
            name="Student Assistant",
            description="Helps students with academic and organizational tasks",
            agent_type="specialized",
            skills=["academic_planning", "time_management", "research_assistance", "note_organization"]
        )
        
        # Common student tasks
        self.academic_calendar = {}
        self.assignment_tracker = []
    
    @action(description="Plan study schedule")
    async def plan_study_schedule(self, 
                                 subjects: List[str],
                                 hours_per_day: int = 4,
                                 days_until_exam: int = 30) -> Dict[str, Any]:
        """Create an optimized study schedule"""
        
        total_hours_needed = {
            "Mathematics": 40,
            "Physics": 35,
            "Chemistry": 30,
            "Computer Science": 50,
            "English": 20
        }
        
        schedule = {}
        available_hours = hours_per_day * days_until_exam
        
        # Allocate hours based on subject difficulty
        for subject in subjects:
            hours = total_hours_needed.get(subject, 30)
            daily_hours = hours / days_until_exam
            
            schedule[subject] = {
                "total_hours_needed": hours,
                "daily_hours_recommended": round(daily_hours, 2),
                "study_days_per_week": 5 if daily_hours > 1 else 3,
                "priority": "high" if subject in ["Mathematics", "Computer Science"] else "medium"
            }
        
        return {
            "schedule": schedule,
            "total_available_hours": available_hours,
            "total_required_hours": sum(schedule[s]["total_hours_needed"] for s in subjects),
            "efficiency_score": "good" if available_hours >= sum(schedule[s]["total_hours_needed"] for s in subjects) else "needs_adjustment",
            "recommendation": "Focus on priority subjects first" if len(subjects) > 3 else "Balanced schedule achievable"
        }
    
    @action(description="Organize study notes")
    async def organize_notes(self, 
                           notes: List[Dict[str, str]],
                           subject: str) -> Dict[str, Any]:
        """Organize and categorize study notes"""
        
        categories = {
            "definitions": ["define", "definition", "meaning", "what is"],
            "formulas": ["formula", "equation", "calculate", "solve"],
            "examples": ["example", "for instance", "such as"],
            "problems": ["problem", "exercise", "question", "solve"],
            "theorems": ["theorem", "proof", "lemma", "corollary"]
        }
        
        organized = {category: [] for category in categories}
        
        for note in notes:
            content = note.get("content", "").lower()
            title = note.get("title", "")
            
            # Categorize based on content
            for category, keywords in categories.items():
                if any(keyword in content for keyword in keywords):
                    organized[category].append({
                        "title": title,
                        "content_preview": content[:100] + "...",
                        "timestamp": note.get("timestamp", datetime.now().isoformat())
                    })
                    break
            else:
                organized["general"].append({
                    "title": title,
                    "content_preview": content[:100] + "..."
                })
        
        # Generate summary
        total_notes = len(notes)
        categorized = sum(len(notes) for notes in organized.values())
        
        return {
            "subject": subject,
            "total_notes": total_notes,
            "categorized_notes": categorized,
            "organization": organized,
            "coverage_score": round(categorized / total_notes * 100, 1) if total_notes > 0 else 0,
            "recommendations": self._get_note_recommendations(organized)
        }
    
    @action(description="Track assignment deadlines")
    async def track_assignments(self, 
                               assignments: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Track and prioritize assignments"""
        
        today = datetime.now()
        prioritized = []
        
        for assignment in assignments:
            due_date_str = assignment.get("due_date")
            if due_date_str:
                try:
                    due_date = datetime.fromisoformat(due_date_str.replace('Z', '+00:00'))
                    days_until_due = (due_date - today).days
                    
                    priority = "high" if days_until_due <= 3 else "medium" if days_until_due <= 7 else "low"
                    
                    prioritized.append({
                        "title": assignment.get("title", "Untitled"),
                        "subject": assignment.get("subject", "Unknown"),
                        "due_date": due_date_str,
                        "days_until_due": max(0, days_until_due),
                        "priority": priority,
                        "estimated_hours": assignment.get("estimated_hours", 3),
                        "status": "pending"
                    })
                except:
                    continue
        
        # Sort by priority and due date
        prioritized.sort(key=lambda x: (x["priority"] == "high", x["days_until_due"]))
        
        # Calculate workload
        high_priority = [a for a in prioritized if a["priority"] == "high"]
        total_hours = sum(a["estimated_hours"] for a in prioritized)
        
        return {
            "total_assignments": len(prioritized),
            "high_priority_count": len(high_priority),
            "total_estimated_hours": total_hours,
            "assignments": prioritized,
            "weekly_workload": round(total_hours / 7, 1),
            "recommendation": self._get_assignment_recommendation(prioritized)
        }
    
    @action(description="Generate study plan for exams")
    async def generate_exam_plan(self,
                               subjects: List[str],
                               exam_date: str,
                               current_preparation: Dict[str, float]) -> Dict[str, Any]:
        """Generate detailed exam preparation plan"""
        
        try:
            exam_dt = datetime.fromisoformat(exam_date.replace('Z', '+00:00'))
            today = datetime.now()
            days_until_exam = (exam_dt - today).days
            
            if days_until_exam <= 0:
                return {"error": "Exam date must be in the future"}
            
            plan = {}
            daily_schedule = []
            
            # Create daily plan
            for day in range(days_until_exam):
                day_date = today + timedelta(days=day)
                
                # Alternate between subjects
                subject_index = day % len(subjects)
                subject = subjects[subject_index]
                
                # Determine focus based on current preparation
                focus = "concepts" if current_preparation.get(subject, 0) < 50 else "practice"
                
                daily_schedule.append({
                    "day": day + 1,
                    "date": day_date.strftime("%Y-%m-%d"),
                    "subject": subject,
                    "focus": focus,
                    "tasks": [
                        "Review key concepts" if focus == "concepts" else "Solve practice problems",
                        "Create summary notes",
                        "Take practice quiz"
                    ],
                    "estimated_hours": 3
                })
            
            # Revision days (last 3 days)
            for i in range(min(3, days_until_exam)):
                revision_day = days_until_exam - i - 1
                if revision_day >= 0:
                    daily_schedule[revision_day] = {
                        "day": revision_day + 1,
                        "date": (today + timedelta(days=revision_day)).strftime("%Y-%m-%d"),
                        "subject": "All",
                        "focus": "revision",
                        "tasks": ["Quick revision of all topics", "Solve previous year papers", "Mock test"],
                        "estimated_hours": 4
                    }
            
            return {
                "exam_date": exam_date,
                "days_until_exam": days_until_exam,
                "total_study_hours": sum(day["estimated_hours"] for day in daily_schedule),
                "daily_schedule": daily_schedule,
                "recommended_strategy": "Spaced repetition with increasing intensity",
                "success_probability": self._calculate_success_probability(days_until_exam, len(subjects))
            }
            
        except Exception as e:
            return {"error": str(e)}
    
    def _get_note_recommendations(self, organized_notes):
        """Get recommendations for note organization"""
        recommendations = []
        
        if len(organized_notes.get("formulas", [])) > 10:
            recommendations.append("Create a formula sheet for quick reference")
        
        if len(organized_notes.get("examples", [])) < 5:
            recommendations.append("Add more examples for better understanding")
        
        general_count = len(organized_notes.get("general", []))
        if general_count > 5:
            recommendations.append(f"Categorize {general_count} general notes for better organization")
        
        return recommendations
    
    def _get_assignment_recommendation(self, assignments):
        """Get recommendations for assignments"""
        high_priority = [a for a in assignments if a["priority"] == "high"]
        
        if len(high_priority) > 3:
            return "Focus on completing high-priority assignments first"
        elif sum(a["estimated_hours"] for a in assignments) > 20:
            return "Break down large assignments into smaller tasks"
        else:
            return "Good workload management. Maintain current pace"
    
    def _calculate_success_probability(self, days_until_exam, num_subjects):
        """Calculate probability of exam success"""
        base_probability = min(90, (days_until_exam * 10) / num_subjects)
        return f"{base_probability:.1f}% with consistent study"


if __name__ == "__main__":
    import asyncio
    
    async def demo():
        agent = StudentAssistantAgent()
        await agent.start()
        
        print("🎓 Student Assistant Agent Demo")
        print("=" * 50)
        
        # Test study schedule
        result1 = await agent.execute("plan_study_schedule", 
                                     subjects=["Mathematics", "Physics", "Computer Science"],
                                     hours_per_day=4,
                                     days_until_exam=30)
        print(f"\n📅 Study Schedule: {result1}")
        
        # Test assignment tracking
        assignments = [
            {"title": "Math Assignment 1", "subject": "Mathematics", "due_date": "2024-02-10", "estimated_hours": 5},
            {"title": "Physics Lab Report", "subject": "Physics", "due_date": "2024-02-05", "estimated_hours": 3},
            {"title": "CS Project", "subject": "Computer Science", "due_date": "2024-02-15", "estimated_hours": 10}
        ]
        
        result2 = await agent.execute("track_assignments", assignments=assignments)
        print(f"\n📋 Assignment Tracking: {result2}")
        
        await agent.stop()
    
    asyncio.run(demo())