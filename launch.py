#!/usr/bin/env python3
import os
import subprocess
import sys

print("="*60)
print("AGENTIC AI PLATFORM v4.0.0 - Launcher")
print("="*60)
print()
print("Starting platform with all features...")
print()

# Change to CORE directory
os.chdir(os.path.join(os.path.dirname(__file__), "CORE"))

# Start the server
try:
    subprocess.run([sys.executable, "main.py"])
except KeyboardInterrupt:
    print("\nPlatform stopped.")
except Exception as e:
    print(f"Error starting platform: {e}")
    input("Press Enter to exit...")
