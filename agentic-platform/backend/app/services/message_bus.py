# backend/app/services/message_bus.py
import asyncio
import json
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, Callable
import redis
import logging
from enum import Enum

logger = logging.getLogger(__name__)

class MessageType(Enum):
    """Types of messages agents can send"""
    TEXT = "text"
    TASK = "task"
    RESULT = "result"
    ERROR = "error"
    BROADCAST = "broadcast"
    COLLABORATION = "collaboration"

class AgentMessage:
    """Standardized message format for agent communication"""
    def __init__(
        self,
        sender_id: str,
        receiver_id: Optional[str] = None,
        message_type: MessageType = MessageType.TEXT,
        content: Any = None,
        metadata: Optional[Dict] = None
    ):
        self.id = str(uuid.uuid4())
        self.sender_id = sender_id
        self.receiver_id = receiver_id
        self.message_type = message_type
        self.content = content
        self.metadata = metadata or {}
        self.timestamp = datetime.utcnow().isoformat()
        self.delivered = False
    
    def to_dict(self):
        return {
            "id": self.id,
            "sender_id": self.sender_id,
            "receiver_id": self.receiver_id,
            "message_type": self.message_type.value,
            "content": self.content,
            "metadata": self.metadata,
            "timestamp": self.timestamp,
            "delivered": self.delivered
        }
    
    @classmethod
    def from_dict(cls, data: Dict):
        message = cls(
            sender_id=data["sender_id"],
            receiver_id=data.get("receiver_id"),
            message_type=MessageType(data["message_type"]),
            content=data["content"],
            metadata=data.get("metadata", {})
        )
        message.id = data["id"]
        message.timestamp = data["timestamp"]
        message.delivered = data.get("delivered", False)
        return message

class MessageBus:
    """Central message bus for agent communication"""
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis = redis.Redis.from_url(redis_url, decode_responses=True)
        self.subscribers: Dict[str, Dict[str, Callable]] = {}
        self.agent_channels: Dict[str, str] = {}  # agent_id -> channel
        
    async def publish(self, channel: str, message: AgentMessage):
        """Publish a message to a channel"""
        try:
            message_data = json.dumps(message.to_dict())
            self.redis.publish(channel, message_data)
            logger.info(f"Published message {message.id} to channel {channel}")
            return True
        except Exception as e:
            logger.error(f"Failed to publish message: {e}")
            return False
    
    async def subscribe(self, channel: str, agent_id: str, callback: Callable):
        """Subscribe an agent to a channel"""
        if channel not in self.subscribers:
            self.subscribers[channel] = {}
        
        self.subscribers[channel][agent_id] = callback
        self.agent_channels[agent_id] = channel
        logger.info(f"Agent {agent_id} subscribed to channel {channel}")
    
    async def unsubscribe(self, channel: str, agent_id: str):
        """Unsubscribe an agent from a channel"""
        if channel in self.subscribers and agent_id in self.subscribers[channel]:
            del self.subscribers[channel][agent_id]
            if agent_id in self.agent_channels:
                del self.agent_channels[agent_id]
            logger.info(f"Agent {agent_id} unsubscribed from channel {channel}")
    
    async def send_direct(self, sender_id: str, receiver_id: str, message: AgentMessage):
        """Send a direct message to a specific agent"""
        if receiver_id not in self.agent_channels:
            logger.warning(f"Agent {receiver_id} not connected")
            return False
        
        channel = self.agent_channels[receiver_id]
        return await self.publish(channel, message)
    
    async def broadcast(self, sender_id: str, message: AgentMessage):
        """Broadcast a message to all connected agents"""
        message.message_type = MessageType.BROADCAST
        for channel in self.subscribers.keys():
            await self.publish(channel, message)
    
    async def start_listening(self):
        """Start listening for messages on all channels"""
        pubsub = self.redis.pubsub()
        channels = list(self.subscribers.keys())
        pubsub.subscribe(*channels)
        
        for message in pubsub.listen():
            if message["type"] == "message":
                await self._process_message(message)
    
    async def _process_message(self, message: Dict):
        """Process incoming message and deliver to subscribers"""
        try:
            message_data = json.loads(message["data"])
            agent_message = AgentMessage.from_dict(message_data)
            channel = message["channel"]
            
            if channel in self.subscribers:
                for agent_id, callback in self.subscribers[channel].items():
                    # Don't send message back to sender
                    if agent_id != agent_message.sender_id:
                        await callback(agent_message)
                        logger.info(f"Delivered message {agent_message.id} to agent {agent_id}")
        
        except Exception as e:
            logger.error(f"Failed to process message: {e}")

