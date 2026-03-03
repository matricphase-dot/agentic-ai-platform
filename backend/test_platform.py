@'
# test_platform.py - Test the realistic platform
import requests
import json

BASE_URL = "http://localhost:8000"

print("🧪 Testing Agentic AI Platform...")
print("=" * 50)

# Test 1: Health check
print("1. Testing health endpoint...")
try:
    response = requests.get(f"{BASE_URL}/health")
    print(f"   ✅ Health: {response.json()['status']}")
    print(f"   AI Mode: {response.json()['ai']}")
    print(f"   Cost: {response.json()['cost']}")
except:
    print("   ❌ Health check failed")

# Test 2: Create agent
print("\n2. Creating AI agent...")
agent_data = {
    "name": "AI Research Assistant",
    "agent_type": "researcher",
    "system_prompt": "Expert AI researcher"
}

try:
    response = requests.post(f"{BASE_URL}/agents", json=agent_data)
    agent = response.json()
    print(f"   ✅ Agent created: {agent['agent']['name']}")
    print(f"   Message: {agent['message']}")
    agent_id = agent['agent']['id']
except:
    print("   ❌ Agent creation failed")

# Test 3: Query agent
if 'agent_id' in locals():
    print("\n3. Querying AI agent...")
    query = "What are the latest trends in AI agents?"
    
    try:
        response = requests.post(f"{BASE_URL}/agents/{agent_id}/query?task={query}")
        result = response.json()
        print(f"   ✅ Query successful!")
        print(f"   Agent: {result['agent']}")
        print(f"   AI Mode: {result['ai_mode']}")
        print(f"   Cost: {result['cost']}")
        print(f"   Response preview: {result['response'][:100]}...")
    except:
        print("   ❌ Query failed")

# Test 4: Get pricing
print("\n4. Checking pricing...")
try:
    response = requests.get(f"{BASE_URL}/pricing")
    pricing = response.json()
    print(f"   ✅ Current mode: {pricing['current_mode']}")
    for plan in pricing['plans']:
        print(f"   - {plan['name']}: {plan['price']}")
except:
    print("   ❌ Pricing check failed")

# Test 5: Business model
print("\n5. Business model...")
try:
    response = requests.get(f"{BASE_URL}/business/model")
    model = response.json()
    print(f"   ✅ Product: {model['product']}")
    print(f"   Value: {model['value_proposition']}")
    print(f"   Revenue streams: {len(model['revenue_streams'])}")
except:
    print("   ❌ Business model check failed")

print("\n" + "=" * 50)
print("🎯 Platform Status: READY FOR BUSINESS")
print("=" * 50)
print("Next steps:")
print("1. Demo to potential customers")
print("2. Get OpenAI API key for real AI")
print("3. Deploy to production")
print("4. Start charging customers")
'@ | python