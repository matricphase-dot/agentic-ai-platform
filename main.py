# main.py - COMPLETE VERSION
import os
from orchestrator import app

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    print(f"🚀 Starting Agentic AI Platform on port {port}")
    print(f"🌐 Access at: http://0.0.0.0:{port}")
    print(f"📊 Dashboard: http://0.0.0.0:{port}/")
    print(f"🔧 API Health: http://0.0.0.0:{port}/api/health")
    
    uvicorn.run(
        "orchestrator:app",
        host="0.0.0.0",
        port=port,
        log_level="info"
    )