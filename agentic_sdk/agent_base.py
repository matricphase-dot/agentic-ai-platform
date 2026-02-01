# D:\AGENTIC_AI\agentic_sdk\agent_base.py
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any
import asyncio

class AgentBase(ABC):
    def __init__(self, name: str, description: str = ""):
        self.name = name
        self.description = description
        self.actions = []
    
    @abstractmethod
    async def execute(self, task: str) -> Dict[str, Any]:
        """Execute a task and return result"""
        pass
    
    def register_action(self, func):
        """Register an action function"""
        self.actions.append(func)
        return func
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert agent to dictionary"""
        return {
            "name": self.name,
            "description": self.description,
            "actions": [a.__name__ for a in self.actions]
        }