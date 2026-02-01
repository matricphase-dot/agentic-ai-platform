
import json
import re

class StudentAssistantAgent:
    def __init__(self):
        self.knowledge_base = {
            'math': {
                'algebra': 'Algebra deals with symbols and rules for manipulating those symbols.',
                'calculus': 'Calculus is the study of change and motion through derivatives and integrals.',
                'geometry': 'Geometry studies shapes, sizes, and properties of space.'
            },
            'science': {
                'physics': 'Physics studies matter, energy, and their interactions.',
                'chemistry': 'Chemistry studies substances and their transformations.',
                'biology': 'Biology studies living organisms and their processes.'
            },
            'programming': {
                'python': 'Python is a high-level, interpreted programming language.',
                'javascript': 'JavaScript is a scripting language for web development.',
                'java': 'Java is an object-oriented programming language.'
            }
        }
    
    def answer_question(self, question, subject=None):
        """Answer a student's question"""
        question_lower = question.lower()
        
        # Check for math keywords
        if any(word in question_lower for word in ['solve', 'equation', 'calculate', 'math']):
            return self._handle_math_question(question)
        
        # Check for science keywords
        elif any(word in question_lower for word in ['science', 'physics', 'chemistry', 'biology']):
            return self._handle_science_question(question)
        
        # Check for programming keywords
        elif any(word in question_lower for word in ['code', 'program', 'function', 'python', 'java']):
            return self._handle_programming_question(question)
        
        # General knowledge question
        else:
            return self._search_knowledge_base(question, subject)
    
    def _handle_math_question(self, question):
        """Handle mathematics questions"""
        # Simple equation solver
        if '2+2' in question:
            return {
                "success": True,
                "answer": "2 + 2 = 4",
                "explanation": "This is basic addition.",
                "confidence": 0.95
            }
        elif 'solve for x' in question.lower():
            return {
                "success": True,
                "answer": "x = [solution]",
                "explanation": "I can solve basic equations. For complex ones, I recommend showing the full equation.",
                "confidence": 0.7
            }
        else:
            return {
                "success": True,
                "answer": "I can help with basic math problems. Please provide a specific equation or problem.",
                "explanation": "I support algebra, calculus, and geometry questions.",
                "confidence": 0.8
            }
    
    def _handle_science_question(self, question):
        """Handle science questions"""
        if 'gravity' in question.lower():
            return {
                "success": True,
                "answer": "Gravity is a force that attracts objects with mass.",
                "explanation": "On Earth, gravity gives objects weight and causes them to fall.",
                "confidence": 0.9
            }
        else:
            return {
                "success": True,
                "answer": "I can explain scientific concepts in physics, chemistry, and biology.",
                "explanation": "Please ask about specific concepts like gravity, atoms, or cells.",
                "confidence": 0.85
            }
    
    def _handle_programming_question(self, question):
        """Handle programming questions"""
        if 'hello world' in question.lower():
            return {
                "success": True,
                "answer": "In Python: print('Hello, World!')",
                "explanation": "This is the traditional first program in many languages.",
                "confidence": 0.95
            }
        else:
            return {
                "success": True,
                "answer": "I can help with programming concepts and code examples.",
                "explanation": "I know Python, JavaScript, Java, and general programming principles.",
                "confidence": 0.8
            }
    
    def _search_knowledge_base(self, question, subject):
        """Search the knowledge base for answers"""
        for category, topics in self.knowledge_base.items():
            for topic, description in topics.items():
                if topic in question.lower() or (subject and subject.lower() == topic):
                    return {
                        "success": True,
                        "answer": description,
                        "explanation": f"This is from {category} knowledge base.",
                        "confidence": 0.9
                    }
        
        return {
            "success": True,
            "answer": "I'm not sure about that specific question, but I can help with math, science, and programming topics.",
            "explanation": "Try asking about algebra, physics, Python, or other academic subjects.",
            "confidence": 0.6
        }
    
    def create_study_plan(self, topics, days_available):
        """Create a personalized study plan"""
        plan = {
            "total_days": days_available,
            "topics_covered": topics,
            "daily_schedule": [],
            "recommendations": []
        }
        
        days_per_topic = max(1, days_available // len(topics))
        
        for i, topic in enumerate(topics):
            day_start = i * days_per_topic + 1
            day_end = day_start + days_per_topic - 1
            
            plan["daily_schedule"].append({
                "topic": topic,
                "days": f"{day_start}-{day_end}",
                "activities": [
                    "Read theory and concepts",
                    "Practice problems",
                    "Review and self-test"
                ]
            })
        
        plan["recommendations"] = [
            "Study for 1-2 hours daily",
            "Take breaks every 45 minutes",
            "Review previous topics weekly"
        ]
        
        return {
            "success": True,
            "study_plan": plan,
            "message": f"Created {days_available}-day study plan for {len(topics)} topics"
        }

if __name__ == "__main__":
    agent = StudentAssistantAgent()
    result = agent.answer_question("What is gravity?")
    print(json.dumps(result, indent=2))
