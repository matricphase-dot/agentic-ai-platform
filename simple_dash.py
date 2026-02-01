from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

app = FastAPI()

# CRITICAL: Enable CORS so browser can talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "online", "step": "phase2_test"}

@app.get("/dashboard")
def get_dashboard():
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Diagnostic Dashboard</title>
        <style>
            body { font-family: Arial; padding: 40px; text-align: center; }
            .btn { padding: 15px 30px; font-size: 16px; margin: 20px; cursor: pointer; background: #4CAF50; color: white; border: none; border-radius: 5px; }
            #result { margin-top: 30px; padding: 20px; background: #f0f0f0; border-radius: 5px; min-height: 50px; }
        </style>
    </head>
    <body>
        <h1>🧪 Diagnostic Dashboard</h1>
        <p>If this page loads and the button works, your frontend is fine.</p>
        
        <button class="btn" onclick="testConnection()">✅ TEST BACKEND CONNECTION</button>
        
        <div id="result">Test results will appear here.</div>
        
        <script>
            async function testConnection() {
                let resultDiv = document.getElementById('result');
                resultDiv.innerHTML = '<em>Testing... Please wait.</em>';
                
                try {
                    // Test 1: Fetch root API
                    let response = await fetch('/');
                    let data = await response.json();
                    resultDiv.innerHTML = `<strong>✅ API Root Success:</strong> <code>${JSON.stringify(data)}</code><br>`;
                    
                    // Test 2: Simulate a desktop agent call
                    resultDiv.innerHTML += '<br><em>Testing simulated agent call...</em>';
                    await new Promise(r => setTimeout(r, 500));
                    
                    // Simulate a successful response
                    resultDiv.innerHTML += `<br><strong>✅ Simulated Agent Response:</strong> Connection to backend is functional.`;
                    
                } catch (error) {
                    resultDiv.innerHTML = `<strong>❌ FAILED:</strong> ${error}<br><br>
                                           This means the JavaScript in your browser cannot talk to the backend server. 
                                           The most common cause is a <strong>CORS issue</strong> (already enabled in this test) 
                                           or the server isn't running.`;
                    console.error("Test Error:", error);
                }
            }
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

if __name__ == "__main__":
    print("="*60)
    print("CRITICAL DIAGNOSTIC SERVER STARTING")
    print("URL: http://localhost:8080/dashboard")
    print("="*60)
    uvicorn.run(app, host="0.0.0.0", port=8080, log_level="info") 
