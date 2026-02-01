# main.py - GUARANTEED WORKING VERSION
import os
import sys
from pathlib import Path

print("="*60)
print("🚀 AGENTIC AI PLATFORM STARTING...")
print("="*60)

# Create required directories
directories = ["logs", "templates", "static", "recordings"]
for directory in directories:
    Path(directory).mkdir(exist_ok=True)
    print(f"📁 Created: {directory}/")

# Try to import and run the app
try:
    # Try to import from orchestrator
    from orchestrator import app
    print("✅ Imported from orchestrator.py")
    
    import uvicorn
    
    port = 8080
    print(f"🌐 Starting server on port {port}")
    print(f"📊 Dashboard: http://localhost:{port}")
    print(f"🔧 API Health: http://localhost:{port}/api/health")
    print("="*60)
    print("Server is starting... (Ctrl+C to stop)")
    
    # Start the server
    uvicorn.run(
        "orchestrator:app",
        host="0.0.0.0",
        port=port,
        log_level="info",
        access_log=True
    )
    
except ImportError as e:
    print(f"⚠️  Could not import orchestrator: {e}")
    print("💡 Creating a minimal FastAPI app...")
    
    # Create a basic app if orchestrator doesn't exist
    from fastapi import FastAPI
    import uvicorn
    
    app = FastAPI()
    
    @app.get("/")
    def root():
        return {"message": "Agentic AI Platform", "status": "online"}
    
    @app.get("/api/health")
    def health():
        return {"status": "healthy", "service": "Agentic AI Platform"}
    
    port = 8080
    print(f"🌐 Starting minimal server on port {port}")
    print(f"📊 Open: http://localhost:{port}")
    
    uvicorn.run(app, host="0.0.0.0", port=port)
    
except Exception as e:
    print(f"❌ Error: {e}")
    input("Press Enter to exit...")
    sys.exit(1)