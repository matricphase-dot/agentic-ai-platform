import uvicorn
import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("?? Starting Agentic AI Platform - Phase 2")
    print("=" * 50)
    print("Server: http://127.0.0.1:8001")
    print("Docs:   http://127.0.0.1:8001/docs")
    print("Health: http://127.0.0.1:8001/health")
    print("=" * 50)
    
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8001,
        reload=True,
        log_level="info"
    )
