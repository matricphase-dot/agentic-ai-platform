# Agentic SDK - Universal Agent Development Kit 
__version__ = "1.0.0" 
__author__ = "Agentic AI" 
 
import sys 
import os 
import json 
import asyncio 
import logging 
 
# Initialize colorama for Windows CMD colors 
try: 
    import colorama 
    colorama.init() 
except ImportError: 
    pass 
 
# Core classes - import with error handling 
try: 
    from .agent_base import AgentBase 
    from .registry import AgentRegistry 
    from .decorators import register_action 
    SDK_AVAILABLE = True 
    print("? Agentic SDK loaded successfully") 
except ImportError as e: 
    print(f"?? Agentic SDK partially loaded: {e}") 
    # Create dummy classes for fallback 
    class AgentBase: 
        def __init__(self, name, description=""): 
            self.name = name 
            self.description = description 
    class AgentRegistry: 
        pass 
    def register_action(func): 
        return func 
    SDK_AVAILABLE = False 
 
# Setup logging 
logging.basicConfig(level=logging.INFO) 
logger = logging.getLogger(__name__) 
