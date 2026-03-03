# backend/start_backend.py - Simple starter
import uvicorn
from main_fixed import app

if __name__ == "__main__":
    port = 8001  # Use 8001 to avoid conflicts
    print(f"🚀 Starting Agentic AI Platform on port {port}...")
    print(f"📚 API Documentation: http://localhost:{port}/docs")
    print(f"🔗 Health Check: http://localhost:{port}/health")
    print("💡 Note: Using SQLite database for testing")
    print("   Update .env with Render PostgreSQL URL when ready")
    uvicorn.run(app, host="0.0.0.0", port=port)
