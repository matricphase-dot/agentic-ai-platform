# test_simple.py - SIMPLE WORKING DASHBOARD
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
import uvicorn

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Go to /dashboard"}

@app.get("/dashboard")
async def dashboard():
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Agentic AI - TEST</title>
        <style>
            body { font-family: Arial; padding: 40px; }
            h1 { color: #4a6fa5; }
            button { background: #4a6fa5; color: white; padding: 15px; border: none; border-radius: 5px; }
        </style>
    </head>
    <body>
        <h1>✅ TEST DASHBOARD IS WORKING!</h1>
        <p>If you see this, the dashboard is working.</p>
        <button onclick="alert('Test button works!')">Test Button</button>
        <p><a href="/api/docs">API Docs</a> | <a href="/health">Health Check</a></p>
    </body>
    </html>
    """
    return HTMLResponse(content=html)

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "Test Server"}

if __name__ == "__main__":
    print("\n" + "="*60)
    print("    TEST SERVER - DASHBOARD CHECK")
    print("="*60)
    print("    Dashboard: http://localhost:5001/dashboard")
    print("    Root: http://localhost:5001/")
    print("    Health: http://localhost:5001/health")
    print("="*60 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=5001)