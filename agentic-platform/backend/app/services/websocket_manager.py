# backend/app/services/websocket_manager.py
import asyncio
import json
import logging
from typing import Dict, Set, Callable
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime

logger = logging.getLogger(__name__)

class ConnectionManager:
    """Manages WebSocket connections for real-time agent communication"""
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.agent_connections: Dict[str, str] = {}  # agent_id -> connection_id
        self.connection_agents: Dict[str, str] = {}  # connection_id -> agent_id
        self.message_handlers: Dict[str, Callable] = {}
    
    async def connect(self, websocket: WebSocket, agent_id: str):
        """Accept WebSocket connection and register agent"""
        await websocket.accept()
        connection_id = str(id(websocket))
        
        self.active_connections[connection_id] = websocket
        self.agent_connections[agent_id] = connection_id
        self.connection_agents[connection_id] = agent_id
        
        logger.info(f"Agent {agent_id} connected via WebSocket")
        
        return connection_id
    
    def disconnect(self, connection_id: str):
        """Remove WebSocket connection"""
        if connection_id in self.active_connections:
            agent_id = self.connection_agents.get(connection_id)
            del self.active_connections[connection_id]
            if connection_id in self.connection_agents:
                del self.connection_agents[connection_id]
            if agent_id and agent_id in self.agent_connections:
                del self.agent_connections[agent_id]
            
            logger.info(f"Agent {agent_id} disconnected")
    
    async def send_personal_message(self, message: dict, agent_id: str):
        """Send message to a specific agent"""
        if agent_id in self.agent_connections:
            connection_id = self.agent_connections[agent_id]
            websocket = self.active_connections.get(connection_id)
            if websocket:
                try:
                    await websocket.send_json(message)
                    return True
                except Exception as e:
                    logger.error(f"Failed to send message to agent {agent_id}: {e}")
        return False
    
    async def broadcast(self, message: dict, exclude_agent: str = None):
        """Broadcast message to all connected agents"""
        disconnected = []
        
        for connection_id, websocket in self.active_connections.items():
            agent_id = self.connection_agents.get(connection_id)
            
            if agent_id != exclude_agent:
                try:
                    await websocket.send_json(message)
                except Exception as e:
                    logger.error(f"Failed to broadcast to agent {agent_id}: {e}")
                    disconnected.append(connection_id)
        
        # Clean up disconnected clients
        for connection_id in disconnected:
            self.disconnect(connection_id)
    
    def register_message_handler(self, message_type: str, handler: Callable):
        """Register handler for specific message types"""
        self.message_handlers[message_type] = handler
    
    async def handle_message(self, websocket: WebSocket, data: dict):
        """Handle incoming WebSocket messages"""
        message_type = data.get("type")
        
        if message_type in self.message_handlers:
            await self.message_handlers[message_type](websocket, data)
        else:
            logger.warning(f"No handler for message type: {message_type}")

class AgentWebSocketManager:
    """Manages WebSocket connections for AI agents"""
    def __init__(self, communication_service):
        self.connection_manager = ConnectionManager()
        self.communication_service = communication_service
        
        # Register message handlers
        self.connection_manager.register_message_handler("register", self.handle_register)
        self.connection_manager.register_message_handler("message", self.handle_message)
        self.connection_manager.register_message_handler("collaboration", self.handle_collaboration)
        self.connection_manager.register_message_handler("ping", self.handle_ping)
    
    async def handle_register(self, websocket: WebSocket, data: dict):
        """Handle agent registration via WebSocket"""
        agent_id = data.get("agent_id")
        agent_info = data.get("agent_info", {})
        
        if not agent_id:
            await websocket.send_json({
                "type": "error",
                "error": "agent_id is required"
            })
            return
        
        connection_id = await self.connection_manager.connect(websocket, agent_id)
        
        # Register agent in communication service
        await self.communication_service.register_agent(agent_id, {
            **agent_info,
            "connection_id": connection_id,
            "connected_at": datetime.utcnow().isoformat()
        })
        
        await websocket.send_json({
            "type": "registered",
            "agent_id": agent_id,
            "timestamp": datetime.utcnow().isoformat(),
            "message": "Successfully registered in agent network"
        })
        
        # Notify other agents about new agent
        await self.connection_manager.broadcast({
            "type": "agent_joined",
            "agent_id": agent_id,
            "agent_info": agent_info,
            "timestamp": datetime.utcnow().isoformat()
        }, exclude_agent=agent_id)
    
    async def handle_message(self, websocket: WebSocket, data: dict):
        """Handle agent-to-agent messages"""
        sender_id = self.connection_manager.connection_agents.get(str(id(websocket)))
        receiver_id = data.get("receiver_id")
        content = data.get("content")
        message_type = data.get("message_type", "text")
        
        if not all([sender_id, receiver_id, content]):
            await websocket.send_json({
                "type": "error",
                "error": "Missing required fields"
            })
            return
        
        # Send message through communication service
        success = await self.communication_service.send_message(
            sender_id=sender_id,
            receiver_id=receiver_id,
            content=content,
            message_type=message_type
        )
        
        if success:
            await websocket.send_json({
                "type": "message_sent",
                "receiver_id": receiver_id,
                "timestamp": datetime.utcnow().isoformat()
            })
        else:
            await websocket.send_json({
                "type": "error",
                "error": "Failed to send message"
            })
    
    async def handle_collaboration(self, websocket: WebSocket, data: dict):
        """Handle collaboration requests"""
        agent_id = self.connection_manager.connection_agents.get(str(id(websocket)))
        action = data.get("action")
        
        if action == "create_conversation":
            participant_ids = data.get("participants", [])
            topic = data.get("topic", "")
            
            # Ensure the requesting agent is included
            if agent_id not in participant_ids:
                participant_ids.append(agent_id)
            
            conversation_id = await self.communication_service.create_conversation(
                participant_ids, topic
            )
            
            await websocket.send_json({
                "type": "conversation_created",
                "conversation_id": conversation_id,
                "participants": participant_ids,
                "topic": topic
            })
        
        elif action == "join_conversation":
            conversation_id = data.get("conversation_id")
            
            if conversation_id:
                await self.communication_service.add_to_conversation(
                    conversation_id, agent_id
                )
                
                await websocket.send_json({
                    "type": "joined_conversation",
                    "conversation_id": conversation_id
                })
    
    async def handle_ping(self, websocket: WebSocket, data: dict):
        """Handle ping/pong for connection keep-alive"""
        await websocket.send_json({
            "type": "pong",
            "timestamp": datetime.utcnow().isoformat()
        })
    
    async def start_websocket_listener(self, websocket: WebSocket):
        """Start listening for WebSocket messages"""
        connection_id = str(id(websocket))
        
        try:
            while True:
                data = await websocket.receive_json()
                await self.connection_manager.handle_message(websocket, data)
                
        except WebSocketDisconnect:
            logger.info(f"WebSocket disconnected: {connection_id}")
            self.connection_manager.disconnect(connection_id)
            
            # Unregister agent from communication service
            agent_id = self.connection_manager.connection_agents.get(connection_id)
            if agent_id:
                await self.communication_service.unregister_agent(agent_id)
                
                # Notify other agents
                await self.connection_manager.broadcast({
                    "type": "agent_left",
                    "agent_id": agent_id,
                    "timestamp": datetime.utcnow().isoformat()
                })
        
        except Exception as e:
            logger.error(f"WebSocket error: {e}")
            self.connection_manager.disconnect(connection_id)