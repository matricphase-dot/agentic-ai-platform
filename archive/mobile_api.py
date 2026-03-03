"""
mobile_api.py - Mobile Companion API
API endpoints for mobile app to control desktop automations
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import time
from datetime import datetime
from typing import Dict, List
import os

# Create FastAPI app for mobile
app = FastAPI(title="Agentic AI Mobile API", version="1.0.0")

# Enable CORS for mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your mobile app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store mobile connections
mobile_connections: List[WebSocket] = []

# Mobile app state
mobile_state = {
    "connected_devices": {},
    "pending_commands": [],
    "notifications": [],
    "qr_code": None
}

class MobileDevice:
    """Represents a connected mobile device"""
    def __init__(self, device_id: str, websocket: WebSocket):
        self.device_id = device_id
        self.websocket = websocket
        self.connected_at = datetime.now()
        self.last_seen = datetime.now()
        self.device_info = {}
        self.commands_sent = 0
        self.commands_received = 0
    
    def update_last_seen(self):
        """Update last seen timestamp"""
        self.last_seen = datetime.now()
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            "device_id": self.device_id,
            "connected_at": self.connected_at.isoformat(),
            "last_seen": self.last_seen.isoformat(),
            "device_info": self.device_info,
            "commands_sent": self.commands_sent,
            "commands_received": self.commands_received,
            "connection_duration": (datetime.now() - self.connected_at).total_seconds()
        }

# QR Code Generation for pairing
def generate_qr_code_data():
    """Generate QR code data for mobile pairing"""
    import socket
    import uuid
    
    # Get local IP
    hostname = socket.gethostname()
    try:
        local_ip = socket.gethostbyname(hostname)
    except:
        local_ip = "127.0.0.1"
    
    # Generate pairing code
    pairing_code = str(uuid.uuid4())[:8].upper()
    
    qr_data = {
        "type": "agentic_ai_pairing",
        "server_ip": local_ip,
        "server_port": 5000,
        "pairing_code": pairing_code,
        "timestamp": datetime.now().isoformat(),
        "expires_in": 300  # 5 minutes
    }
    
    mobile_state["qr_code"] = qr_data
    return qr_data

# WebSocket endpoint for mobile connections
@app.websocket("/ws/mobile")
async def mobile_websocket(websocket: WebSocket):
    """WebSocket endpoint for mobile devices"""
    await websocket.accept()
    
    device_id = None
    device = None
    
    try:
        # Receive initial connection message
        data = await websocket.receive_text()
        connection_data = json.loads(data)
        
        if connection_data.get("type") == "connect":
            device_id = connection_data.get("device_id", f"mobile_{int(time.time())}")
            device_info = connection_data.get("device_info", {})
            
            # Create device object
            device = MobileDevice(device_id, websocket)
            device.device_info = device_info
            mobile_connections.append(websocket)
            mobile_state["connected_devices"][device_id] = device
            
            print(f"📱 Mobile device connected: {device_id}")
            
            # Send welcome message
            await websocket.send_json({
                "type": "connected",
                "device_id": device_id,
                "message": "Connected to Agentic AI Desktop",
                "server_time": datetime.now().isoformat(),
                "capabilities": [
                    "start_recording",
                    "stop_recording",
                    "execute_automation",
                    "get_status",
                    "receive_notifications"
                ]
            })
            
            # Broadcast device connected
            await broadcast_to_desktop({
                "type": "mobile_connected",
                "device_id": device_id,
                "device_info": device_info
            })
        
        # Handle messages
        while True:
            data = await websocket.receive_text()
            device.update_last_seen()
            device.commands_received += 1
            
            message = json.loads(data)
            await handle_mobile_message(device, message)
            
    except WebSocketDisconnect:
        print(f"📱 Mobile device disconnected: {device_id}")
        
        if device_id and device_id in mobile_state["connected_devices"]:
            del mobile_state["connected_devices"][device_id]
        
        if websocket in mobile_connections:
            mobile_connections.remove(websocket)
        
        # Broadcast device disconnected
        await broadcast_to_desktop({
            "type": "mobile_disconnected",
            "device_id": device_id
        })
    
    except Exception as e:
        print(f"Mobile WebSocket error: {e}")
        if websocket in mobile_connections:
            mobile_connections.remove(websocket)

async def handle_mobile_message(device: MobileDevice, message: dict):
    """Handle incoming messages from mobile"""
    msg_type = message.get("type")
    
    if msg_type == "ping":
        await device.websocket.send_json({
            "type": "pong",
            "timestamp": datetime.now().isoformat()
        })
    
    elif msg_type == "command":
        command = message.get("command")
        params = message.get("params", {})
        
        # Forward command to desktop
        await forward_to_desktop(device.device_id, command, params)
        
        # Send acknowledgment
        await device.websocket.send_json({
            "type": "command_received",
            "command": command,
            "status": "queued",
            "timestamp": datetime.now().isoformat()
        })
    
    elif msg_type == "get_status":
        # Get current desktop status
        status = await get_desktop_status()
        await device.websocket.send_json({
            "type": "status",
            "status": status,
            "timestamp": datetime.now().isoformat()
        })
    
    elif msg_type == "notification":
        # Mobile sends notification (e.g., automation completed on mobile)
        notification = message.get("notification")
        mobile_state["notifications"].append({
            "device_id": device.device_id,
            "notification": notification,
            "timestamp": datetime.now().isoformat()
        })
        
        print(f"📱 Notification from {device.device_id}: {notification}")

async def forward_to_desktop(device_id: str, command: str, params: dict):
    """Forward command to desktop (simulated for now)"""
    print(f"📱 Forwarding command from {device_id}: {command}")
    
    # In real implementation, forward to desktop WebSocket
    # For now, simulate processing
    mobile_state["pending_commands"].append({
        "device_id": device_id,
        "command": command,
        "params": params,
        "timestamp": datetime.now().isoformat(),
        "status": "pending"
    })
    
    # Simulate processing delay
    asyncio.create_task(process_command(device_id, command, params))

async def process_command(device_id: str, command: str, params: dict):
    """Process mobile command"""
    await asyncio.sleep(1)  # Simulate processing time
    
    # Find and update command status
    for cmd in mobile_state["pending_commands"]:
        if cmd["device_id"] == device_id and cmd["command"] == command:
            cmd["status"] = "completed"
            cmd["completed_at"] = datetime.now().isoformat()
            break
    
    # Find device and send completion
    if device_id in mobile_state["connected_devices"]:
        device = mobile_state["connected_devices"][device_id]
        await device.websocket.send_json({
            "type": "command_completed",
            "command": command,
            "status": "success",
            "timestamp": datetime.now().isoformat()
        })

async def get_desktop_status() -> dict:
    """Get current desktop status (simulated)"""
    return {
        "recording_active": False,
        "active_automations": 0,
        "system_uptime": int(time.time() % 10000),
        "connected_devices": len(mobile_state["connected_devices"]),
        "pending_commands": len(mobile_state["pending_commands"]),
        "last_activity": datetime.now().isoformat()
    }

async def broadcast_to_desktop(message: dict):
    """Broadcast message to desktop (simulated)"""
    print(f"📱 Broadcasting to desktop: {message.get('type')}")
    # In real implementation, send to desktop WebSocket
    # For now, just print

async def send_notification_to_mobile(device_id: str, notification: dict):
    """Send notification to specific mobile device"""
    if device_id in mobile_state["connected_devices"]:
        device = mobile_state["connected_devices"][device_id]
        await device.websocket.send_json({
            "type": "notification",
            "notification": notification,
            "timestamp": datetime.now().isoformat()
        })

async def broadcast_to_mobile(message: dict):
    """Broadcast message to all mobile devices"""
    for device_id, device in mobile_state["connected_devices"].items():
        try:
            await device.websocket.send_json(message)
        except:
            continue

# REST API endpoints for mobile
@app.get("/api/mobile/qr-code")
async def get_qr_code():
    """Get QR code for mobile pairing"""
    qr_data = generate_qr_code_data()
    return {
        "success": True,
        "qr_data": qr_data,
        "qr_url": f"https://api.qrserver.com/v1/create-qr-code/?size=200x200&data={json.dumps(qr_data)}"
    }

@app.post("/api/mobile/pair")
async def pair_mobile(pairing_code: str, device_info: dict):
    """Pair mobile device with desktop"""
    if not mobile_state["qr_code"]:
        raise HTTPException(status_code=400, detail="No active pairing session")
    
    if mobile_state["qr_code"]["pairing_code"] != pairing_code:
        raise HTTPException(status_code=400, detail="Invalid pairing code")
    
    # Check if expired
    expires_at = datetime.fromisoformat(mobile_state["qr_code"]["timestamp"])
    expires_at = expires_at.replace(second=expires_at.second + mobile_state["qr_code"]["expires_in"])
    
    if datetime.now() > expires_at:
        raise HTTPException(status_code=400, detail="Pairing code expired")
    
    # Generate device ID
    import uuid
    device_id = f"mobile_{uuid.uuid4().hex[:8]}"
    
    return {
        "success": True,
        "device_id": device_id,
        "message": "Pairing successful",
        "websocket_url": f"ws://{mobile_state['qr_code']['server_ip']}:{mobile_state['qr_code']['server_port']}/ws/mobile"
    }

@app.get("/api/mobile/devices")
async def get_connected_devices():
    """Get list of connected mobile devices"""
    devices = []
    for device_id, device in mobile_state["connected_devices"].items():
        devices.append(device.to_dict())
    
    return {
        "success": True,
        "devices": devices,
        "total_connected": len(devices)
    }

@app.get("/api/mobile/status")
async def get_mobile_status():
    """Get mobile integration status"""
    return {
        "success": True,
        "mobile_enabled": True,
        "connected_devices": len(mobile_state["connected_devices"]),
        "pending_commands": len(mobile_state["pending_commands"]),
        "notifications": len(mobile_state["notifications"]),
        "qr_code_active": mobile_state["qr_code"] is not None
    }

@app.post("/api/mobile/command")
async def send_mobile_command(command: str, params: dict = {}):
    """Send command to mobile (from desktop)"""
    # This would be called by desktop to control mobile
    # For now, just simulate
    return {
        "success": True,
        "command": command,
        "status": "sent",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/mobile/quick-actions")
async def get_quick_actions():
    """Get quick actions for mobile interface"""
    return {
        "success": True,
        "quick_actions": [
            {
                "id": "start_recording",
                "name": "Start Recording",
                "icon": "🎥",
                "description": "Start desktop recording",
                "color": "#4CAF50"
            },
            {
                "id": "stop_recording",
                "name": "Stop Recording",
                "icon": "⏹️",
                "description": "Stop desktop recording",
                "color": "#F44336"
            },
            {
                "id": "organize_files",
                "name": "Organize Files",
                "icon": "📁",
                "description": "Organize desktop files",
                "color": "#2196F3"
            },
            {
                "id": "run_automation",
                "name": "Run Automation",
                "icon": "🤖",
                "description": "Run saved automation",
                "color": "#9C27B0"
            },
            {
                "id": "take_screenshot",
                "name": "Take Screenshot",
                "icon": "📸",
                "description": "Take desktop screenshot",
                "color": "#FF9800"
            },
            {
                "id": "system_status",
                "name": "System Status",
                "icon": "📊",
                "description": "Check system status",
                "color": "#607D8B"
            }
        ]
    }

# Scheduled tasks
async def cleanup_old_devices():
    """Clean up old/disconnected devices"""
    while True:
        await asyncio.sleep(60)  # Run every minute
        
        current_time = datetime.now()
        devices_to_remove = []
        
        for device_id, device in mobile_state["connected_devices"].items():
            # Remove devices not seen for 5 minutes
            if (current_time - device.last_seen).total_seconds() > 300:
                devices_to_remove.append(device_id)
        
        for device_id in devices_to_remove:
            print(f"🧹 Cleaning up old device: {device_id}")
            del mobile_state["connected_devices"][device_id]

# Startup event
@app.on_event("startup")
async def startup_event():
    """Start background tasks on startup"""
    asyncio.create_task(cleanup_old_devices())
    print("✅ Mobile API started")

# For testing
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)