from fastapi import FastAPI 
import uvicorn 
import os 
 
app = FastAPI() 
 
@app.get("/") 
def root(): return {"message": "Agentic AI Platform", "status": "online"} 
 
@app.get("/api/health") 
def health(): return {"status": "healthy"} 
 
if __name__ == "__main__": 
    port = int(os.environ.get("PORT", 8080)) 
    uvicorn.run("temp_main:app", host="0.0.0.0", port=port) 
