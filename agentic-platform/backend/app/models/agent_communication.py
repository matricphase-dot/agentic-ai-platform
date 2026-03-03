# backend/app/models/agent_communication.py
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Text, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class AgentConversation(Base):
    __tablename__ = "agent_conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String, unique=True, index=True)  # UUID
    topic = Column(String, nullable=True)
    
    # Participants (stored as JSON list of agent IDs)
    participants = Column(JSON, default=list)
    participant_count = Column(Integer, default=0)
    
    # Status
    status = Column(String, default="active")  # active, archived, completed
    is_public = Column(Boolean, default=False)
    
    # Statistics
    message_count = Column(Integer, default=0)
    last_message_at = Column(DateTime, nullable=True)
    
    # Relationships
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    user = relationship("User", foreign_keys=[created_by])
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "conversation_id": self.conversation_id,
            "topic": self.topic,
            "participants": self.participants,
            "participant_count": self.participant_count,
            "status": self.status,
            "is_public": self.is_public,
            "message_count": self.message_count,
            "last_message_at": self.last_message_at.isoformat() if self.last_message_at else None,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class AgentMessageLog(Base):
    __tablename__ = "agent_message_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(String, unique=True, index=True)  # UUID from AgentMessage
    
    # Message details
    sender_id = Column(String, nullable=False, index=True)
    receiver_id = Column(String, nullable=True, index=True)
    conversation_id = Column(String, nullable=True, index=True)
    
    # Message content
    message_type = Column(String, nullable=False)  # text, task, result, error, broadcast
    content = Column(JSON)  # Can be any JSON-serializable data
    metadata = Column(JSON, default=dict)
    
    # Delivery status
    delivered = Column(Boolean, default=False)
    read = Column(Boolean, default=False)
    delivery_time = Column(DateTime, nullable=True)
    read_time = Column(DateTime, nullable=True)
    
    # Relationships
    conversation = relationship("AgentConversation", foreign_keys=[conversation_id], 
                               primaryjoin="AgentMessageLog.conversation_id == AgentConversation.conversation_id",
                               viewonly=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "message_id": self.message_id,
            "sender_id": self.sender_id,
            "receiver_id": self.receiver_id,
            "conversation_id": self.conversation_id,
            "message_type": self.message_type,
            "content": self.content,
            "metadata": self.metadata,
            "delivered": self.delivered,
            "read": self.read,
            "delivery_time": self.delivery_time.isoformat() if self.delivery_time else None,
            "read_time": self.read_time.isoformat() if self.read_time else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class AgentNetworkNode(Base):
    __tablename__ = "agent_network_nodes"
    
    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(String, unique=True, index=True)
    
    # Node information
    agent_name = Column(String, nullable=False)
    agent_type = Column(String, nullable=False)  # container, virtual, external
    capabilities = Column(JSON, default=list)    # List of capabilities
    status = Column(String, default="offline")   # online, offline, busy, error
    
    # Network information
    ip_address = Column(String, nullable=True)
    port = Column(Integer, nullable=True)
    last_ping = Column(DateTime, nullable=True)
    connection_id = Column(String, nullable=True)  # WebSocket connection ID
    
    # Statistics
    messages_sent = Column(Integer, default=0)
    messages_received = Column(Integer, default=0)
    collaborations_count = Column(Integer, default=0)
    
    # Relationships
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user = relationship("User", foreign_keys=[user_id])
    
    # Timestamps
    registered_at = Column(DateTime, default=datetime.utcnow)
    last_active = Column(DateTime, nullable=True)
    
    def to_dict(self):
        return {
            "id": self.id,
            "agent_id": self.agent_id,
            "agent_name": self.agent_name,
            "agent_type": self.agent_type,
            "capabilities": self.capabilities,
            "status": self.status,
            "ip_address": self.ip_address,
            "port": self.port,
            "last_ping": self.last_ping.isoformat() if self.last_ping else None,
            "connection_id": self.connection_id,
            "messages_sent": self.messages_sent,
            "messages_received": self.messages_received,
            "collaborations_count": self.collaborations_count,
            "user_id": self.user_id,
            "registered_at": self.registered_at.isoformat() if self.registered_at else None,
            "last_active": self.last_active.isoformat() if self.last_active else None
        }