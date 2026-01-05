"""
MOBILE ENGINE MODULE
Mobile companion functionality
"""
import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from enum import Enum

class MobileDeviceType(Enum):
    """Mobile device types"""
    IOS = "ios"
    ANDROID = "android"
    WEB = "web"

@dataclass
class MobileDevice:
    """Mobile device information"""
    device_id: str
    device_type: str
    device_name: str
    paired_at: datetime
    last_seen: datetime
    
    def to_dict(self):
        data = asdict(self)
        data['paired_at'] = self.paired_at.isoformat()
        data['last_seen'] = self.last_seen.isoformat()
        return data

class MobileEngine:
    """Mobile engine for device management"""
    
    def __init__(self):
        self.paired_devices = {}
    
    def pair_device(self, device_id: str, device_name: str, device_type: str = "android") -> Dict:
        """Pair a new mobile device"""
        device = MobileDevice(
            device_id=device_id,
            device_type=device_type,
            device_name=device_name,
            paired_at=datetime.now(),
            last_seen=datetime.now()
        )
        
        self.paired_devices[device_id] = device
        return device.to_dict()
    
    def get_device(self, device_id: str) -> Optional[Dict]:
        """Get device information"""
        if device_id in self.paired_devices:
            return self.paired_devices[device_id].to_dict()
        return None
    
    def update_device_status(self, device_id: str):
        """Update device last seen timestamp"""
        if device_id in self.paired_devices:
            self.paired_devices[device_id].last_seen = datetime.now()
            return True
        return False
    
    def get_all_devices(self) -> List[Dict]:
        """Get all paired devices"""
        return [device.to_dict() for device in self.paired_devices.values()]

# Simple mobile engine without aiohttp dependency
def initialize_mobile():
    """Initialize mobile engine"""
    return MobileEngine()