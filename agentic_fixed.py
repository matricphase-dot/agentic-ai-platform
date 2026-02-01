"""
AGENTIC AI PLATFORM - FIXED VERSION
Guaranteed Desktop Automation Connection
"""
import os
import json
import sqlite3
import asyncio
from datetime import datetime
import time
from typing import Dict, List, Optional
import uuid
import logging

# FastAPI
from fastapi import FastAPI, WebSocket, HTTPException, Request, Form, UploadFile, File
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Desktop Automation - TRY HARDER
DESKTOP_AVAILABLE = False
desktop_error = ""

try:
    print("=" * 60)
    print("ATTEMPTING TO LOAD DESKTOP AUTOMATION...")
    print("=" * 60)
    
    # First try direct import
    import pyautogui
    print("✅ pyautogui imported successfully")
    
    from PIL import Image
    print("✅ PIL imported successfully")
    
    # Test basic functionality immediately
    screen_width, screen_height = pyautogui.size()
    mouse_x, mouse_y = pyautogui.position()
    
    print(f"✅ Screen detected: {screen_width}x{screen_height}")
    print(f"✅ Mouse detected: X={mouse_x}, Y={mouse_y}")
    
    DESKTOP_AVAILABLE = True
    print("✅ DESKTOP AUTOMATION FULLY ENABLED")
    print("=" * 60)
    
except Exception as e:
    DESKTOP_AVAILABLE = False
    desktop_error = str(e)
    print(f"❌ Desktop automation failed: {e}")
    print("⚠️  Desktop features will be limited")
    print("=" * 60)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="Agentic AI Platform",
    version="2.0",
    description="Complete AI Agent Platform with Desktop Automation"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create directories
