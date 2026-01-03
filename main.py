from fastapi import FastAPI
import os

app = FastAPI(title="Agentic AI Platform")

@app.get("/")
def root():
    return {"message": "Agentic AI Platform", "status": "online"}

@app.get("/api/health")
def health():
    return {"status": "healthy", "version": "1.0.0"}

@app.get("/api/workflows")
def workflows():
    return {"workflows": ["file_organizer", "data_extractor"]}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)