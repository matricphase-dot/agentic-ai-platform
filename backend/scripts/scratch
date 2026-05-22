import requests
import json

urls = [
    "https://agenticai-backend-xao9.onrender.com/api/marketplace",
    "https://agentic-ai-platform-tajr.onrender.com/api/marketplace"
]

for url in urls:
    try:
        print(f"\nChecking URL: {url}")
        response = requests.get(url, timeout=30)
        if response.status_code != 200:
            print(f"Error: Status {response.status_code}")
            continue
            
        data = response.json()
        if 'data' not in data or 'agents' not in data['data']:
            print(f"Error: Unexpected response structure: {data.keys()}")
            continue
            
        agent = data['data']['agents'][0]
        print(f"Agent Name: {agent['name']}")
        print(f"Has systemPrompt: {'systemPrompt' in agent}")
        if 'systemPrompt' in agent:
            print(f"PROMPT DETECTED: {agent['systemPrompt'][:50]}...")
        else:
            print("CLEAN: No systemPrompt found.")
            
        # Also check featured
        if 'featured' in data['data'] and data['data']['featured']:
            f_agent = data['data']['featured'][0]
            print(f"Has systemPrompt in featured: {'systemPrompt' in f_agent}")

    except Exception as e:
        print(f"Error checking {url}: {e}")
