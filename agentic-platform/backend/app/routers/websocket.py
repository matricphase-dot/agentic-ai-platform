# backend/app/routers/websocket.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from fastapi.responses import HTMLResponse
import json
from typing import Optional

from app.services.agent_communication import AgentCommunicationService
from app.services.websocket_manager import AgentWebSocketManager
from app.middleware.auth import get_current_user_ws
from app.database import get_db
from sqlalchemy.orm import Session

router = APIRouter()

# Initialize services
communication_service = AgentCommunicationService()
websocket_manager = AgentWebSocketManager(communication_service)

# Test HTML page for WebSocket testing
html = """
<!DOCTYPE html>
<html>
    <head>
        <title>Agent WebSocket Test</title>
    </head>
    <body>
        <h1>Agent Communication WebSocket Test</h1>
        <div>
            <label>Agent ID: </label>
            <input type="text" id="agentId" placeholder="agent-123">
            <button onclick="connect()">Connect</button>
        </div>
        <div>
            <label>Message: </label>
            <input type="text" id="messageText" placeholder="Hello agent!">
            <label>To Agent: </label>
            <input type="text" id="receiverId" placeholder="agent-456">
            <button onclick="sendMessage()">Send</button>
        </div>
        <div>
            <button onclick="listAgents()">List Agents</button>
            <button onclick="ping()">Ping</button>
        </div>
        <div id="messages"></div>
        <script>
            var ws = null;
            var agentId = null;
            
            function connect() {
                agentId = document.getElementById("agentId").value;
                if (!agentId) {
                    alert("Please enter an Agent ID");
                    return;
                }
                
                ws = new WebSocket(`ws://${window.location.host}/api/v1/ws/agent/${agentId}`);
                
                ws.onopen = function() {
                    addMessage("Connected to agent network");
                    // Register agent
                    ws.send(JSON.stringify({
                        type: "register",
                        agent_id: agentId,
                        agent_info: {
                            name: "Test Agent",
                            type: "test",
                            capabilities: ["chat", "test"]
                        }
                    }));
                };
                
                ws.onmessage = function(event) {
                    const data = JSON.parse(event.data);
                    addMessage("Received: " + JSON.stringify(data));
                };
                
                ws.onclose = function() {
                    addMessage("Disconnected");
                };
            }
            
            function sendMessage() {
                if (!ws) {
                    alert("Not connected");
                    return;
                }
                
                const message = document.getElementById("messageText").value;
                const receiver = document.getElementById("receiverId").value;
                
                if (!message || !receiver) {
                    alert("Please enter message and receiver");
                    return;
                }
                
                ws.send(JSON.stringify({
                    type: "message",
                    receiver_id: receiver,
                    content: message,
                    message_type: "text"
                }));
            }
            
            function listAgents() {
                if (!ws) {
                    alert("Not connected");
                    return;
                }
                
                ws.send(JSON.stringify({
                    type: "command",
                    command: "list_agents"
                }));
            }
            
            function ping() {
                if (!ws) {
                    alert("Not connected");
                    return;
                }
                
                ws.send(JSON.stringify({
                    type: "ping"
                }));
            }
            
            function addMessage(text) {
                const messages = document.getElementById("messages");
                const message = document.createElement("p");
                message.textContent = text;
                messages.appendChild(message);
            }
        </script>
    </body>
</html>
"""

@router.get("/test")
async def websocket_test():
    """Test page for WebSocket communication"""
    return HTMLResponse(html)

@router.websocket("/api/v1/ws/agent/{agent_id}")
async def agent_websocket_endpoint(
    websocket: WebSocket,
    agent_id: str,
    token: Optional[str] = None
):
    """
    WebSocket endpoint for agent communication
    
    Query parameters:
    - token: Optional authentication token
    
    Messages expected:
    - {"type": "register", "agent_id": "string", "agent_info": {...}}
    - {"type": "message", "receiver_id": "string", "content": {...}}
    - {"type": "collaboration", "action": "create/join", ...}
    - {"type": "ping"}
    """
    
    # TODO: Add authentication for production
    # if token:
    #     user = await get_current_user_ws(token)
    #     if not user:
    #         await websocket.close(code=1008, reason="Unauthorized")
    #         return
    
    await websocket_manager.start_websocket_listener(websocket)