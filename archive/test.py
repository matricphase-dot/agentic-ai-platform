# test.py - ABSOLUTELY SIMPLE TEST
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
import uvicorn

app = FastAPI()

# SIMPLE HTML DASHBOARD
html = """
<!DOCTYPE html>
<html>
<head><title>TEST PAGE</title>
<style>
body { font-family: Arial; padding: 40px; background: #f0f0f0; }
h1 { color: red; font-size: 48px; }
button { padding: 20px; font-size: 20px; background: blue; color: white; }
</style>
</head>
<body>
    <h1>🔥 THIS IS A TEST PAGE - If you see this, it's WORKING! 🔥</h1>
    <p>Date: 2024</p>
    <button onclick="alert('Button works!')">TEST BUTTON</button>
    <p><a href="/api">Go to API</a></p>
</body>
</html>
"""

@app.get("/")
def home():
    return HTMLResponse(content=html)

@app.get("/api")
def api():
    return {"message": "This is API", "status": "working"}

if __name__ == "__main__":
    print("\n" + "="*70)
    print("    🚨 TEST SERVER - MUST SHOW RED TEXT ABOVE!")
    print("="*70)
    print("    📍 URL: http://localhost:5000")
    print("    📍 If you see JSON/API, something is WRONG!")
    print("="*70 + "\n")
    
    # Force run on port 5000 with no reload
    uvicorn.run(app, host="0.0.0.0", port=5000, reload=False, log_level="error")