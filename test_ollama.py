# test_ollama.py - Test Ollama connection
import requests
import time
import sys

def test_ollama():
    print("🧪 Testing Ollama connection...")
    
    # Try multiple times
    for attempt in range(5):
        try:
            print(f"  Attempt {attempt + 1}/5...")
            response = requests.get("http://localhost:11434/api/tags", timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                models = data.get("models", [])
                
                if models:
                    print(f"✅ SUCCESS! Ollama is running!")
                    print(f"📦 Available models:")
                    for model in models:
                        print(f"   • {model['name']}")
                    return True
                else:
                    print("⚠️ Ollama running but no models loaded")
                    print("   You can download models with: ollama pull llama3.2")
                    return True
            else:
                print(f"  Got HTTP {response.status_code}, retrying...")
                
        except requests.exceptions.ConnectionError:
            if attempt < 4:
                print(f"  Connection failed, waiting 3 seconds...")
                time.sleep(3)
            else:
                print("❌ FAILED: Could not connect to Ollama after 5 attempts")
                return False
        except Exception as e:
            print(f"❌ Error: {e}")
            return False
    
    return False

def check_ollama_installation():
    """Check if Ollama is installed"""
    print("\n🔍 Checking Ollama installation...")
    
    import os
    possible_paths = [
        r"C:\Users\user\AppData\Roaming\ollama app.exe\ollama.exe",
        r"%USERPROFILE%\AppData\Local\Programs\Ollama\ollama.exe",
        r"C:\Program Files\Ollama\ollama.exe",
        r"%LOCALAPPDATA%\Programs\Ollama\ollama.exe"
    ]
    
    found = False
    for path in possible_paths:
        expanded_path = os.path.expandvars(path)
        if os.path.exists(expanded_path):
            print(f"✅ Found Ollama at: {expanded_path}")
            found = True
            return expanded_path
    
    if not found:
        print("❌ Ollama not found in standard locations")
        return None

def main():
    print("=" * 60)
    print("🤖 OLLAMA DIAGNOSTIC TOOL")
    print("=" * 60)
    
    # Check installation
    ollama_path = check_ollama_installation()
    
    if not ollama_path:
        print("\n💡 SOLUTION:")
        print("1. Download Ollama from: https://ollama.com/download/windows")
        print("2. Run the installer")
        print("3. Restart this script")
        return
    
    # Test connection
    print("\n" + "=" * 60)
    if test_ollama():
        print("\n✅ Ollama is ready to use!")
        print("   You can now run: python server.py")
    else:
        print("\n❌ Ollama is not responding")
        print("\n💡 TROUBLESHOOTING:")
        print("1. Open Task Manager")
        print("2. Check if 'ollama.exe' is running")
        print("3. If not, start it from:", ollama_path)
        print("4. Wait 30 seconds, then try again")
    
    print("=" * 60)

if __name__ == "__main__":
    main()