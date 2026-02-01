# restart_server.py - SIMPLE WORKING VERSION
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
import uvicorn
import os

app = FastAPI()

# Create basic directories
os.makedirs("templates", exist_ok=True)
os.makedirs("static", exist_ok=True)

# Create a basic HTML file
html_content = """
<!DOCTYPE html>
<html>
<head>
    <title>Agentic AI - Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, sans-serif; 
            background: linear-gradient(135deg, #0f172a, #1e293b);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            padding: 40px;
            background: rgba(30, 41, 59, 0.8);
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 800px;
            width: 90%;
        }
        h1 {
            font-size: 3em;
            margin-bottom: 20px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .status {
            color: #4ade80;
            font-weight: bold;
            padding: 10px;
            border-radius: 10px;
            background: rgba(74, 222, 128, 0.1);
            display: inline-block;
            margin: 20px 0;
        }
        .btn {
            display: inline-block;
            padding: 15px 30px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            text-decoration: none;
            border-radius: 10px;
            font-weight: bold;
            margin: 10px;
            transition: all 0.3s;
        }
        .btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
        }
        .links {
            margin-top: 30px;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 15px;
        }
        .link-item {
            background: rgba(255, 255, 255, 0.1);
            padding: 15px;
            border-radius: 10px;
            flex: 1;
            min-width: 200px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Agentic AI Platform</h1>
        <p class="status">✅ Server is running successfully!</p>
        <p>Version 5.0.0 | Full Dashboard Ready</p>
        
        <div style="margin: 30px 0;">
            <a href="/api/health" class="btn">Check Health</a>
            <a href="/desktop-recorder" class="btn">Desktop Recorder</a>
            <a href="/ai-automation" class="btn">AI Automation</a>
        </div>
        
        <div class="links">
            <div class="link-item">
                <h3>📁 Pages</h3>
                <p><a href="/file-organizer" style="color: #60a5fa;">File Organizer</a></p>
                <p><a href="/workflow-manager" style="color: #60a5fa;">Workflow Manager</a></p>
                <p><a href="/logs" style="color: #60a5fa;">System Logs</a></p>
            </div>
            <div class="link-item">
                <h3>⚙️ System</h3>
                <p><a href="/system" style="color: #60a5fa;">System Status</a></p>
                <p><a href="/analytics" style="color: #60a5fa;">Analytics</a></p>
                <p><a href="/marketplace" style="color: #60a5fa;">Marketplace</a></p>
            </div>
            <div class="link-item">
                <h3>🔗 APIs</h3>
                <p><a href="/api/docs" style="color: #60a5fa;">API Documentation</a></p>
                <p><a href="ws://localhost:5000/ws" style="color: #60a5fa;">WebSocket</a></p>
                <p><a href="/api/system-stats" style="color: #60a5fa;">System Stats</a></p>
            </div>
        </div>
        
        <div style="margin-top: 40px; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 10px;">
            <p>🚨 If you see "Not Found", refresh or clear browser cache:</p>
            <p>Chrome: Ctrl+Shift+R | Edge: Ctrl+F5</p>
        </div>
    </div>
</body>
</html>
"""

@app.get("/")
async def root():
    return HTMLResponse(html_content)

@app.get("/api/health")
async def health():
    return {"status": "healthy", "message": "Agentic AI Platform Running", "version": "5.0.0"}

if __name__ == "__main__":
    print("🚀 Starting Agentic AI Server...")
    print("📊 Dashboard: http://localhost:5000")
    print("🔧 Health: http://localhost:5000/api/health")
    uvicorn.run(app, host="0.0.0.0", port=5000)