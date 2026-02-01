import requests
import json
import time
from typing import List, Dict, Optional

class AdvancedAI:
    def __init__(self):
        self.base_url = "http://localhost:11434"
        self.current_model = "llama3.2:latest"
        self.available_models = []
        self.is_connected = False
        self.max_retries = 3
        self.retry_delay = 2
    
    def connect(self) -> bool:
        """Connect to Ollama server"""
        for attempt in range(self.max_retries):
            try:
                response = requests.get(f"{self.base_url}/api/tags", timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    self.available_models = [model['name'] for model in data.get('models', [])]
                    self.is_connected = True
                    
                    if self.available_models:
                        # Set default model
                        if self.current_model not in self.available_models:
                            self.current_model = self.available_models[0]
                    
                    print(f"✅ Connected to Ollama. Models: {self.available_models}")
                    return True
                else:
                    print(f"⚠️ Attempt {attempt + 1}/{self.max_retries}: Ollama responded with status {response.status_code}")
            
            except requests.exceptions.ConnectionError:
                print(f"⚠️ Attempt {attempt + 1}/{self.max_retries}: Cannot connect to Ollama at {self.base_url}")
            
            except Exception as e:
                print(f"⚠️ Attempt {attempt + 1}/{self.max_retries}: Error connecting to Ollama: {e}")
            
            if attempt < self.max_retries - 1:
                time.sleep(self.retry_delay)
        
        print("❌ Failed to connect to Ollama after all attempts")
        self.is_connected = False
        return False
    
    def get_available_models(self) -> List[str]:
        """Get list of available models"""
        if not self.is_connected:
            self.connect()
        
        if not self.available_models:
            return ["llama3.2:latest", "llama3.2:3b"]
        
        return self.available_models
    
    def set_model(self, model_name: str) -> bool:
        """Set the current model to use"""
        if model_name in self.get_available_models():
            self.current_model = model_name
            print(f"✅ Model set to: {model_name}")
            return True
        else:
            print(f"❌ Model {model_name} not available")
            return False
    
    def generate_text(self, prompt: str, model: Optional[str] = None) -> Dict:
        """Generate text using the AI model"""
        if not self.is_connected:
            self.connect()
        
        if not self.is_connected:
            return {
                "response": "AI service is not available. Please ensure Ollama is running.",
                "model": model or self.current_model,
                "error": True
            }
        
        model_to_use = model or self.current_model
        
        try:
            payload = {
                "model": model_to_use,
                "prompt": prompt,
                "stream": False
            }
            
            response = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "response": result.get('response', ''),
                    "model": model_to_use,
                    "tokens": result.get('total_duration', 0),
                    "error": False
                }
            else:
                return {
                    "response": f"Error from Ollama: {response.status_code}",
                    "model": model_to_use,
                    "error": True
                }
        
        except Exception as e:
            print(f"Error generating text: {e}")
            return {
                "response": f"Error: {str(e)}",
                "model": model_to_use,
                "error": True
            }
    
    def chat(self, messages: List[Dict], model: Optional[str] = None) -> Dict:
        """Chat with the AI model"""
        if not self.is_connected:
            self.connect()
        
        if not self.is_connected:
            return {
                "message": {
                    "role": "assistant",
                    "content": "AI service is not available. Please ensure Ollama is running."
                },
                "model": model or self.current_model,
                "error": True
            }
        
        model_to_use = model or self.current_model
        
        try:
            payload = {
                "model": model_to_use,
                "messages": messages,
                "stream": False
            }
            
            response = requests.post(
                f"{self.base_url}/api/chat",
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "message": result.get('message', {}),
                    "model": model_to_use,
                    "error": False
                }
            else:
                return {
                    "message": {
                        "role": "assistant",
                        "content": f"Error from Ollama: {response.status_code}"
                    },
                    "model": model_to_use,
                    "error": True
                }
        
        except Exception as e:
            print(f"Error in chat: {e}")
            return {
                "message": {
                    "role": "assistant",
                    "content": f"Error: {str(e)}"
                },
                "model": model_to_use,
                "error": True
            }
    
    def get_model_info(self, model_name: str) -> Dict:
        """Get information about a specific model"""
        try:
            response = requests.get(f"{self.base_url}/api/show", params={"name": model_name})
            if response.status_code == 200:
                return response.json()
            return {"error": f"Model {model_name} not found"}
        except:
            return {"error": "Failed to get model info"}

# Create instance for import
advanced_ai = AdvancedAI()
