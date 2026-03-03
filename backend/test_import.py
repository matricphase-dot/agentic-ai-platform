import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

print("Testing imports...")

try:
    # Test basic imports
    import fastapi
    print("✅ FastAPI import successful")
    
    # Try to import our app
    from app.main import app
    print("✅ App import successful")
    
    print(f"\nApp Info:")
    print(f"  Title: {app.title}")
    print(f"  Version: {app.version}")
    
    print(f"\nAvailable routes:")
    for route in app.routes:
        if hasattr(route, "path"):
            methods = getattr(route, "methods", ["GET"])
            method = list(methods)[0] if methods else "GET"
            print(f"  {method} {route.path}")
    
    print("\n✅ All imports successful!")
    
except Exception as e:
    print(f"\n❌ Import failed: {e}")
    import traceback
    traceback.print_exc()
