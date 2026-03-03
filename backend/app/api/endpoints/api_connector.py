from fastapi import APIRouter, HTTPException
from typing import List
import uuid

router = APIRouter()

# Mock data for testing
mock_connectors = [
    {
        "id": str(uuid.uuid4()),
        "name": "Stripe Payment API",
        "provider": "stripe",
        "base_url": "https://api.stripe.com/v1",
        "auth_type": "api_key",
        "is_verified": True,
        "is_public": True,
        "actions_found": 25
    },
    {
        "id": str(uuid.uuid4()),
        "name": "GitHub REST API",
        "provider": "github",
        "base_url": "https://api.github.com",
        "auth_type": "bearer_token",
        "is_verified": True,
        "is_public": True,
        "actions_found": 42
    }
]

@router.get("/connectors", response_model=List[dict])
async def list_connectors():
    """List available API connectors"""
    return mock_connectors

@router.get("/connectors/{connector_id}")
async def get_connector(connector_id: str):
    """Get a specific connector"""
    for connector in mock_connectors:
        if connector["id"] == connector_id:
            return connector
    raise HTTPException(status_code=404, detail="Connector not found")

@router.get("/health")
async def api_health():
    """Health check for API connector"""
    return {"status": "healthy", "service": "api-connector"}
