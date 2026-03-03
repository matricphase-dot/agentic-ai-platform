# backend/test_simple_db.py - Quick database test
import sqlite3
from datetime import datetime

# Create SQLite database
conn = sqlite3.connect('agentic_simple.db')
cursor = conn.cursor()

# Create tables
cursor.execute('''
CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    name TEXT,
    type TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    name TEXT,
    agent_ids TEXT,  -- JSON string of agent IDs
    created_at TIMESTAMP
)
''')

# Insert test data
import json
import uuid

agent_id = f"agent_{uuid.uuid4().hex[:8]}"
cursor.execute(
    "INSERT INTO agents (id, name, type, created_at) VALUES (?, ?, ?, ?)",
    (agent_id, "Test Agent", "researcher", datetime.now().isoformat())
)

# Query data
cursor.execute("SELECT * FROM agents")
agents = cursor.fetchall()
print(f"Agents in database: {len(agents)}")
for agent in agents:
    print(f"  - {agent[1]} ({agent[2]})")

conn.commit()
conn.close()

print("\n✅ SQLite database is working!")
print("💡 Use this connection string in your .env file:")
print("   DATABASE_URL=sqlite:///./agentic_simple.db")
