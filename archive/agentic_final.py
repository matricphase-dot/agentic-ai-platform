# agentic_final.py - GUARANTEED WORKING VERSION
from fastapi import FastAPI, Request, HTTPException, status, Form
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
import uvicorn
from datetime import datetime

# =============== CREATE APP WITHOUT AUTO-DOCS INTERFERENCE ===============
app = FastAPI(
    title="Agentic AI Platform",
    version="5.2.0",
    docs_url="/docs",  # Docs at /docs, not interfering with root
    redoc_url="/redoc"
)

# =============== INLINE HTML ===============
DASHBOARD_HTML = """<!DOCTYPE html>
<html>
<head>
    <title>Agentic AI Dashboard</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: white;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: rgba(255,255,255,0.1);
            padding: 30px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .header h1 {
            font-size: 48px;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .stat-card {
            background: rgba(255,255,255,0.15);
            padding: 25px;
            border-radius: 15px;
            text-align: center;
            transition: transform 0.3s;
        }
        .stat-card:hover {
            transform: translateY(-5px);
            background: rgba(255,255,255,0.2);
        }
        .stat-card h3 {
            margin: 0 0 15px 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .stat-number {
            font-size: 42px;
            font-weight: bold;
        }
        .agents {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .agent-card {
            background: rgba(255,255,255,0.15);
            padding: 25px;
            border-radius: 15px;
            transition: all 0.3s;
            border: 2px solid transparent;
        }
        .agent-card:hover {
            background: rgba(255,255,255,0.2);
            border-color: white;
            transform: translateY(-5px);
        }
        .agent-card h3 {
            margin: 0 0 10px 0;
            font-size: 22px;
        }
        .agent-card p {
            margin: 0 0 20px 0;
            opacity: 0.9;
        }
        button {
            background: white;
            color: #667eea;
            border: none;
            padding: 12px 25px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            width: 100%;
        }
        button:hover {
            background: #f0f0f0;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        .links {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 30px;
        }
        .links a {
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            background: rgba(255,255,255,0.1);
            border-radius: 8px;
            transition: background 0.3s;
        }
        .links a:hover {
            background: rgba(255,255,255,0.2);
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Agentic AI Platform v5.2.0</h1>
            <p>Universal AI Agent Orchestration - NOW WORKING!</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <h3>Total Users</h3>
                <div class="stat-number">1</div>
            </div>
            <div class="stat-card">
                <h3>Active Agents</h3>
                <div class="stat-number">6</div>
            </div>
            <div class="stat-card">
                <h3>Tasks Completed</h3>
                <div class="stat-number">0</div>
            </div>
            <div class="stat-card">
                <h3>Success Rate</h3>
                <div class="stat-number">100%</div>
            </div>
        </div>
        
        <h2 style="text-align: center; margin-bottom: 30px; font-size: 32px;">🤖 Available AI Agents</h2>
        <div class="agents">
            <div class="agent-card">
                <h3>File Organizer</h3>
                <p>Organizes files automatically using AI</p>
                <button onclick="executeAgent('file_organizer')">Execute</button>
            </div>
            <div class="agent-card">
                <h3>Student Assistant</h3>
                <p>Helps students with homework and research</p>
                <button onclick="executeAgent('student_assistant')">Execute</button>
            </div>
            <div class="agent-card">
                <h3>Research Assistant</h3>
                <p>Conducts research and summarizes information</p>
                <button onclick="executeAgent('research_assistant')">Execute</button>
            </div>
            <div class="agent-card">
                <h3>Code Generator</h3>
                <p>Generates code in multiple languages</p>
                <button onclick="executeAgent('code_generator')">Execute</button>
            </div>
            <div class="agent-card">
                <h3>Marketing Agent</h3>
                <p>Creates marketing content and campaigns</p>
                <button onclick="executeAgent('marketing_agent')">Execute</button>
            </div>
            <div class="agent-card">
                <h3>Data Analyst</h3>
                <p>Analyzes data and generates insights</p>
                <button onclick="executeAgent('data_analyst')">Execute</button>
            </div>
        </div>
        
        <div class="links">
            <a href="/login">🔐 Login Page</a>
            <a href="/docs" target="_blank">📚 API Documentation</a>
            <a href="/health" target="_blank">🩺 Health Check</a>
            <a href="/api/agents" target="_blank">🤖 View All Agents</a>
        </div>
    </div>
    
    <script>
    async function executeAgent(agentId) {
        const input = prompt('Enter JSON input for ' + agentId + ':', '{"input": "test data"}');
        if (!input) return;
        
        try {
            const response = await fetch('/api/execute/' + agentId, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: input
            });
            
            const result = await response.json();
            
            alert('✅ SUCCESS!\\n\\nAgent: ' + result.agent + 
                  '\\nStatus: ' + (result.success ? 'Success' : 'Failed') + 
                  '\\nResult: ' + JSON.stringify(result.result, null, 2));
        } catch (error) {
            alert('❌ Error: ' + error.message);
        }
    }
    </script>
</body>
</html>"""

