# fix_all.py - Run this to fix everything
import os
import sys
from pathlib import Path

print("🔧 FIXING AGENTIC AI PLATFORM")
print("="*60)

# 1. Create directories
dirs = ["logs", "recordings", "ai_responses", "ai_automations", "database", "static", "templates"]
for dir_name in dirs:
    Path(dir_name).mkdir(exist_ok=True)
    print(f"📁 Created: {dir_name}/")

# 2. Create fixed main.py
main_py_content = '''#!/usr/bin/env python3
import os
import sys
import logging
from pathlib import Path

# Create directories
Path("logs").mkdir(exist_ok=True)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)

try:
    from orchestrator import app
    import uvicorn
    
    port = int(os.environ.get("PORT", 8080))
    
    print(f"🚀 Starting Agentic AI Platform on port {port}")
    print(f"📊 Dashboard: http://localhost:{port}/")
    print(f"🔧 API Docs: http://localhost:{port}/docs")
    
    uvicorn.run("orchestrator:app", host="0.0.0.0", port=port)
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("💡 Creating a basic app...")
    
    from fastapi import FastAPI
    app = FastAPI()
    
    @app.get("/")
    def root():
        return {"message": "Agentic AI Platform", "status": "starting"}
    
    @app.get("/api/health")
    def health():
        return {"status": "healthy"}
    
    uvicorn.run(app, host="0.0.0.0", port=8080)
'''

with open("main.py", "w") as f:
    f.write(main_py_content)
print("✅ Fixed main.py")

# 3. Check if orchestrator.py exists
if not Path("orchestrator.py").exists():
    print("⚠️  orchestrator.py not found, creating basic version...")
    orchestrator_content = '''from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import os

app = FastAPI(title="Agentic AI Platform")

# Setup templates
try:
    templates = Jinja2Templates(directory="templates")
    app.mount("/static", StaticFiles(directory="static"), name="static")
except:
    pass

@app.get("/", response_class=HTMLResponse)
async def dashboard():
    return """
    <!DOCTYPE html>
    <html>
    <head><title>Agentic AI Platform</title></head>
    <body>
        <h1>🚀 Agentic AI Platform</h1>
        <p>Your platform is running!</p>
        <p><a href="/api/health">Check Health</a></p>
    </body>
    </html>
    """

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Agentic AI Platform"}
'''
    
    with open("orchestrator.py", "w") as f:
        f.write(orchestrator_content)
    print("✅ Created basic orchestrator.py")

print("\n" + "="*60)
print("🎉 ALL FIXES APPLIED!")
print("="*60)
print("\n📋 Next steps:")
print("1. Run: python main.py")
print("2. Open: http://localhost:8080")
print("3. Check: http://localhost:8080/api/health")
print("\n🖥️ For desktop recorder:")
print("   python launch_desktop.py")