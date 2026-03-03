"""
Memory Store - Stores agent memories and context
"""
import json
import sqlite3
from datetime import datetime
from typing import Dict, Any, List, Optional
import logging

logger = logging.getLogger(__name__)

class MemoryStore:
    def __init__(self, db_path: str = "database/memory.db"):
        self.db_path = db_path
        self._init_database()
        logger.info("Memory Store initialized")
    
    def _init_database(self):
        """Initialize database tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS memories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                agent_id TEXT NOT NULL,
                user_id INTEGER,
                memory_type TEXT,
                content TEXT,
                metadata TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS contexts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                agent_id TEXT,
                context_data TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        conn.commit()
        conn.close()
    
    def store_memory(self, agent_id: str, content: Dict[str, Any], user_id: int = 0, 
                     memory_type: str = "general", metadata: Dict[str, Any] = None):
        """Store a memory"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO memories (agent_id, user_id, memory_type, content, metadata)
            VALUES (?, ?, ?, ?, ?)
        """, (agent_id, user_id, memory_type, json.dumps(content), 
              json.dumps(metadata or {})))
        
        conn.commit()
        conn.close()
        return cursor.lastrowid
    
    def get_memories(self, agent_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get memories for an agent"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM memories 
            WHERE agent_id = ? 
            ORDER BY created_at DESC 
            LIMIT ?
        """, (agent_id, limit))
        
        rows = cursor.fetchall()
        conn.close()
        
        memories = []
        for row in rows:
            memories.append({
                "id": row["id"],
                "agent_id": row["agent_id"],
                "user_id": row["user_id"],
                "memory_type": row["memory_type"],
                "content": json.loads(row["content"]),
                "metadata": json.loads(row["metadata"]),
                "created_at": row["created_at"]
            })
        
        return memories
    
    def store_context(self, session_id: str, context_data: Dict[str, Any], agent_id: str = None):
        """Store session context"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Check if context exists
        cursor.execute("SELECT id FROM contexts WHERE session_id = ?", (session_id,))
        existing = cursor.fetchone()
        
        if existing:
            cursor.execute("""
                UPDATE contexts 
                SET context_data = ?, agent_id = ?, updated_at = CURRENT_TIMESTAMP
                WHERE session_id = ?
            """, (json.dumps(context_data), agent_id, session_id))
        else:
            cursor.execute("""
                INSERT INTO contexts (session_id, agent_id, context_data)
                VALUES (?, ?, ?)
            """, (session_id, agent_id, json.dumps(context_data)))
        
        conn.commit()
        conn.close()