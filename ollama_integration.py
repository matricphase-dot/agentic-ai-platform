# ollama_integration.py - IMPROVED VERSION
import requests
import json
from datetime import datetime
import os
import sys

class OllamaIntegration:
    def __init__(self, base_url="http://localhost:11434"):
        self.base_url = base_url
        self.available = False
        self.models = []
        self.current_model = None
        self.initialize()
    
    def initialize(self):
        """Initialize connection to Ollama"""
        print("🤖 Initializing Ollama Integration...")
        
        # Try multiple connection attempts
        for attempt in range(3):
            try:
                print(f"Attempt {attempt + 1}/3 to connect to Ollama...")
                response = requests.get(f"{self.base_url}/api/tags", timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    self.models = [model["name"] for model in data.get("models", [])]
                    
                    if self.models:
                        self.available = True
                        self.current_model = self.models[0]  # Use first available
                        
                        print(f"✅ Successfully connected to Ollama!")
                        print(f"📦 Available models: {self.models}")
                        print(f"🎯 Using model: {self.current_model}")
                        return True
                    else:
                        print("⚠️ Ollama running but no models found")
                        print("   Run: ollama pull llama3.2")
                        self.available = False
                        return False
                else:
                    print(f"⚠️ Ollama responded with HTTP {response.status_code}")
            
            except requests.exceptions.ConnectionError:
                if attempt < 2:
                    print(f"   Connection failed, retrying in 3 seconds...")
                    import time
                    time.sleep(3)
                else:
                    print("❌ Could not connect to Ollama after 3 attempts")
            
            except Exception as e:
                print(f"❌ Error connecting to Ollama: {e}")
                break
        
        print("⚠️ Ollama not available - using fallback mode")
        self.available = False
        return False
    
    def get_status(self):
        """Get Ollama status"""
        return {
            "available": self.available,
            "base_url": self.base_url,
            "models": self.models,
            "current_model": self.current_model,
            "server_time": datetime.now().isoformat()
        }
    
    def test_connection(self):
        """Test connection to Ollama"""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            return {
                "connected": True,
                "status_code": response.status_code,
                "models": [m["name"] for m in response.json().get("models", [])] if response.status_code == 200 else []
            }
        except Exception as e:
            return {
                "connected": False,
                "error": str(e)
            }
    
    def generate_code(self, task_description, model=None):
        """Generate Python automation code"""
        print(f"\n🎯 Generating code for task: {task_description[:50]}...")
        
        # If Ollama not available, use fallback
        if not self.available:
            print("⚠️ Ollama not available, using template fallback")
            return self._fallback_code(task_description)
        
        # Use specified model or default
        target_model = model or self.current_model
        
        if target_model not in self.models:
            print(f"⚠️ Model '{target_model}' not available. Using {self.current_model}")
            target_model = self.current_model
        
        # Create optimized prompt
        prompt = self._create_prompt(task_description)
        
        try:
            print(f"🧠 Using model: {target_model}")
            
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": target_model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "num_predict": 1000,
                        "top_p": 0.9
                    }
                },
                timeout=120  # Longer timeout for generation
            )
            
            if response.status_code == 200:
                result = response.json()
                raw_code = result.get("response", "").strip()
                
                if raw_code:
                    # Clean and format code
                    clean_code = self._clean_code(raw_code, task_description, target_model)
                    
                    print(f"✅ Successfully generated {len(clean_code)} characters of code")
                    
                    return {
                        "success": True,
                        "code": clean_code,
                        "model": target_model,
                        "response_time": result.get("total_duration", 0) / 1e9 if "total_duration" in result else 0,
                        "tokens": result.get("eval_count", 0),
                        "timestamp": datetime.now().isoformat(),
                        "raw_preview": raw_code[:100] + "..." if len(raw_code) > 100 else raw_code
                    }
                else:
                    print("⚠️ Ollama returned empty response")
                    return self._fallback_code(task_description)
            else:
                print(f"❌ Ollama API error: {response.status_code}")
                return self._fallback_code(task_description)
                
        except requests.exceptions.Timeout:
            print("❌ Ollama request timed out")
            return self._fallback_code(task_description)
        except Exception as e:
            print(f"❌ Generation error: {str(e)}")
            return self._fallback_code(task_description)
    
    def _create_prompt(self, task):
        """Create prompt for code generation"""
        return f"""You are an expert Python automation engineer. Generate a complete, working Python script for this task:

TASK: {task}

INSTRUCTIONS:
1. Use pyautogui for automation
2. Include error handling with try-except
3. Add logging with print() statements
4. Make it runnable as a standalone script
5. Include comments for key steps
6. Add safety features (fail-safe, emergency stop)

Generate ONLY the Python code, no explanations. Start with imports.

PYTHON CODE:"""
    
    def _clean_code(self, raw_code, task, model):
        """Clean generated code"""
        # Remove markdown code blocks
        if "```python" in raw_code:
            raw_code = raw_code.split("```python")[1].split("```")[0].strip()
        elif "```" in raw_code:
            raw_code = raw_code.split("```")[1].split("```")[0].strip()
        
        # Ensure basic imports
        required_imports = [
            "import pyautogui",
            "import time",
            "import keyboard",
            "from datetime import datetime"
        ]
        
        for imp in required_imports:
            if imp not in raw_code:
                raw_code = f"{imp}\n" + raw_code
        
        # Add header
        header = f'''"""
🤖 AI-Generated Automation Script
Task: {task}
Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
Model: {model}
Status: Generated by Ollama AI
Instructions: Run with Python 3.8+
"""
'''
        
        return header + "\n" + raw_code
    
    def _fallback_code(self, task):
        """Generate fallback template code"""
        print("📝 Generating fallback template code...")
        
        code = f'''"""
🤖 AI-Generated Automation Script (Template)
Task: {task}
Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
Status: Template (Ollama not available)
"""

import pyautogui
import time
import keyboard
from datetime import datetime

class AutomationTask:
    def __init__(self):
        self.running = True
        pyautogui.FAILSAFE = True  # Move mouse to corner to stop
        self.setup_hotkeys()
    
    def setup_hotkeys(self):
        """Setup emergency stop hotkey"""
        keyboard.add_hotkey('esc', self.stop)
    
    def stop(self):
        """Stop the automation"""
        self.running = False
        print("🛑 Automation stopped by user (ESC pressed)")
    
    def log(self, message):
        """Log messages with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        log_msg = f"[{{timestamp}}] {{message}}"
        print(log_msg)
    
    def execute(self):
        """Main execution method - OVERRIDE THIS FOR YOUR TASK"""
        self.log(f"Starting automation: {task}")
        
        try:
            # TODO: Implement your automation logic here
            # Example steps:
            
            self.log("Step 1: Initializing...")
            time.sleep(1)
            
            self.log("Step 2: Performing actions...")
            # Example: Move mouse and click
            pyautogui.moveTo(100, 100)
            pyautogui.click()
            
            self.log("Step 3: Completing task...")
            time.sleep(1)
            
            self.log("✅ Automation completed successfully!")
            return True
            
        except Exception as e:
            self.log(f"❌ Error during automation: {{e}}")
            return False
        finally:
            keyboard.remove_hotkey('esc')
            self.log("Cleanup completed")

def main():
    """Main function"""
    print("🚀 Starting Automation Script")
    print("=" * 50)
    print(f"Task: {task}")
    print("Press ESC at any time to stop")
    print("=" * 50 + "\\n")
    
    automation = AutomationTask()
    
    if automation.execute():
        print("\\n🎉 Task completed successfully!")
        return 0
    else:
        print("\\n❌ Task failed. Check logs above.")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
'''
        
        return {
            "success": True,
            "code": code,
            "model": "template_fallback",
            "message": "Ollama not available - using template",
            "timestamp": datetime.now().isoformat(),
            "is_fallback": True
        }

# Quick test function
def quick_test():
    """Quick test of Ollama integration"""
    print("🧪 Running Ollama quick test...")
    ollama = OllamaIntegration()
    
    status = ollama.get_status()
    print(f"Status: {'✅ Available' if status['available'] else '❌ Not available'}")
    
    if status['available']:
        print(f"Models: {status['models']}")
        
        # Test with a simple task
        test_task = "Open Notepad and type 'Hello from AI'"
        print(f"\nTesting code generation: {test_task}")
        
        result = ollama.generate_code(test_task)
        
        if result["success"]:
            print(f"✅ Code generated using {result['model']}")
            print(f"📏 Code length: {len(result['code'])} chars")
            print(f"⏱️ Response time: {result.get('response_time', 0):.2f}s")
            
            # Save sample
            with open("test_generated.py", "w", encoding="utf-8") as f:
                f.write(result["code"])
            print("💾 Saved as: test_generated.py")
        else:
            print("❌ Code generation failed")
    else:
        print("⚠️ Running in fallback mode")

if __name__ == "__main__":
    quick_test()