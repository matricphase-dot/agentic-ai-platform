import os
import sys

print("🚀 Setting up Agentic AI Platform...")

# Create directories
for dir in ['templates', 'static/css', 'static/js', 'database']:
    os.makedirs(dir, exist_ok=True)
    print(f"✓ Created directory: {dir}")

print("\n✅ Platform setup complete!")
print("\n📋 Next steps:")
print("1. Copy the code into respective files")
print("2. Run: python server_production.py")
print("3. Visit: http://localhost:5000/dashboard")
print("\n🎯 Your platform will be fully functional!")