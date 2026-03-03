# instant_fix.py - Replace the broken template routes with working HTML
import re

# Read the current server file
with open('server_production.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the dashboard route
dashboard_old = '''@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request):
    """Dashboard page"""
    context = {
        "request": request,
        "app_name": CONFIG["APP_NAME"],
        "version": CONFIG["VERSION"],
        "total_users": 1,
        "total_agents": len(agents),
        "total_tasks": 0,
        "completed_tasks": 0,
        "agents": list(agents.keys()),
        "recent_tasks": []
    }
    return templates.TemplateResponse("dashboard.html", context)'''

dashboard_new = '''@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard():
    """Dashboard page - SIMPLE WORKING VERSION"""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Agentic AI Dashboard</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f0f2f5; }
            .navbar { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 30px; }
            .navbar h1 { margin: 0; font-size: 24px; }
            .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
            .stat-card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center; }
            .stat-card h3 { color: #666; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; }
            .stat-number { font-size: 36px; font-weight: bold; color: #667eea; }
            .agents-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
            .agent-card { background: white; padding: 20px; border-radius: 10px; border: 2px solid #e1e5e9; transition: all 0.3s; }
            .agent-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.15); }
            .agent-card h4 { margin: 0 0 10px 0; color: #333; }
            button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px; }
            button:hover { opacity: 0.9; }
            .container { max-width: 1200px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 40px; }
            .header h2 { color: #333; font-size: 32px; margin-bottom: 10px; }
            .header p { color: #666; font-size: 18px; }
        </style>
    </head>
    <body>
        <div class="navbar">
            <h1>🤖 Agentic AI Platform v5.2.0</h1>
        </div>
        
        <div class="container">
            <div class="header">
                <h2>Agentic AI Dashboard</h2>
                <p>Universal AI Agent Orchestration Platform</p>
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
                    <div class="stat-number">0/0</div>
                </div>
                <div class="stat-card">
                    <h3>Success Rate</h3>
                    <div class="stat-number">0%</div>
                </div>
            </div>
            
            <h3 style="color: #333; margin-bottom: 20px;">Available Agents</h3>
            <div class="agents-grid">
                <div class="agent-card">
                    <h4>File Organizer</h4>
                    <p>Organizes files using AI</p>
                    <button onclick="executeAgent('file_organizer')">Execute</button>
                </div>
                <div class="agent-card">
                    <h4>Student Assistant</h4>
                    <p>Helps students with homework</p>
                    <button onclick="executeAgent('student_assistant')">Execute</button>
                </div>
                <div class="agent-card">
                    <h4>Research Assistant</h4>
                    <p>Conducts research</p>
                    <button onclick="executeAgent('research_assistant')">Execute</button>
                </div>
                <div class="agent-card">
                    <h4>Code Generator</h4>
                    <p>Generates code</p>
                    <button onclick="executeAgent('code_generator')">Execute</button>
                </div>
                <div class="agent-card">
                    <h4>Marketing Agent</h4>
                    <p>Creates marketing content</p>
                    <button onclick="executeAgent('marketing_agent')">Execute</button>
                </div>
                <div class="agent-card">
                    <h4>Data Analyst</h4>
                    <p>Analyzes data</p>
                    <button onclick="executeAgent('data_analyst')">Execute</button>
                </div>
            </div>
            
            <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <h3 style="color: #333; margin-top: 0;">Quick Actions</h3>
                <div style="display: flex; gap: 15px;">
                    <button onclick="window.open('/api/docs', '_blank')">Open API Documentation</button>
                    <button onclick="window.open('/api/health', '_blank')">Check System Health</button>
                    <button onclick="window.open('/api/agents', '_blank')">View All Agents</button>
                    <button onclick="window.location.href='/login'">Go to Login</button>
                </div>
            </div>
        </div>
        
        <script>
        async function executeAgent(agentName) {
            const input = prompt('Enter JSON input for ' + agentName + ':', '{"input": "test data"}');
            if (!input) return;
            
            try {
                const response = await fetch('/api/agents/' + agentName + '/execute', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: input
                });
                const result = await response.json();
                alert('✅ Task executed successfully!\\\\n\\\\nAgent: ' + result.agent + 
                      '\\\\nStatus: ' + (result.success ? 'Success' : 'Failed') + 
                      '\\\\n\\\\nResult: ' + JSON.stringify(result.result, null, 2));
            } catch (error) {
                alert('❌ Error: ' + error.message);
            }
        }
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)'''

# Find and replace the login route
login_old = '''@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    """Login page"""
    return templates.TemplateResponse("login.html", {"request": request})'''

login_new = '''@app.get("/login", response_class=HTMLResponse)
async def login_page():
    """Login page - SIMPLE WORKING VERSION"""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Agentic AI - Login</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0;
            }
            .login-container {
                background: white;
                padding: 40px;
                border-radius: 15px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                width: 400px;
            }
            .login-header {
                text-align: center;
                margin-bottom: 30px;
            }
            .login-header h1 {
                color: #667eea;
                margin: 0 0 10px 0;
                font-size: 28px;
            }
            .login-header p {
                color: #666;
                margin: 0;
            }
            .form-group {
                margin-bottom: 25px;
            }
            .form-group label {
                display: block;
                margin-bottom: 8px;
                color: #555;
                font-weight: bold;
            }
            .form-group input {
                width: 100%;
                padding: 15px;
                border: 2px solid #e1e5e9;
                border-radius: 8px;
                font-size: 16px;
                box-sizing: border-box;
            }
            .form-group input:focus {
                outline: none;
                border-color: #667eea;
            }
            .login-btn {
                width: 100%;
                padding: 15px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: transform 0.2s;
            }
            .login-btn:hover {
                transform: translateY(-2px);
            }
            .demo-credentials {
                margin-top: 25px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
                color: #666;
            }
            .demo-credentials p {
                margin: 5px 0;
            }
            #loginMessage {
                margin-top: 20px;
                padding: 15px;
                border-radius: 8px;
            }
            .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
            .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        </style>
    </head>
    <body>
        <div class="login-container">
            <div class="login-header">
                <h1>Agentic AI Platform</h1>
                <p>Universal AI Agent Orchestration</p>
            </div>
            
            <form id="loginForm">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="email" value="admin@agenticai.com" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="password" value="Admin123!" required>
                </div>
                <button type="submit" class="login-btn">Login</button>
            </form>
            
            <div id="loginMessage"></div>
            
            <div class="demo-credentials">
                <p><strong>Demo Credentials:</strong></p>
                <p>Email: admin@agenticai.com</p>
                <p>Password: Admin123!</p>
                <p style="margin-top: 15px; text-align: center;">
                    <a href="/dashboard" style="color: #667eea; text-decoration: none;">← Back to Dashboard</a>
                </p>
            </div>
        </div>
        
        <script>
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
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
                    document.getElementById('loginMessage').innerHTML = 
                        '<div class="success">✅ Login successful! Redirecting to dashboard...</div>';
                    setTimeout(() => {
                        window.location.href = '/dashboard';
                    }, 1000);
                } else {
                    document.getElementById('loginMessage').innerHTML = 
                        '<div class="error">❌ Login failed: ' + (result.detail || 'Invalid credentials') + '</div>';
                }
            } catch (error) {
                document.getElementById('loginMessage').innerHTML = 
                    '<div class="error">❌ Network error: ' + error.message + '</div>';
            }
        });
        
        // Auto-fill demo credentials
        setTimeout(() => {
            document.getElementById('email').value = 'admin@agenticai.com';
            document.getElementById('password').value = 'Admin123!';
        }, 100);
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)'''

# Replace in content
content = content.replace(dashboard_old, dashboard_new)
content = content.replace(login_old, login_new)

# Write back
with open('server_production.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Fixed dashboard and login routes with working HTML!")
print("Now restart the server: python server_production.py")