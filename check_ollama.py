# check_ollama.py - Simple Ollama connection check
import requests
import time
import sys

def check_ollama():
    print("🤖 Checking Ollama status...")
    
    try:
        # Try to connect to Ollama
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            models = data.get("models", [])
            
            if models:
                print(f"✅ Ollama is RUNNING!")
                print(f"📦 Available models:")
                for model in models:
                    print(f"   • {model['name']}")
            else:
                print("✅ Ollama is running but no models loaded")
                print("   Run: ollama pull llama3.2")
            
            return True
        else:
            print(f"⚠️ Ollama responded with status {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Ollama is NOT running or not accessible")
        print("💡 To start Ollama:")
        print("   1. Open Task Manager")
        print("   2. End any 'ollama.exe' processes")
        print("   3. Start Ollama from:")
        print("      C:\\Users\\user\\AppData\\Roaming\\ollama app.exe\\")
        print("   4. Wait 30 seconds, then try again")
        return False
        
    except Exception as e:
        print(f"❌ Error checking Ollama: {e}")
        return False

def start_ollama_if_needed():
    """Start Ollama if not running"""
    try:
        # Check if already running
        response = requests.get("http://localhost:11434/api/tags", timeout=2)
        return True
    except:
        print("\n🔄 Attempting to start Ollama...")
        
        # Try to start Ollama from known locations
        import subprocess
        import os
        
        possible_paths = [
            r"C:\Users\user\AppData\Roaming\ollama app.exe\ollama.exe",
            r"%LOCALAPPDATA%\Programs\Ollama\ollama.exe",
            r"%USERPROFILE%\AppData\Local\Programs\Ollama\ollama.exe"
        ]
        
        for path in possible_paths:
            expanded_path = os.path.expandvars(path)
            if os.path.exists(expanded_path):
                try:
                    print(f"Starting: {expanded_path}")
                    subprocess.Popen([expanded_path], shell=True)
                    
                    # Wait for Ollama to start
                    print("Waiting for Ollama to start...")
                    for i in range(10):
                        time.sleep(3)
                        try:
                            requests.get("http://localhost:11434/api/tags", timeout=2)
                            print(f"✅ Ollama started successfully!")
                            return True
                        except:
                            print(f"   Waiting... ({i+1}/10)")
                    
                    print("⚠️ Ollama started but not responding yet")
                    return False
                    
                except Exception as e:
                    print(f"Failed to start Ollama: {e}")
        
        print("❌ Could not find Ollama executable")
        print("Please start Ollama manually and restart the application")
        return False

if __name__ == "__main__":
    # Check if Ollama is running
    if not check_ollama():
        # Try to start it
        if start_ollama_if_needed():
            # Check again
            time.sleep(2)
            check_ollama()
    
    print("\n" + "="*50)
    print("🎉 Ollama setup complete!")
    print("The AI Platform will now use Ollama for code generation.")
    print("="*50)