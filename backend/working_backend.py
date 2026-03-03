# working_backend.py - No database, no errors, just works
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

app = FastAPI(title="Agentic AI", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory storage
agents = []

@app.get("/")
def home():
    return {"message": "Agentic AI Platform", "status": "running"}

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "time": datetime.now().isoformat(),
        "agents": len(agents)
    }

@app.get("/agents")
def get_agents():
    return {"agents": agents, "count": len(agents)}

@app.post("/agents")
def create_agent():
    import uuid
    agent = {
        "id": f"agent_{uuid.uuid4().hex[:8]}",
        "name": "Research Assistant",
        "type": "researcher",
        "created": datetime.now().isoformat()
    }
    agents.append(agent)
    return {"agent": agent, "message": "Created"}

if __name__ == "__main__":
    import uvicorn
    print("STARTING: http://localhost:8000")
    print("HEALTH:   http://localhost:8000/health")
    uvicorn.run(app, host="0.0.0.0", port=8000)
