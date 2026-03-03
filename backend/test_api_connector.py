#!/usr/bin/env python3
"""Test script for Universal API Connector"""
import asyncio
import httpx
import json

async def test_api_connector():
    """Test the API connector endpoints"""
    
    base_url = "http://localhost:8000"
    headers = {"Content-Type": "application/json"}
    
    # Test data
    test_connector = {
        "name": "Test Stripe Integration",
        "openapi_url": "https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json",
        "provider": "stripe",
        "auth_type": "api_key",
        "is_public": True
    }
    
    async with httpx.AsyncClient() as client:
        # Test 1: Discover a connector
        print("Test 1: Discovering API connector...")
        try:
            response = await client.post(
                f"{base_url}/api/v1/api/connectors/discover",
                json=test_connector,
                headers=headers
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Discovery successful: {result['message']}")
                connector_id = result["connector_id"]
            else:
                print(f"❌ Discovery failed: {response.text}")
                return
                
        except Exception as e:
            print(f"❌ Discovery error: {str(e)}")
            return
        
        # Test 2: List connectors
        print("\nTest 2: Listing connectors...")
        try:
            response = await client.get(f"{base_url}/api/v1/api/connectors")
            if response.status_code == 200:
                connectors = response.json()
                print(f"✅ Found {len(connectors)} connectors")
            else:
                print(f"❌ List failed: {response.text}")
                
        except Exception as e:
            print(f"❌ List error: {str(e)}")
        
        # Test 3: Get connector details
        print(f"\nTest 3: Getting connector details for {connector_id}...")
        try:
            response = await client.get(f"{base_url}/api/v1/api/connectors/{connector_id}")
            if response.status_code == 200:
                details = response.json()
                print(f"✅ Connector details: {details['name']}")
                print(f"   Actions: {details['total_actions']}")
                print(f"   Verified: {details['is_verified']}")
            else:
                print(f"❌ Details failed: {response.text}")
                
        except Exception as e:
            print(f"❌ Details error: {str(e)}")
        
        # Test 4: List popular providers
        print("\nTest 4: Getting popular providers...")
        try:
            response = await client.get(f"{base_url}/api/v1/api/connectors/providers/popular")
            if response.status_code == 200:
                providers = response.json()
                print(f"✅ Found {len(providers['providers'])} popular providers")
                for provider in providers["providers"][:3]:
                    print(f"   - {provider['name']} ({provider['provider']})")
            else:
                print(f"❌ Providers failed: {response.text}")
                
        except Exception as e:
            print(f"❌ Providers error: {str(e)}")
        
        print("\n" + "="*50)
        print("Universal API Connector Phase 1 Test Complete!")
        print("="*50)

if __name__ == "__main__":
    asyncio.run(test_api_connector())
