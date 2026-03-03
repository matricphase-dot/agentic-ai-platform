"""
Agent Memory System - Persists agent states and histories
"""
from typing import Dict, Any, List, Optional
import json
from datetime import datetime
import sqlite3
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class AgentMemory:
    """Manages persistence of agent sessions and memories"""
    
    def __init__(self, db_path: Optional[str] = None):
        self.db_path = db_path or "agentic_ai.db"
        self._init_database()
    
    def _init_database(self):
        """Initialize database tables for agent memory"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Create sessions table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS agent_sessions (
                    session_id TEXT PRIMARY KEY,
                    workflow_id TEXT,
                    user_id TEXT,
                    status TEXT,
                    shared_state TEXT,
                    agent_history TEXT,
                    errors TEXT,
                    metadata TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Create memory entries table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS agent_memory_entries (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT,
                    entry_type TEXT,
                    entry_data TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (session_id) REFERENCES agent_sessions (session_id)
                )
            ''')
            
            conn.commit()
            conn.close()
            logger.info("Agent memory database initialized")
            
        except Exception as e:
            logger.error(f"Failed to initialize agent memory database: {str(e)}")
            # Fallback to in-memory storage
            self._sessions = {}
            self._memories = {}
    
    async def save_session(self, session_id: str, session_data: Dict[str, Any]) -> bool:
        """Save or update a session"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Check if session exists
            cursor.execute("SELECT session_id FROM agent_sessions WHERE session_id = ?", (session_id,))
            exists = cursor.fetchone()
            
            # Prepare data
            shared_state = json.dumps(session_data.get("shared_state", {}))
            agent_history = json.dumps(session_data.get("agent_history", []))
            errors = json.dumps(session_data.get("errors", []))
            metadata = json.dumps(session_data.get("metadata", {}))
            
            if exists:
                # Update existing session
                cursor.execute('''
                    UPDATE agent_sessions 
                    SET shared_state = ?, agent_history = ?, errors = ?, metadata = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE session_id = ?
                ''', (shared_state, agent_history, errors, metadata, session_id))
            else:
                # Insert new session
                cursor.execute('''
                    INSERT INTO agent_sessions 
                    (session_id, workflow_id, user_id, status, shared_state, agent_history, errors, metadata)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    session_id,
                    session_data.get("workflow_id"),
                    session_data.get("metadata", {}).get("user_id", "unknown"),
                    session_data.get("metadata", {}).get("status", "pending"),
                    shared_state,
                    agent_history,
                    errors,
                    metadata
                ))
            
            conn.commit()
            conn.close()
            return True
            
        except Exception as e:
            logger.error(f"Failed to save session {session_id}: {str(e)}")
            return False
    
    async def load_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Load a session by ID"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM agent_sessions WHERE session_id = ?", (session_id,))
            row = cursor.fetchone()
            
            if row:
                session_data = {
                    "session_id": row["session_id"],
                    "workflow_id": row["workflow_id"],
                    "shared_state": json.loads(row["shared_state"]) if row["shared_state"] else {},
                    "agent_history": json.loads(row["agent_history"]) if row["agent_history"] else [],
                    "errors": json.loads(row["errors"]) if row["errors"] else [],
                    "metadata": json.loads(row["metadata"]) if row["metadata"] else {}
                }
                conn.close()
                return session_data
            
            conn.close()
            return None
            
        except Exception as e:
            logger.error(f"Failed to load session {session_id}: {str(e)}")
            return None
    
    async def add_to_history(self, session_id: str, entry: Dict[str, Any]) -> bool:
        """Add an entry to agent history"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            entry_data = json.dumps(entry)
            
            cursor.execute('''
                INSERT INTO agent_memory_entries (session_id, entry_type, entry_data)
                VALUES (?, ?, ?)
            ''', (session_id, entry.get("type", "unknown"), entry_data))
            
            conn.commit()
            conn.close()
            return True
            
        except Exception as e:
            logger.error(f"Failed to add to history for session {session_id}: {str(e)}")
            return False
    
    async def get_session_history(self, session_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        """Get history entries for a session"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT entry_data FROM agent_memory_entries 
                WHERE session_id = ? 
                ORDER BY timestamp DESC 
                LIMIT ?
            ''', (session_id, limit))
            
            rows = cursor.fetchall()
            history = []
            for row in rows:
                try:
                    history.append(json.loads(row["entry_data"]))
                except:
                    pass
            
            conn.close()
            return history
            
        except Exception as e:
            logger.error(f"Failed to get history for session {session_id}: {str(e)}")
            return []