class AgentCommunicationService:
    """High-level service for agent communication"""
    def __init__(self):
        self.message_bus = MessageBus()
        self.agent_registry: Dict[str, Dict] = {}  # agent_id -> agent_info
        self.conversations: Dict[str, list] = {}   # conversation_id -> messages
        
    async def register_agent(self, agent_id: str, agent_info: Dict):
        """Register an agent in the communication network"""
        self.agent_registry[agent_id] = {
            **agent_info,
            "registered_at": datetime.utcnow().isoformat(),
            "status": "online"
        }
        
        # Create personal channel for agent
        channel = f"agent:{agent_id}"
        await self.message_bus.subscribe(channel, agent_id, self._handle_agent_message)
        
        # Subscribe to broadcast channel
        await self.message_bus.subscribe("broadcast", agent_id, self._handle_broadcast_message)
        
        logger.info(f"Agent {agent_id} registered in communication network")
        return True
    
    async def unregister_agent(self, agent_id: str):
        """Unregister an agent from the network"""
        if agent_id in self.agent_registry:
            del self.agent_registry[agent_id]
            await self.message_bus.unsubscribe(f"agent:{agent_id}", agent_id)
            await self.message_bus.unsubscribe("broadcast", agent_id)
            logger.info(f"Agent {agent_id} unregistered")
    
    async def send_message(self, sender_id: str, receiver_id: str, content: Any, 
                          message_type: MessageType = MessageType.TEXT):
        """Send a message from one agent to another"""
        message = AgentMessage(
            sender_id=sender_id,
            receiver_id=receiver_id,
            message_type=message_type,
            content=content
        )
        
        return await self.message_bus.send_direct(sender_id, receiver_id, message)
    
    async def create_conversation(self, agent_ids: list, topic: str = ""):
        """Create a conversation between multiple agents"""
        conversation_id = str(uuid.uuid4())
        self.conversations[conversation_id] = {
            "id": conversation_id,
            "agents": agent_ids,
            "topic": topic,
            "created_at": datetime.utcnow().isoformat(),
            "messages": []
        }
        
        # Notify all agents about the conversation
        for agent_id in agent_ids:
            await self.send_message(
                sender_id="system",
                receiver_id=agent_id,
                content={
                    "type": "conversation_invite",
                    "conversation_id": conversation_id,
                    "topic": topic,
                    "participants": agent_ids
                },
                message_type=MessageType.COLLABORATION
            )
        
        return conversation_id
    
    async def add_to_conversation(self, conversation_id: str, agent_id: str):
        """Add an agent to an existing conversation"""
        if conversation_id in self.conversations:
            if agent_id not in self.conversations[conversation_id]["agents"]:
                self.conversations[conversation_id]["agents"].append(agent_id)
                
                # Notify existing participants
                for participant in self.conversations[conversation_id]["agents"]:
                    if participant != agent_id:
                        await self.send_message(
                            sender_id="system",
                            receiver_id=participant,
                            content={
                                "type": "participant_joined",
                                "conversation_id": conversation_id,
                                "new_participant": agent_id
                            },
                            message_type=MessageType.COLLABORATION
                        )
    
    async def _handle_agent_message(self, message: AgentMessage):
        """Handle incoming messages for agents"""
        # Store message in conversation if it has a conversation_id
        if message.metadata.get("conversation_id"):
            conv_id = message.metadata["conversation_id"]
            if conv_id in self.conversations:
                self.conversations[conv_id]["messages"].append(message.to_dict())
        
        # Update agent registry with last activity
        if message.sender_id in self.agent_registry:
            self.agent_registry[message.sender_id]["last_activity"] = datetime.utcnow().isoformat()
    
    async def _handle_broadcast_message(self, message: AgentMessage):
        """Handle broadcast messages"""
        logger.info(f"Agent {message.sender_id} broadcasted: {message.content}")
    
    def get_agent_info(self, agent_id: str) -> Optional[Dict]:
        """Get information about a registered agent"""
        return self.agent_registry.get(agent_id)
    
    def list_agents(self, filter_status: Optional[str] = None) -> list:
        """List all registered agents"""
        agents = list(self.agent_registry.values())
        if filter_status:
            agents = [a for a in agents if a.get("status") == filter_status]
        return agents
    
    def get_conversation(self, conversation_id: str) -> Optional[Dict]:
        """Get a conversation by ID"""
        return self.conversations.get(conversation_id)