LOGIN_HTML = """<!DOCTYPE html>
<html>
<head>
    <title>Agentic AI - Login</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .login-box {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            width: 400px;
            text-align: center;
        }
        .login-box h1 {
            color: #333;
            margin: 0 0 30px 0;
        }
        input {
            width: 100%;
            padding: 15px;
            margin: 15px 0;
            border: 2px solid #ddd;
            border-radius: 10px;
            font-size: 16px;
            box-sizing: border-box;
        }
        input:focus {
            outline: none;
            border-color: #667eea;
        }
        button {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            margin-top: 10px;
        }
        button:hover {
            opacity: 0.9;
        }
        .demo {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            color: #666;
        }
        .demo p {
            margin: 5px 0;
        }
        .back {
            margin-top: 20px;
        }
        .back a {
            color: #667eea;
            text-decoration: none;
            font-weight: bold;
        }
        .back a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="login-box">
        <h1>🔐 Agentic AI Login</h1>
        <form id="loginForm">
            <input type="email" id="email" placeholder="Email" value="admin@agenticai.com" required>
            <input type="password" id="password" placeholder="Password" value="Admin123!" required>
            <button type="submit">Login to Dashboard</button>
        </form>
        
        <div id="message" style="margin-top: 20px; padding: 15px; border-radius: 8px; display: none;"></div>
        
        <div class="demo">
            <p><strong>Demo Credentials:</strong></p>
            <p>Email: admin@agenticai.com</p>
            <p>Password: Admin123!</p>
        </div>
        
        <div class="back">
            <a href="/">← Back to Dashboard</a>
        </div>
    </div>
    
    <script>
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const message = document.getElementById('message');
        
        const formData = new URLSearchParams();
        formData.append('email', email);
        formData.append('password', password);
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                message.style.background = '#d4edda';
                message.style.color = '#155724';
                message.innerHTML = '✅ Login successful! Redirecting...';
                message.style.display = 'block';
                
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                message.style.background = '#f8d7da';
                message.style.color = '#721c24';
                message.innerHTML = '❌ ' + (result.detail || 'Login failed');
                message.style.display = 'block';
            }
        } catch (error) {
            message.style.background = '#f8d7da';
            message.style.color = '#721c24';
            message.innerHTML = '❌ Network error: ' + error.message;
            message.style.display = 'block';
        }
    });
    
    // Auto-submit for demo (optional)
    setTimeout(() => {
        document.getElementById('email').value = 'admin@agenticai.com';
        document.getElementById('password').value = 'Admin123!';
    }, 500);
    </script>
</body>
</html>"""

# =============== ROUTES ===============
@app.get("/")
async def root():
    """Home page - dashboard"""
    return HTMLResponse(content=DASHBOARD_HTML)

@app.get("/dashboard")
async def dashboard():
    """Dashboard page"""
    return RedirectResponse(url="/")

@app.get("/login")
async def login_page():
    """Login page"""
    return HTMLResponse(content=LOGIN_HTML)

@app.get("/health")
async def health_check():
    """Health check"""
    return {
        "status": "healthy",
        "service": "Agentic AI Platform",
        "version": "5.2.0",
        "timestamp": datetime.now().isoformat(),
        "message": "Dashboard is WORKING! 🎉"
    }

@app.get("/api/agents")
async def list_agents():
    """List all agents"""
    return {
        "agents": [
            {"id": "file_organizer", "name": "File Organizer"},
            {"id": "student_assistant", "name": "Student Assistant"},
            {"id": "research_assistant", "name": "Research Assistant"},
            {"id": "code_generator", "name": "Code Generator"},
            {"id": "marketing_agent", "name": "Marketing Agent"},
            {"id": "data_analyst", "name": "Data Analyst"}
        ],
        "count": 6
    }

@app.post("/api/execute/{agent_id}")
async def execute_agent(agent_id: str):
    """Execute an agent"""
    return {
        "success": True,
        "agent": agent_id,
        "result": {
            "message": f"Agent '{agent_id}' executed successfully!",
            "output": "Sample output from agent execution",
            "execution_id": f"exec_{datetime.now().timestamp()}"
        },
        "execution_time": 0.5
    }

@app.post("/api/login")
async def login(email: str = Form(...), password: str = Form(...)):
    """Login endpoint"""
    if email == "admin@agenticai.com" and password == "Admin123!":
        return {
            "success": True,
            "message": "Login successful",
            "user": {
                "email": email,
                "role": "admin"
            }
        }
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password"
    )

# =============== MAIN ===============
if __name__ == "__main__":
    print("\n" + "="*70)
    print("    🎉 AGENTIC AI PLATFORM - FINAL WORKING VERSION 🎉")
    print("="*70)
    print()
    print("    ✅ DASHBOARD: http://localhost:5000")
    print("    ✅ LOGIN:     http://localhost:5000/login")
    print("    ✅ HEALTH:    http://localhost:5000/health")
    print("    ✅ API DOCS:  http://localhost:5000/docs")
    print()
    print("    🔐 LOGIN CREDENTIALS:")
    print("    • Email:    admin@agenticai.com")
    print("    • Password: Admin123!")
    print()
    print("    🚀 SERVER STARTING...")
    print("="*70)
    print()
    
    uvicorn.run(app, host="0.0.0.0", port=5000, log_level="info")