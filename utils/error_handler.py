import traceback 
import logging 
from functools import wraps 
 
class AgenticErrorHandler: 
    def __init__(self): 
        self.logger = logging.getLogger('agentic') 
 
    def handle_gracefully(self, func): 
        @wraps(func) 
        def wrapper(*args, **kwargs): 
            try: 
                return func(*args, **kwargs) 
            except Exception as e: 
                self.logger.error(f"Error in {func.__name__}: {str(e)}") 
                return { 
                    "status": "error", 
                    "message": f"Task failed: {str(e)}", 
                    "suggestion": self._get_suggestion(e), 
                    "traceback": traceback.format_exc() if self.debug else None 
                } 
        return wrapper 
 
    def _get_suggestion(self, error): 
        suggestions = { 
            "ConnectionError": "Check your internet connection", 
            "TimeoutError": "Try increasing timeout in settings", 
            "PermissionError": "Run as administrator or check file permissions", 
            "ModuleNotFoundError": "Install missing package: pip install package-name" 
        } 
        for key in suggestions: 
            if key in str(error): 
                return suggestions[key] 
        return "Contact support@agentic.ai" 