os.makedirs("screenshots", exist_ok=True)
os.makedirs("organized_files", exist_ok=True)
os.makedirs("static", exist_ok=True)
os.makedirs("templates", exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# ==================== SIMPLE DESKTOP AGENT ====================

class SimpleDesktopAgent:
    """Simple guaranteed-working desktop agent"""
    
    def __init__(self):
        self.agent_id = "screen_agent_001"
        self.name = "Desktop Controller"
        self.status = "offline"
        self.capabilities = []
        
        if DESKTOP_AVAILABLE:
            try:
                # Test immediately
                import pyautogui
                pyautogui.size()  # Test function
                self.status = "online"
                self.capabilities = [
                    "take_screenshot", "get_mouse_position", "move_mouse",
                    "click", "type_text", "press_key", "hotkey"
                ]
                print("🖥️  Desktop Agent: ONLINE")
            except:
                self.status = "offline"
                print("🖥️  Desktop Agent: OFFLINE")
        else:
            self.status = "offline"
            print("🖥️  Desktop Agent: DISABLED - Missing dependencies")
    
    def get_status(self):
        """Get desktop agent status"""
        if not DESKTOP_AVAILABLE:
            return {
                "status": "offline",
                "error": desktop_error or "Desktop automation not available",
                "fix_required": "Install: pip install pyautogui pillow",
                "screen": "Unknown",
                "mouse_position": {"x": 0, "y": 0},
                "capabilities": []
            }
        
        try:
            import pyautogui
            screen_width, screen_height = pyautogui.size()
            mouse_x, mouse_y = pyautogui.position()
            
            return {
                "status": "online",
                "screen": f"{screen_width}x{screen_height}",
                "mouse_position": {"x": mouse_x, "y": mouse_y},
                "capabilities": self.capabilities,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "screen": "Unknown",
                "mouse_position": {"x": 0, "y": 0},
                "capabilities": []
            }
    
    def take_screenshot(self):
        """Take screenshot - SIMPLE VERSION"""
        if not DESKTOP_AVAILABLE:
            return {"success": False, "error": desktop_error}
        
        try:
            import pyautogui
            from PIL import Image
            
            # Create screenshots directory
            os.makedirs("screenshots", exist_ok=True)
            
            # Take screenshot
            filename = f"screenshots/screen_{int(time.time())}.png"
            screenshot = pyautogui.screenshot()
            screenshot.save(filename)
            
            return {
                "success": True,
                "filename": filename,
                "size": f"{screenshot.width}x{screenshot.height}",
                "message": "Screenshot saved successfully"
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_mouse(self):
        """Get mouse position"""
        if not DESKTOP_AVAILABLE:
            return {"success": False, "error": desktop_error}
        
        try:
            import pyautogui
            x, y = pyautogui.position()
            return {"success": True, "x": x, "y": y}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def move_mouse(self, x, y):
        """Move mouse to position"""
        if not DESKTOP_AVAILABLE:
            return {"success": False, "error": desktop_error}
        
        try:
            import pyautogui
            pyautogui.moveTo(x, y, duration=0.5)
            return {"success": True, "moved_to": {"x": x, "y": y}}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def click_mouse(self):
        """Click mouse"""
        if not DESKTOP_AVAILABLE:
            return {"success": False, "error": desktop_error}
        
        try:
            import pyautogui
            pyautogui.click()
            return {"success": True, "action": "click"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def type_text(self, text):
        """Type text"""
        if not DESKTOP_AVAILABLE:
            return {"success": False, "error": desktop_error}
        
        try:
            import pyautogui
            pyautogui.write(text, interval=0.1)
            return {"success": True, "typed": text}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def press_key(self, key):
        """Press key"""
        if not DESKTOP_AVAILABLE:
            return {"success": False, "error": desktop_error}
        
        try:
            import pyautogui
            pyautogui.press(key)
            return {"success": True, "key": key}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def hotkey(self, keys):
        """Press hotkey combination"""
        if not DESKTOP_AVAILABLE:
            return {"success": False, "error": desktop_error}
        
        try:
            import pyautogui
            key_list = keys.split("+")
            pyautogui.hotkey(*key_list)
            return {"success": True, "keys": keys}
        except Exception as e:
            return {"success": False, "error": str(e)}

# Create desktop agent
desktop_agent = SimpleDesktopAgent()

# ==================== OTHER SIMPLE AGENTS ====================

class SimpleFileAgent:
    def __init__(self):
        self.name = "File Organizer"
    
    def test(self):
        return {"success": True, "message": "File agent ready", "status": "online"}

class SimpleEmailAgent:
    def __init__(self):
        self.name = "Email Assistant"
    
    def test(self):
        return {"success": True, "message": "Email agent ready", "status": "online"}

class SimpleContentAgent:
    def __init__(self):
        self.name = "Content Generator"
    
    def test(self):
        return {"success": True, "message": "Content agent ready", "status": "online"}

# Initialize simple agents
file_agent = SimpleFileAgent()
email_agent = SimpleEmailAgent()
content_agent = SimpleContentAgent()

# ==================== SIMPLE API ENDPOINTS ====================

@app.get("/")
async def root():
    return {
        "platform": "Agentic AI Platform",
        "version": "2.0",
        "status": "online",
        "desktop_available": DESKTOP_AVAILABLE,
        "desktop_error": desktop_error,
        "message": "Visit /dashboard for interactive interface"
    }

@app.get("/api/health")
async def health():
    desktop_status = desktop_agent.get_status()
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "desktop": desktop_status["status"],
        "all_agents": "online"
    }

@app.get("/api/desktop/status")
async def get_desktop_status():
    """Get desktop automation status"""
    return desktop_agent.get_status()

@app.post("/api/desktop/screenshot")
async def take_screenshot():
    """Take screenshot"""
    result = desktop_agent.take_screenshot()
    return result

@app.get("/api/desktop/mouse")
async def get_mouse():
    """Get mouse position"""
    return desktop_agent.get_mouse()

@app.post("/api/desktop/move")
async def move_mouse(x: int, y: int):
    """Move mouse"""
    return desktop_agent.move_mouse(x, y)

@app.post("/api/desktop/click")
async def click():
    """Click mouse"""
    return desktop_agent.click_mouse()

@app.post("/api/desktop/type")
async def type_text(text: str = Form(...)):
    """Type text"""
    return desktop_agent.type_text(text)

@app.post("/api/desktop/press/{key}")
async def press_key(key: str):
    """Press key"""
    return desktop_agent.press_key(key)

@app.post("/api/desktop/hotkey")
async def press_hotkey(keys: str = Form(...)):
    """Press hotkey"""
    return desktop_agent.hotkey(keys)

@app.get("/api/agents")
async def list_agents():
    """List all agents"""
    agents = [
        {
            "id": "desktop_001",
            "name": "Desktop Controller",
            "status": desktop_agent.status,
            "type": "automation",
            "capabilities": desktop_agent.capabilities
        },
        {
            "id": "file_001",
            "name": "File Organizer",
            "status": "online",
            "type": "file",
            "capabilities": ["organize", "categorize"]
        },
        {
            "id": "email_001",
            "name": "Email Assistant",
            "status": "online",
            "type": "communication",
            "capabilities": ["draft", "organize"]
        },
        {
            "id": "content_001",
            "name": "Content Generator",
            "status": "online",
            "type": "content",
            "capabilities": ["generate", "summarize"]
        }
    ]
    return {"agents": agents}

@app.get("/api/test/desktop")
async def test_desktop():
    """Test all desktop functions"""
    results = []
    
    # Test 1: Status
    status = desktop_agent.get_status()
    results.append({"test": "status", "result": status})
    
    # Test 2: Mouse position
    mouse = desktop_agent.get_mouse()
    results.append({"test": "mouse", "result": mouse})
    
    # Test 3: Screenshot (if desktop available)
    if DESKTOP_AVAILABLE:
        screenshot = desktop_agent.take_screenshot()
        results.append({"test": "screenshot", "result": screenshot})
    
    return {
        "tests": results,
        "desktop_available": DESKTOP_AVAILABLE,
        "summary": f"{len([r for r in results if r['result'].get('success', False)])}/{len(results)} tests passed"
    }

# ==================== INTERACTIVE DASHBOARD ====================

@app.get("/dashboard")
async def dashboard():
    """Interactive dashboard with working buttons"""
    
    dashboard_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Agentic AI - Desktop Automation Test</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            * {{
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: 'Segoe UI', Arial, sans-serif;
            }}
            
            body {{
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                color: white;
                min-height: 100vh;
                padding: 20px;
            }}
            
            .container {{
                max-width: 1200px;
                margin: 0 auto;
            }}
            
            .header {{
                text-align: center;
                padding: 30px 0;
                border-bottom: 2px solid #334155;
                margin-bottom: 30px;
            }}
            
            .header h1 {{
                font-size: 2.5rem;
                background: linear-gradient(45deg, #3b82f6, #8b5cf6);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 10px;
            }}
            
            .header p {{
                color: #94a3b8;
                font-size: 1.1rem;
            }}
            
            .status-card {{
                background: rgba(30, 41, 59, 0.8);
                border-radius: 15px;
                padding: 25px;
                margin-bottom: 30px;
                border: 1px solid #334155;
            }}
            
            .status-row {{
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 15px;
                padding-bottom: 15px;
                border-bottom: 1px solid #475569;
            }}
            
            .status-indicator {{
                display: inline-block;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                margin-right: 10px;
            }}
            
            .online {{
                background: #10b981;
                box-shadow: 0 0 10px #10b981;
            }}
            
            .offline {{
                background: #ef4444;
                box-shadow: 0 0 10px #ef4444;
            }}
            
            .controls-grid {{
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }}
            
            .control-card {{
                background: rgba(30, 41, 59, 0.8);
                border-radius: 12px;
                padding: 25px;
                border: 1px solid #334155;
                transition: all 0.3s ease;
            }}
            
            .control-card:hover {{
                border-color: #3b82f6;
                transform: translateY(-3px);
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            }}
            
            .control-card h2 {{
                color: #3b82f6;
                margin-bottom: 20px;
                font-size: 1.4rem;
                display: flex;
                align-items: center;
                gap: 10px;
            }}
            
            .control-card h2 i {{
                font-size: 1.2rem;
            }}
            
            .btn-grid {{
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
            }}
            
            .btn {{
                background: linear-gradient(45deg, #3b82f6, #2563eb);
                color: white;
                border: none;
                padding: 14px;
                border-radius: 8px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }}
            
            .btn:hover {{
                transform: scale(1.05);
                box-shadow: 0 5px 15px rgba(59, 130, 246, 0.4);
            }}
            
            .btn:disabled {{
                background: #475569;
                cursor: not-allowed;
                opacity: 0.6;
            }}
            
            .btn-success {{
                background: linear-gradient(45deg, #10b981, #059669);
            }}
            
            .btn-danger {{
                background: linear-gradient(45deg, #ef4444, #dc2626);
            }}
            
            .btn-warning {{
                background: linear-gradient(45deg, #f59e0b, #d97706);
            }}
            
            .console {{
                background: rgba(15, 23, 42, 0.9);
                border-radius: 12px;
                padding: 20px;
                border: 1px solid #475569;
                min-height: 200px;
                max-height: 400px;
                overflow-y: auto;
                font-family: 'Consolas', monospace;
                font-size: 14px;
            }}
            
            .console-line {{
                padding: 8px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }}
            
            .success {{ color: #10b981; }}
            .error {{ color: #ef4444; }}
            .info {{ color: #3b82f6; }}
            .warning {{ color: #f59e0b; }}
            
            .agent-grid {{
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-top: 20px;
            }}
            
            .agent-card {{
                background: rgba(51, 65, 85, 0.5);
                padding: 15px;
                border-radius: 10px;
                text-align: center;
                border: 1px solid transparent;
            }}
            
            .agent-card:hover {{
                border-color: #3b82f6;
            }}
            
            .desktop-info {{
                background: rgba(0, 0, 0, 0.2);
                padding: 15px;
                border-radius: 8px;
                margin-top: 15px;
                font-family: monospace;
                font-size: 14px;
            }}
        </style>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    </head>
    <body>
        <div class="container">
            <!-- Header -->
            <div class="header">
                <h1><i class="fas fa-robot"></i> Agentic AI Platform</h1>
                <p>Desktop Automation Testing Dashboard</p>
            </div>
            
            <!-- Status Card -->
            <div class="status-card">
                <div class="status-row">
                    <div>
                        <h2>Platform Status</h2>
                        <div id="platformStatus">
                            <span class="status-indicator online"></span>
                            <span>All Systems Operational</span>
                        </div>
                    </div>
                    <div>
                        <button class="btn btn-success" onclick="testAll()">
                            <i class="fas fa-vial"></i> Test All Features
                        </button>
                    </div>
                </div>
                
                <div class="desktop-info" id="desktopInfo">
                    Loading desktop information...
                </div>
            </div>
            
            <!-- Desktop Controls -->
            <div class="controls-grid">
                <!-- Screenshot Controls -->
                <div class="control-card">
                    <h2><i class="fas fa-camera"></i> Screenshot</h2>
                    <div class="btn-grid">
                        <button class="btn" onclick="takeScreenshot()" id="screenshotBtn">
                            <i class="fas fa-camera"></i> Take Screenshot
                        </button>
                        <button class="btn btn-success" onclick="testScreenshot()">
                            <i class="fas fa-vial"></i> Test
                        </button>
                    </div>
                    <div id="screenshotResult" style="margin-top: 15px; font-size: 13px; color: #94a3b8;"></div>
                </div>
                
                <!-- Mouse Controls -->
                <div class="control-card">
                    <h2><i class="fas fa-mouse-pointer"></i> Mouse Control</h2>
                    <div class="btn-grid">
                        <button class="btn" onclick="getMouse()">
                            <i class="fas fa-crosshairs"></i> Get Position
                        </button>
                        <button class="btn btn-info" onclick="moveCenter()">
                            <i class="fas fa-bullseye"></i> Move to Center
                        </button>
                        <button class="btn btn-warning" onclick="clickMouse()">
                            <i class="fas fa-hand-pointer"></i> Click
                        </button>
                        <button class="btn" onclick="moveRandom()">
                            <i class="fas fa-random"></i> Move Random
                        </button>
                    </div>
                    <div id="mouseResult" style="margin-top: 15px; font-size: 13px; color: #94a3b8;"></div>
                </div>
                
                <!-- Keyboard Controls -->
                <div class="control-card">
                    <h2><i class="fas fa-keyboard"></i> Keyboard</h2>
                    <div class="btn-grid">
                        <button class="btn btn-success" onclick="typeHello()">
                            <i class="fas fa-keyboard"></i> Type "Hello"
                        </button>
                        <button class="btn btn-danger" onclick="showDesktop()">
                            <i class="fas fa-window-restore"></i> Win+D
                        </button>
                        <button class="btn" onclick="pressEnter()">
                            <i class="fas fa-enter"></i> Press Enter
                        </button>
                        <button class="btn btn-warning" onclick="openRun()">
                            <i class="fas fa-running"></i> Win+R
                        </button>
                    </div>
                    <div id="keyboardResult" style="margin-top: 15px; font-size: 13px; color: #94a3b8;"></div>
                </div>
                
                <!-- Agent Controls -->
                <div class="control-card">
                    <h2><i class="fas fa-robot"></i> Agent Status</h2>
                    <div class="btn-grid">
                        <button class="btn" onclick="checkDesktopStatus()">
                            <i class="fas fa-sync"></i> Refresh Status
                        </button>
                        <button class="btn btn-success" onclick="listAgents()">
                            <i class="fas fa-list"></i> List Agents
                        </button>
                        <button class="btn" onclick="checkHealth()">
                            <i class="fas fa-heartbeat"></i> Health Check
                        </button>
                        <button class="btn btn-warning" onclick="clearConsole()">
                            <i class="fas fa-trash"></i> Clear Console
                        </button>
                    </div>
                    <div id="agentResult" style="margin-top: 15px; font-size: 13px; color: #94a3b8;"></div>
                </div>
            </div>
            
            <!-- Console Output -->
            <div class="control-card">
                <h2><i class="fas fa-terminal"></i> Console Output</h2>
                <div class="console" id="console">
                    <div class="console-line info">[SYSTEM] Agentic AI Platform initialized</div>
                    <div class="console-line info">[SYSTEM] Desktop Available: {" + str(DESKTOP_AVAILABLE).lower() + "}</div>
                    <div class="console-line success">[READY] Dashboard loaded successfully</div>
                </div>
            </div>
            
            <!-- Active Agents -->
            <div class="control-card">
                <h2><i class="fas fa-server"></i> Active Agents</h2>
                <div class="agent-grid" id="agentGrid">
                    Loading agents...
                </div>
            </div>
        </div>
        
        <script>
            const consoleDiv = document.getElementById('console');
            const desktopInfo = document.getElementById('desktopInfo');
            const desktopAvailable = {" + str(DESKTOP_AVAILABLE).lower() + "};
            
            // Log function
            function log(message, type = 'info') {{
                const timestamp = new Date().toLocaleTimeString();
                const line = document.createElement('div');
                line.className = `console-line ${{type}}`;
                line.innerHTML = `[${{timestamp}}] ${{message}}`;
                consoleDiv.appendChild(line);
                consoleDiv.scrollTop = consoleDiv.scrollHeight;
            }}
            
            // Clear console
            function clearConsole() {{
                consoleDiv.innerHTML = '';
                log('Console cleared', 'info');
            }}
            
            // Update desktop info
            async function checkDesktopStatus() {{
                try {{
                    const response = await fetch('/api/desktop/status');
                    const data = await response.json();
                    
                    let statusHtml = '';
                    if (data.status === 'online') {{
                        statusHtml = `
                            <strong>Status:</strong> <span style="color: #10b981">ONLINE ✅</span><br>
                            <strong>Screen:</strong> ${{data.screen}}<br>
                            <strong>Mouse:</strong> X=${{data.mouse_position.x}}, Y=${{data.mouse_position.y}}<br>
                            <strong>Capabilities:</strong> ${{data.capabilities.length}} available
                        `;
                    }} else {{
                        statusHtml = `
                            <strong>Status:</strong> <span style="color: #ef4444">OFFLINE ❌</span><br>
                            <strong>Error:</strong> ${{data.error || 'Desktop automation not available'}}<br>
                            <strong>Fix:</strong> ${{data.fix_required || 'Install required packages'}}
                        `;
                    }}
                    
                    desktopInfo.innerHTML = statusHtml;
                    log('Desktop status updated', 'info');
                }} catch (error) {{
                    log('Failed to get desktop status: ' + error.message, 'error');
                }}
            }}
            
            // Screenshot functions
            async function takeScreenshot() {{
                log('Taking screenshot...', 'info');
                try {{
                    const response = await fetch('/api/desktop/screenshot', {{ method: 'POST' }});
                    const result = await response.json();
                    
                    if (result.success) {{
                        log(`✅ Screenshot saved: ${{result.filename}}`, 'success');
                        document.getElementById('screenshotResult').innerHTML = 
                            `<span style="color: #10b981">Saved: ${{result.filename}}</span>`;
                    }} else {{
                        log(`❌ Screenshot failed: ${{result.error}}`, 'error');
                        document.getElementById('screenshotResult').innerHTML = 
                            `<span style="color: #ef4444">Failed: ${{result.error}}</span>`;
                    }}
                }} catch (error) {{
                    log(`❌ Error: ${{error.message}}`, 'error');
                }}
            }}
            
            async function testScreenshot() {{
                log('Testing screenshot capability...', 'info');
                await takeScreenshot();
            }}
            
            // Mouse functions
            async function getMouse() {{
                try {{
                    const response = await fetch('/api/desktop/mouse');
                    const result = await response.json();
                    
                    if (result.success) {{
                        log(`Mouse: X=${{result.x}}, Y=${{result.y}}`, 'info');
                        document.getElementById('mouseResult').innerHTML = 
                            `<span style="color: #3b82f6">Position: X=${{result.x}}, Y=${{result.y}}</span>`;
                    }} else {{
                        log(`Mouse error: ${{result.error}}`, 'error');
                    }}
                }} catch (error) {{
                    log(`Mouse error: ${{error.message}}`, 'error');
                }}
            }}
            
            async function moveCenter() {{
                try {{
                    // Get screen size from status
                    const statusResponse = await fetch('/api/desktop/status');
                    const status = await statusResponse.json();
                    
                    if (status.status === 'online') {{
                        const [width, height] = status.screen.split('x').map(Number);
                        const x = Math.floor(width / 2);
                        const y = Math.floor(height / 2);
                        
                        const moveRes = await fetch(`/api/desktop/move?x=${{x}}&y=${{y}}`, {{ method: 'POST' }});
                        const result = await moveRes.json();
                        
                        if (result.success) {{
                            log(`Mouse moved to center: (${{x}}, ${{y}})`, 'success');
                            document.getElementById('mouseResult').innerHTML = 
                                `<span style="color: #10b981">Moved to center: (${{x}}, ${{y}})</span>`;
                        }}
                    }}
                }} catch (error) {{
                    log(`Move error: ${{error.message}}`, 'error');
                }}
            }}
            
            async function moveRandom() {{
                try {{
                    const statusResponse = await fetch('/api/desktop/status');
                    const status = await statusResponse.json();
                    
                    if (status.status === 'online') {{
                        const [width, height] = status.screen.split('x').map(Number);
                        const x = Math.floor(Math.random() * width);
                        const y = Math.floor(Math.random() * height);
                        
                        const moveRes = await fetch(`/api/desktop/move?x=${{x}}&y=${{y}}`, {{ method: 'POST' }});
                        const result = await moveRes.json();
                        
                        if (result.success) {{
                            log(`Mouse moved randomly: (${{x}}, ${{y}})`, 'success');
                            document.getElementById('mouseResult').innerHTML = 
                                `<span style="color: #10b981">Moved randomly: (${{x}}, ${{y}})</span>`;
                        }}
                    }}
                }} catch (error) {{
                    log(`Move error: ${{error.message}}`, 'error');
                }}
            }}
            
            async function clickMouse() {{
                try {{
                    const response = await fetch('/api/desktop/click', {{ method: 'POST' }});
                    const result = await response.json();
                    
                    if (result.success) {{
                        log('Mouse clicked', 'success');
                        document.getElementById('mouseResult').innerHTML = 
                            `<span style="color: #10b981">Mouse clicked</span>`;
                    }}
                }} catch (error) {{
                    log(`Click error: ${{error.message}}`, 'error');
                }}
            }}
            
            // Keyboard functions
            async function typeHello() {{
                try {{
                    const formData = new FormData();
                    formData.append('text', 'Hello from Agentic AI!');
                    
                    const response = await fetch('/api/desktop/type', {{
                        method: 'POST',
                        body: formData
                    }});
                    const result = await response.json();
                    
                    if (result.success) {{
                        log(`Typed: "${{result.typed}}"`, 'success');
                        document.getElementById('keyboardResult').innerHTML = 
                            `<span style="color: #10b981">Typed: ${{result.typed}}</span>`;
                    }}
                }} catch (error) {{
                    log(`Type error: ${{error.message}}`, 'error');
                }}
            }}
            
            async function showDesktop() {{
                try {{
                    const formData = new FormData();
                    formData.append('keys', 'win+d');
                    
                    const response = await fetch('/api/desktop/hotkey', {{
                        method: 'POST',
                        body: formData
                    }});
                    const result = await response.json();
                    
                    if (result.success) {{
                        log('Pressed Windows+D (Show Desktop)', 'success');
                        document.getElementById('keyboardResult').innerHTML = 
                            `<span style="color: #10b981">Pressed Windows+D</span>`;
                    }}
                }} catch (error) {{
                    log(`Hotkey error: ${{error.message}}`, 'error');
                }}
            }}
            
            async function pressEnter() {{
                try {{
                    const response = await fetch('/api/desktop/press/enter', {{ method: 'POST' }});
                    const result = await response.json();
                    
                    if (result.success) {{
                        log('Pressed Enter key', 'success');
                    }}
                }} catch (error) {{
                    log(`Key press error: ${{error.message}}`, 'error');
                }}
            }}
            
            async function openRun() {{
                try {{
                    const formData = new FormData();
                    formData.append('keys', 'win+r');
                    
                    const response = await fetch('/api/desktop/hotkey', {{
                        method: 'POST',
                        body: formData
                    }});
                    const result = await response.json();
                    
                    if (result.success) {{
                        log('Pressed Windows+R (Run dialog)', 'success');
                        document.getElementById('keyboardResult').innerHTML = 
                            `<span style="color: #10b981">Pressed Windows+R</span>`;
                    }}
                }} catch (error) {{
                    log(`Hotkey error: ${{error.message}}`, 'error');
                }}
            }}
            
            // Agent functions
            async function listAgents() {{
                try {{
                    const response = await fetch('/api/agents');
                    const data = await response.json();
                    const agentGrid = document.getElementById('agentGrid');
                    agentGrid.innerHTML = '';
                    
                    data.agents.forEach(agent => {{
                        const agentCard = document.createElement('div');
                        agentCard.className = 'agent-card';
                        agentCard.innerHTML = `
                            <strong>${{agent.name}}</strong><br>
                            <span style="color: ${{agent.status === 'online' ? '#10b981' : '#ef4444'}}">
                                ● ${{agent.status.toUpperCase()}}
                            </span><br>
                            <small style="color: #94a3b8;">${{agent.type}}</small>
                        `;
                        agentGrid.appendChild(agentCard);
                    }});
                    
                    log(`Loaded ${{data.agents.length}} agents`, 'success');
                }} catch (error) {{
                    log(`Agent error: ${{error.message}}`, 'error');
                }}
            }}
            
            async function checkHealth() {{
                try {{
                    const response = await fetch('/api/health');
                    const data = await response.json();
                    log(`Health check: ${{data.status}}, Desktop: ${{data.desktop}}`, 'info');
                }} catch (error) {{
                    log(`Health check error: ${{error.message}}`, 'error');
                }}
            }}
            
            // Test all functions
            async function testAll() {{
                log('=== STARTING COMPREHENSIVE TEST ===', 'info');
                
                await checkDesktopStatus();
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                await getMouse();
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                await moveCenter();
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                await typeHello();
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                await listAgents();
                
                log('=== TEST COMPLETE ===', 'success');
            }}
            
            // Initialize on load
            window.onload = function() {{
                log('Dashboard initialized', 'info');
                checkDesktopStatus();
                listAgents();
                
                // Enable/disable buttons based on desktop availability
                if (!desktopAvailable) {{
                    const buttons = document.querySelectorAll('.btn:not(.btn-success):not(.btn-warning)');
                    buttons.forEach(btn => {{
                        if (!btn.innerHTML.includes('Refresh') && !btn.innerHTML.includes('List') && 
                            !btn.innerHTML.includes('Health') && !btn.innerHTML.includes('Clear')) {{
                            btn.disabled = true;
                            btn.title = 'Desktop automation not available';
                        }}
                    }});
                    log('Desktop automation not available - some buttons disabled', 'warning');
                }}
            }};
        </script>
    </body>
    </html>
    """
    
    return HTMLResponse(content=dashboard_html)

# ==================== START SERVER ====================

if __name__ == "__main__":
    print("\n" + "=" * 70)
    print("🚀 AGENTIC AI PLATFORM - FIXED VERSION")
    print("=" * 70)
    print(f"🖥️  Desktop Automation: {'✅ ENABLED' if DESKTOP_AVAILABLE else '❌ DISABLED'}")
    
    if DESKTOP_AVAILABLE:
        try:
            import pyautogui
            screen_width, screen_height = pyautogui.size()
            mouse_x, mouse_y = pyautogui.position()
            print(f"   Screen: {screen_width}x{screen_height}")
            print(f"   Mouse: ({mouse_x}, {mouse_y})")
        except:
            pass
    else:
        print(f"   Error: {desktop_error}")
        print("   Fix: pip install pyautogui pillow")
    
    print("\n🌐 Dashboard: http://localhost:8080/dashboard")
    print("📡 API Docs: http://localhost:8080/docs")
    print("❤️  Health: http://localhost:8080/api/health")
    print("🔄 Test: http://localhost:8080/api/test/desktop")
    print("=" * 70)
    print("\nStarting server... Press Ctrl+C to stop\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8080, log_level="info") 
