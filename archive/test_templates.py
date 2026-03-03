# test_templates.py
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
import uvicorn
import os

app = FastAPI()

# Create templates directory if not exists
os.makedirs("templates", exist_ok=True)

# Create a simple test template
test_html = """
<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
<h1>Test Template Working!</h1>
<p>If you see this, templates are working.</p>
</body>
</html>
"""

# Write test template
with open("templates/test.html", "w") as f:
    f.write(test_html)

# Setup templates
templates = Jinja2Templates(directory="templates")

@app.get("/")
async def root(request: Request):
    return templates.TemplateResponse("test.html", {"request": request})

@app.get("/raw")
async def raw():
    return HTMLResponse(content=test_html)

if __name__ == "__main__":
    print("Test server running on http://localhost:5001")
    print("Test / for template, /raw for raw HTML")
    uvicorn.run(app, host="0.0.0.0", port=5001)