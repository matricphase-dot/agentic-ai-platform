from fastapi import FastAPI
from fastapi.responses import HTMLResponse
import uvicorn

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/simple")
def simple_page():
    return HTMLResponse("<h1>Basic Page</h1><p>If you see this, server works.</p>")

if __name__ == "__main__":
    print("Test server starting on http://localhost:8080")
    uvicorn.run(app, host="0.0.0.0", port=8080) 
