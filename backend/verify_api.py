import requests
import json

url = "https://agenticai-backend-xao9.onrender.com/api/marketplace"
response = requests.get(url)
data = response.json()

# Check first agent
agent = data['data']['agents'][0]
print(f"Agent Name: {agent['name']}")
print(f"Has systemPrompt: {'systemPrompt' in agent}")
if 'systemPrompt' in agent:
    print(f"System Prompt Value: {agent['systemPrompt'][:50]}...")

# Print keys of the agent object
print(f"Keys in agent object: {list(agent.keys())}")
