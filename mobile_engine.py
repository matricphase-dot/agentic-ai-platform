import qrcode, io, base64, json, os
from datetime import datetime

class MobileEngine:
    def __init__(self):
        self.paired_devices = []
        self.qr_data = None
    
    def generate_qr(self):
        # Create QR code with pairing data
        pairing_data = {
            "url": "http://localhost:5000/mobile-pair",
            "timestamp": datetime.now().isoformat(),
            "pairing_code": self.generate_pairing_code()
        }
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(json.dumps(pairing_data))
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        self.qr_data = pairing_data
        
        return {
            "qr_url": f"data:image/png;base64,{img_str}",
            "pairing_code": pairing_data["pairing_code"],
            "expires_in": 300,
            "timestamp": pairing_data["timestamp"]
        }
    
    def generate_pairing_code(self):
        import random, string
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    
    def pair_device(self, device_id, pairing_code=None):
        if pairing_code and self.qr_data and pairing_code == self.qr_data.get("pairing_code"):
            device = {
                "device_id": device_id,
                "paired_at": datetime.now().isoformat(),
                "last_seen": datetime.now().isoformat(),
                "status": "online"
            }
            self.paired_devices.append(device)
            return {"success": True, "device": device}
        return {"success": False, "error": "Invalid pairing code"}
    
    def send_command(self, device_id, command, data=None):
        return {
            "success": True,
            "command": command,
            "device_id": device_id,
            "executed": True,
            "timestamp": datetime.now().isoformat()
        }

mobile = MobileEngine()