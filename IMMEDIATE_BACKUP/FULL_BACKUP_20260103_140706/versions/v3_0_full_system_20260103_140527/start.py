import uvicorn 
from complete_agentic_system_final import app 
print("?? Starting on port 8080...") 
print("?? Open: http://localhost:8080") 
print("?? Login: admin / admin123") 
uvicorn.run(app, host="0.0.0.0", port=8080) 
