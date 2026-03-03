# Create AI integration module
@'
# backend/ai_integration.py - Real AI model integration
import os
from typing import Dict, Any, List
from openai import OpenAI
import anthropic
from dotenv import load_dotenv

load_dotenv()

class AIModelRouter:
    """Routes requests to different AI models"""
    
    def __init__(self):
        self.openai_client = None
        self.anthropic_client = None
        
        # Initialize clients if API keys exist
        if os.getenv("OPENAI_API_KEY"):
            self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            
        if os.getenv("ANTHROPIC_API_KEY"):
            self.anthropic_client = anthropic.Anthropic(
                api_key=os.getenv("ANTHROPIC_API_KEY")
            )
    
    def generate_response(self, agent_type: str, task: str, system_prompt: str = "") -> Dict[str, Any]:
        """Generate response using appropriate AI model"""
        
        # Default to OpenAI if available
        if self.openai_client:
            return self._call_openai(agent_type, task, system_prompt)
        elif self.anthropic_client:
            return self._call_anthropic(agent_type, task, system_prompt)
        else:
            # Mock response if no API keys
            return self._mock_response(agent_type, task)
    
    def _call_openai(self, agent_type: str, task: str, system_prompt: str) -> Dict[str, Any]:
        """Call OpenAI API"""
        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": f"As a {agent_type}, {task}"})
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=messages,
                temperature=0.7,
                max_tokens=1000
            )
            
            return {
                "success": True,
                "content": response.choices[0].message.content,
                "model": "gpt-4",
                "tokens": response.usage.total_tokens
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "content": f"[Mock] {agent_type} response: {task}"
            }
    
    def _call_anthropic(self, agent_type: str, task: str, system_prompt: str) -> Dict[str, Any]:
        """Call Anthropic Claude API"""
        try:
            prompt = f"{system_prompt}\n\nHuman: As a {agent_type}, {task}\n\nAssistant:"
            
            response = self.anthropic_client.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=1000,
                messages=[{"role": "user", "content": prompt}]
            )
            
            return {
                "success": True,
                "content": response.content[0].text,
                "model": "claude-3-opus",
                "tokens": response.usage.input_tokens + response.usage.output_tokens
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "content": f"[Mock] {agent_type} response: {task}"
            }
    
    def _mock_response(self, agent_type: str, task: str) -> Dict[str, Any]:
        """Mock response when no API keys are available"""
        responses = {
            "researcher": f"Based on my research: '{task}'. I've analyzed multiple sources and found key insights.",
            "writer": f"I've written a comprehensive piece about: '{task}'. It includes introduction, body, and conclusion.",
            "coder": f"I've implemented a solution for: '{task}'. The code is efficient and well-documented.",
            "analyst": f"My analysis of '{task}' reveals important trends and actionable insights."
        }
        
        return {
            "success": True,
            "content": responses.get(agent_type, f"As a {agent_type}, I've completed: {task}"),
            "model": "mock",
            "tokens": 0
        }

# Global instance
ai_router = AIModelRouter()
'@ | Set-Content -Path "backend/ai_integration.py" -Encoding UTF8