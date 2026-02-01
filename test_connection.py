import requests 
import time 
 
def test_server(): 
    for i in range(10): 
        try: 
            response = requests.get("http://localhost:8002/health", timeout=2) 
            print(f"? Server is running! Status: {response.status_code}") 
            print(f"Response: {response.json()}") 
            return True 
        except Exception as e: 
            print(f"Attempt {i+1}/10: Server not ready yet...") 
            time.sleep(1) 
    print("? Server failed to start") 
    return False 
 
if __name__ == "__main__": 
    test_server() 
