from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="Agentic AI Platform", version="2.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Agentic AI Platform Phase 2", "status": "ready"}

@app.get("/health")
async def health():
    return {"status": "healthy", "phase": 2}

if __name__ == "__main__":
    print("?? Starting Phase 2...")
    uvicorn.run(app, host="127.0.0.1", port=8001, reload=True)
