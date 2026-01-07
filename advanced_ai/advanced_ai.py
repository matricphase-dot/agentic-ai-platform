#!/usr/bin/env python3
"""
ADVANCED AI ENGINE - REAL OLLAMA INTEGRATION
Working AI chat with Llama3.2 models
"""

import requests
import json
import time
import sqlite3
import os
from datetime import datetime

class AIChat:
    def __init__(self):
        self.ollama_url = "http://localhost:11434"
        self.connected = False
        self.current_model = "llama3.2"
        self.db_path = "database/ai_chat.db"
        self.init_database()
        self.connect()
        print("🤖 Advanced AI Engine loaded")
    
    def init_database(self):
        """Initialize AI chat database"""
        os.makedirs("database", exist_ok=True)
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chat_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_message TEXT,
                ai_response TEXT,
                model TEXT,
                tokens_used INTEGER,
                timestamp TEXT,
                context TEXT
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS ai_models (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE,
                size TEXT,
                downloaded INTEGER DEFAULT 0,
                last_used TEXT
            )
        ''')
        
        # Insert default models
        default_models = [
            ("llama3.2", "4.1 GB", 1),
            ("llama3.2:3b", "1.8 GB", 1),
            ("mistral", "4.1 GB", 0),
            ("codellama", "3.8 GB", 0)
        ]
        
        for model in default_models:
            cursor.execute('''
                INSERT OR IGNORE INTO ai_models (name, size, downloaded) 
                VALUES (?, ?, ?)
            ''', model)
        
        conn.commit()
        conn.close()
    
    def connect(self):
        """Connect to Ollama server"""
        try:
            response = requests.get(f"{self.ollama_url}/api/tags", timeout=5)
            if response.status_code == 200:
                self.connected = True
                print("✅ Connected to Ollama server")
                return True
        except Exception as e:
            print(f"⚠️  Ollama connection failed: {e}")
            print("💡 To use AI features, install Ollama from https://ollama.ai/")
            print("💡 Then run: ollama pull llama3.2")
            self.connected = False
        return False
    
    def chat(self, prompt, model=None, context=None):
        """Send message to AI and get response"""
        if not model:
            model = self.current_model
        
        # Try to connect if not connected
        if not self.connected:
            self.connect()
            if not self.connected:
                # Fallback to dummy response if Ollama not available
                return self._fallback_response(prompt, model)
        
        try:
            payload = {
                "model": model,
                "prompt": prompt,
                "stream": False,
                "context": context
            }
            
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                
                # Save to chat history
                self.save_chat_history(
                    user_message=prompt,
                    ai_response=result.get("response", ""),
                    model=model,
                    tokens=result.get("total_duration", 0)
                )
                
                return {
                    "success": True,
                    "response": result.get("response", ""),
                    "model": model,
                    "tokens_used": result.get("eval_count", 0),
                    "total_duration": result.get("total_duration", 0),
                    "context": result.get("context")
                }
            else:
                return self._fallback_response(prompt, model)
                
        except Exception as e:
            print(f"AI Chat error: {e}")
            return self._fallback_response(prompt, model)
    
    def _fallback_response(self, prompt, model):
        """Provide fallback response when Ollama is not available"""
        fallback_responses = [
            f"I'm thinking about: '{prompt[:50]}...'. For full AI features, make sure Ollama is running.",
            f"AI response to: '{prompt[:30]}...' would appear here. Install Ollama for real AI.",
            f"Processing your request about '{prompt[:40]}...' requires Ollama to be installed.",
        ]
        
        import random
        response = random.choice(fallback_responses)
        
        # Save to history
        self.save_chat_history(prompt, response, model, 0)
        
        return {
            "success": True,
            "response": response,
            "model": model,
            "tokens_used": 0,
            "note": "Running in fallback mode. Install Ollama for full AI capabilities."
        }
    
    def save_chat_history(self, user_message, ai_response, model, tokens):
        """Save chat to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO chat_history (user_message, ai_response, model, tokens_used, timestamp)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            user_message,
            ai_response,
            model,
            tokens,
            datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
    
    def get_chat_history(self, limit=50):
        """Get chat history"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM chat_history 
            ORDER BY timestamp DESC 
            LIMIT ?
        ''', (limit,))
        
        history = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        # Reverse to show oldest first
        history.reverse()
        return history
    
    def list_models(self):
        """Get list of available models"""
        models = []
        
        if self.connected:
            try:
                response = requests.get(f"{self.ollama_url}/api/tags", timeout=5)
                if response.status_code == 200:
                    ollama_models = response.json().get("models", [])
                    for model in ollama_models:
                        models.append({
                            "name": model.get("name"),
                            "size": f"{model.get('size', 0) / 1e9:.1f} GB",
                            "digest": model.get("digest", "")[:12]
                        })
            except:
                pass
        
        # Add local database models as fallback
        if not models:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT name, size, downloaded FROM ai_models")
            for row in cursor.fetchall():
                models.append({
                    "name": row[0],
                    "size": row[1],
                    "downloaded": bool(row[2])
                })
            conn.close()
        
        return {
            "models": models,
            "connected": self.connected,
            "current_model": self.current_model,
            "ollama_url": self.ollama_url
        }
    
    def change_model(self, model_name):
        """Change current AI model"""
        self.current_model = model_name
        return {
            "success": True,
            "message": f"Model changed to {model_name}",
            "current_model": self.current_model
        }
    
    def summarize_text(self, text):
        """Summarize long text"""
        prompt = f"Please summarize the following text concisely:\n\n{text[:3000]}"
        return self.chat(prompt, self.current_model)
    
    def generate_code(self, language, task):
        """Generate code for a specific task"""
        prompt = f"Write {language} code to: {task}. Provide complete working code with comments."
        return self.chat(prompt, self.current_model)
    
    def translate_text(self, text, target_language):
        """Translate text to another language"""
        prompt = f"Translate the following text to {target_language}:\n\n{text}"
        return self.chat(prompt, self.current_model)
    
    def get_stats(self):
        """Get AI usage statistics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM chat_history")
        total_chats = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(DISTINCT model) FROM chat_history")
        models_used = cursor.fetchone()[0]
        
        cursor.execute("SELECT SUM(tokens_used) FROM chat_history")
        total_tokens = cursor.fetchone()[0] or 0
        
        cursor.execute("SELECT timestamp FROM chat_history ORDER BY timestamp DESC LIMIT 1")
        last_used = cursor.fetchone()
        
        conn.close()
        
        return {
            "total_chats": total_chats,
            "models_used": models_used,
            "total_tokens": total_tokens,
            "last_used": last_used[0] if last_used else None,
            "connected": self.connected,
            "current_model": self.current_model
        }

# Create singleton instance
ai_chat = AIChat()

if __name__ == "__main__":
    print("🧪 Testing AI Engine...")
    models = ai_chat.list_models()
    print(f"🤖 Available models: {models}")
    
    # Test chat
    response = ai_chat.chat("Hello, what can you do?")
    print(f"💬 AI Response: {response['response'][:100]}...")
    print("✅ AI Engine is ready!")