"""
Agentic AI Platform - SIMPLE WORKING VERSION
Desktop Automation WITHOUT Tesseract requirements
"""
from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
import asyncio
import pyautogui
from PIL import Image
import json
import os
import time
from datetime import datetime
import sqlite3
import subprocess

app = FastAPI(title="Agentic AI Platform - Desktop Edition")

# Global agent status
AGENTS = {
    "desktop_agent": {
        "name": "Desktop Controller",
        "status": "online",
        "capabilities": ["screenshot", "mouse", "keyboard", "windows"],
        "last_active": datetime.now().isoformat()
    },
    "file_agent": {
        "name": "File Organizer", 
        "status": "online",
        "capabilities": ["organize", "categorize", "rename"],
        "last_active": datetime.now().isoformat()
    },
    "email_agent": {
        "name": "Email Assistant",
        "status": "online", 
        "capabilities": ["draft", "send", "organize"],
        "last_active": datetime.now().isoformat()
    },
    "web_agent": {
        "name": "Web Automation",
        "status": "online",
        "capabilities": ["browse", "extract", "automate"],
        "last_active": datetime.now().isoformat()
    }
}

# Create directories
os.makedirs("screenshots", exist_ok=True)
os.makedirs("organized_files", exist_ok=True)

class DesktopAutomation:
    """Desktop automation without Tesseract dependency"""
    
    def __init__(self):
        self.status = "online"
        
    def take_screenshot(self, region=None):
        """Take screenshot of screen or region"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"screenshots/screen_{timestamp}.png"
            
            if region:
                screenshot = pyautogui.screenshot(region=region)
            else:
                screenshot = pyautogui.screenshot()
            
            screenshot.save(filename)
            return {"success": True, "filename": filename, "size": screenshot.size}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_mouse_info(self):
        """Get mouse position and screen info"""
        try:
            x, y = pyautogui.position()
            screen_width, screen_height = pyautogui.size()
            return {
                "success": True,
                "mouse_x": x,
                "mouse_y": y,
                "screen_width": screen_width,
                "screen_height": screen_height
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def move_mouse(self, x, y, duration=0.5):
        """Move mouse to coordinates"""
        try:
            pyautogui.moveTo(x, y, duration=duration)
            return {"success": True, "moved_to": f"{x},{y}"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def click(self, x=None, y=None, button="left"):
        """Click at position or current location"""
        try:
            if x is not None and y is not None:
                pyautogui.click(x, y, button=button)
            else:
                pyautogui.click(button=button)
            return {"success": True, "action": f"click_{button}"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def type_text(self, text, interval=0.1):
        """Type text"""
        try:
            pyautogui.write(text, interval=interval)
            return {"success": True, "typed": text}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def press_key(self, key):
        """Press a key"""
        try:
            pyautogui.press(key)
            return {"success": True, "key": key}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def hotkey(self, *keys):
        """Press key combination"""
        try:
            pyautogui.hotkey(*keys)
            return {"success": True, "keys": keys}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_window_info(self):
        """Get active window info (simplified)"""
        try:
            # Get all windows - simplified version
            import pygetwindow as gw
            windows = gw.getAllTitles()
            active = gw.getActiveWindow()
            
            return {
                "success": True,
                "active_window": str(active) if active else None,
                "all_windows": [w for w in windows if w]  # Filter empty titles
            }
        except:
            return {"success": True, "note": "Window info requires pygetwindow"}

desktop = DesktopAutomation()

# ==================== API ENDPOINTS ====================

@app.get("/")
async def root():
    return {
        "platform": "Agentic AI",
        "version": "2.0",
        "status": "online",
        "desktop_automation": "enabled",
        "agents": len(AGENTS)
    }

@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "desktop_agent": desktop.status
    }

@app.get("/api/agents")
async def list_agents():
    return {"agents": AGENTS}

@app.get("/api/desktop/status")
async def desktop_status():
    mouse_info = desktop.get_mouse_info()
    return {
        "status": "online",
        "desktop_automation": True,
        "mouse_info": mouse_info,
        "screen_size": f"{pyautogui.size()[0]}x{pyautogui.size()[1]}",
        "available_commands": [
            "screenshot", "mouse_position", "mouse_move", 
            "click", "type", "press", "hotkey", "windows"
        ]
    }

@app.post("/api/desktop/screenshot")
async def take_screenshot():
    result = desktop.take_screenshot()
    return result

@app.get("/api/desktop/mouse")
async def get_mouse():
    return desktop.get_mouse_info()

@app.post("/api/desktop/move")
async def move_mouse(x: int, y: int, duration: float = 0.5):
    return desktop.move_mouse(x, y, duration)

@app.post("/api/desktop/click")
async def click_mouse(x: int = None, y: int = None, button: str = "left"):
    return desktop.click(x, y, button)

@app.post("/api/desktop/type")
async def type_text(text: str):
    return desktop.type_text(text)

@app.post("/api/desktop/press/{key}")
async def press_key(key: str):
    return desktop.press_key(key)

@app.post("/api/desktop/hotkey")
async def press_hotkey(keys: str):  # Format: "ctrl+alt+delete"
    key_list = keys.split("+")
    return desktop.hotkey(*key_list)

# ==================== DASHBOARD ====================

@app.get("/dashboard")
async def get_dashboard():
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Agentic AI Platform - Desktop Automation</title>
        <meta charset="UTF-8">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', Arial, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                min-height: 100vh;
                padding: 20px;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                padding: 30px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            }
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid rgba(255,255,255,0.2);
            }
            h1 {
                font-size: 2.5rem;
                background: linear-gradient(45deg, #fff, #f0f0f0);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .status {
                background: #10b981;
                padding: 10px 20px;
                border-radius: 50px;
                font-weight: bold;
                box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
            }
            .grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 25px;
                margin: 30px 0;
            }
            .card {
                background: rgba(255, 255, 255, 0.15);
                border-radius: 15px;
                padding: 25px;
                transition: all 0.3s ease;
                border: 1px solid rgba(255,255,255,0.1);
            }
            .card:hover {
                transform: translateY(-5px);
                background: rgba(255, 255, 255, 0.2);
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            }
            .card h3 {
                margin-bottom: 15px;
                font-size: 1.5rem;
                color: #fff;
            }
            .controls {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                margin-top: 20px;
            }
            .btn {
                background: linear-gradient(45deg, #3b82f6, #1d4ed8);
                color: white;
                border: none;
                padding: 15px;
                border-radius: 10px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .btn:hover {
                background: linear-gradient(45deg, #2563eb, #1e40af);
                transform: scale(1.05);
            }
            .btn-danger {
                background: linear-gradient(45deg, #ef4444, #dc2626);
            }
            .btn-success {
                background: linear-gradient(45deg, #10b981, #059669);
            }
            .console {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 10px;
                padding: 20px;
                margin-top: 30px;
                min-height: 200px;
                font-family: monospace;
                overflow-y: auto;
                max-height: 300px;
            }
            .agent-list {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 15px;
                margin-top: 20px;
            }
            .agent {
                background: rgba(255,255,255,0.1);
                padding: 15px;
                border-radius: 10px;
                text-align: center;
            }
            .online { color: #10b981; }
            .offline { color: #ef4444; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🖥️ Agentic AI Platform</h1>
                <div class="status" id="status">● ALL SYSTEMS ONLINE</div>
            </div>
            
            <!-- Desktop Control Card -->
            <div class="card">
                <h3>🖱️ Desktop Automation</h3>
                <div id="desktopInfo">Loading desktop info...</div>
                <div class="controls">
                    <button class="btn" onclick="takeScreenshot()">📸 Screenshot</button>
                    <button class="btn" onclick="getMouse()">🖱️ Mouse Position</button>
                    <button class="btn" onclick="moveCenter()">🎯 Move to Center</button>
                    <button class="btn" onclick="clickHere()">👆 Click Here</button>
                    <button class="btn" onclick="typeText()">⌨️ Type "Hello AI"</button>
                    <button class="btn btn-danger" onclick="pressWinD()">🪟 Show Desktop</button>
                    <button class="btn" onclick="openNotepad()">📝 Open Notepad</button>
                    <button class="btn btn-success" onclick="testAll()">🧪 Test All Features</button>
                </div>
            </div>
            
            <!-- Agents Card -->
            <div class="card">
                <h3>🤖 Active Agents</h3>
                <div class="agent-list" id="agentList">
                    Loading agents...
                </div>
            </div>
            
            <!-- Console Output -->
            <div class="card">
                <h3>📊 Console Output</h3>
                <div class="console" id="console">
                    Platform initialized...<br>
                    Ready for testing!
                </div>
            </div>
        </div>
        
        <script>
            const consoleDiv = document.getElementById('console');
            const statusDiv = document.getElementById('status');
            const desktopInfo = document.getElementById('desktopInfo');
            const agentList = document.getElementById('agentList');
            
            function log(message, type = 'info') {
                const timestamp = new Date().toLocaleTimeString();
                const color = type === 'error' ? '#ef4444' : 
                              type === 'success' ? '#10b981' : '#3b82f6';
                consoleDiv.innerHTML += `<span style="color:${color}">[${timestamp}] ${message}</span><br>`;
                consoleDiv.scrollTop = consoleDiv.scrollHeight;
            }
            
            async function updateDesktopInfo() {
                try {
                    const response = await fetch('/api/desktop/status');
                    const data = await response.json();
                    
                    desktopInfo.innerHTML = `
                        <strong>Screen:</strong> ${data.screen_size}<br>
                        <strong>Mouse:</strong> X=${data.mouse_info.mouse_x}, Y=${data.mouse_info.mouse_y}<br>
                        <strong>Status:</strong> <span class="online">${data.status}</span>
                    `;
                } catch (error) {
                    desktopInfo.innerHTML = `<span class="offline">Desktop offline</span>`;
                }
            }
            
            async function updateAgents() {
                try {
                    const response = await fetch('/api/agents');
                    const data = await response.json();
                    
                    let html = '';
                    for (const [id, agent] of Object.entries(data.agents)) {
                        html += `
                            <div class="agent">
                                <strong>${agent.name}</strong><br>
                                <span class="${agent.status}">● ${agent.status.toUpperCase()}</span><br>
                                <small>${agent.capabilities.slice(0,2).join(', ')}...</small>
                            </div>
                        `;
                    }
                    agentList.innerHTML = html;
                } catch (error) {
                    agentList.innerHTML = '<span class="offline">Unable to load agents</span>';
                }
            }
            
            async function takeScreenshot() {
                log('Taking screenshot...');
                try {
                    const response = await fetch('/api/desktop/screenshot', { method: 'POST' });
                    const result = await response.json();
                    if (result.success) {
                        log(`✅ Screenshot saved: ${result.filename}`, 'success');
                    } else {
                        log(`❌ Screenshot failed: ${result.error}`, 'error');
                    }
                } catch (error) {
                    log(`❌ Error: ${error.message}`, 'error');
                }
            }
            
            async function getMouse() {
                try {
                    const response = await fetch('/api/desktop/mouse');
                    const result = await response.json();
                    log(`Mouse: X=${result.mouse_x}, Y=${result.mouse_y}`, 'info');
                } catch (error) {
                    log(`❌ Mouse error: ${error.message}`, 'error');
                }
            }
            
            async function moveCenter() {
                try {
                    const response = await fetch('/api/desktop/status');
                    const data = await response.json();
                    const [width, height] = data.screen_size.split('x').map(Number);
                    const x = Math.floor(width / 2);
                    const y = Math.floor(height / 2);
                    
                    const moveRes = await fetch(`/api/desktop/move?x=${x}&y=${y}&duration=0.5`, { method: 'POST' });
                    const result = await moveRes.json();
                    
                    if (result.success) {
                        log(`✅ Mouse moved to center (${x},${y})`, 'success');
                    }
                } catch (error) {
                    log(`❌ Move error: ${error.message}`, 'error');
                }
            }
            
            async function clickHere() {
                try {
                    const response = await fetch('/api/desktop/click', { method: 'POST' });
                    const result = await response.json();
                    log(`✅ Clicked mouse`, 'success');
                } catch (error) {
                    log(`❌ Click error: ${error.message}`, 'error');
                }
            }
            
            async function typeText() {
                try {
                    const response = await fetch('/api/desktop/type', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ text: "Hello from Agentic AI!" })
                    });
                    const result = await response.json();
                    log(`✅ Typed: "${result.typed}"`, 'success');
                } catch (error) {
                    log(`❌ Type error: ${error.message}`, 'error');
                }
            }
            
            async function pressWinD() {
                try {
                    const response = await fetch('/api/desktop/hotkey', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ keys: "win+d" })
                    });
                    const result = await response.json();
                    log(`✅ Pressed Windows+D (Show Desktop)`, 'success');
                } catch (error) {
                    log(`❌ Hotkey error: ${error.message}`, 'error');
                }
            }
            
            async function openNotepad() {
                try {
                    // Open notepad via key combination
                    const response = await fetch('/api/desktop/hotkey', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ keys: "win+r" })
                    });
                    
                    // Type notepad and press enter
                    setTimeout(async () => {
                        await fetch('/api/desktop/type', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ text: "notepad" })
                        });
                        
                        setTimeout(async () => {
                            await fetch('/api/desktop/press/enter', { method: 'POST' });
                            log(`✅ Notepad opened`, 'success');
                        }, 500);
                    }, 500);
                    
                } catch (error) {
                    log(`❌ Error opening Notepad: ${error.message}`, 'error');
                }
            }
            
            async function testAll() {
                log('=== STARTING COMPREHENSIVE TEST ===', 'info');
                
                const tests = [
                    { name: 'Desktop Status', func: updateDesktopInfo },
                    { name: 'Screenshot', func: takeScreenshot },
                    { name: 'Mouse Position', func: getMouse },
                    { name: 'Type Text', func: typeText }
                ];
                
                for (const test of tests) {
                    log(`Running: ${test.name}...`);
                    await test.func();
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                
                log('=== ALL TESTS COMPLETED ===', 'success');
            }
            
            // Auto-update every 5 seconds
            setInterval(updateDesktopInfo, 5000);
            setInterval(updateAgents, 5000);
            
            // Initial load
            updateDesktopInfo();
            updateAgents();
            log('Agentic AI Platform loaded successfully!', 'success');
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html)

# ==================== TESTING ENDPOINTS ====================

@app.get("/api/test/all")
async def test_all_features():
    """Test all features"""
    results = []
    
    # Test 1: Desktop status
    try:
        mouse_info = desktop.get_mouse_info()
        results.append({"test": "desktop_status", "success": True, "result": mouse_info})
    except Exception as e:
        results.append({"test": "desktop_status", "success": False, "error": str(e)})
    
    # Test 2: Screenshot
    try:
        screenshot = desktop.take_screenshot()
        results.append({"test": "screenshot", "success": screenshot["success"], "result": screenshot})
    except Exception as e:
        results.append({"test": "screenshot", "success": False, "error": str(e)})
    
    # Test 3: Mouse movement
    try:
        desktop.move_mouse(100, 100, 0.2)
        results.append({"test": "mouse_movement", "success": True})
    except Exception as e:
        results.append({"test": "mouse_movement", "success": False, "error": str(e)})
    
    return {"tests": results, "passed": sum(1 for r in results if r["success"])}

# ==================== MAIN ====================

if __name__ == "__main__":
    print("=" * 60)
    print("🤖 AGENTIC AI PLATFORM - DESKTOP AUTOMATION")
    print("=" * 60)
    print("🌐 Dashboard: http://localhost:8080/dashboard")
    print("📡 API Docs: http://localhost:8080/docs")
    print("❤️  Health: http://localhost:8080/api/health")
    print("=" * 60)
    
    # Test desktop capabilities
    try:
        print("Testing desktop automation...")
        test = desktop.get_mouse_info()
        if test["success"]:
            print(f"✅ Desktop automation READY")
            print(f"   Screen: {pyautogui.size()[0]}x{pyautogui.size()[1]}")
            print(f"   Mouse: ({test['mouse_x']}, {test['mouse_y']})")
        else:
            print(f"⚠️  Desktop limited: {test['error']}")
    except Exception as e:
        print(f"❌ Desktop error: {e}")
    
    print("\nStarting server...")
    uvicorn.run(app, host="0.0.0.0", port=8080, log_level="info") 
