"""
computer_vision.py - SCREEN UNDERSTANDING WITH AI
"""
import cv2
import numpy as np
from PIL import Image, ImageGrab
import pytesseract
import easyocr
import os
from datetime import datetime
from typing import Dict, List, Tuple
import json

class ComputerVisionEngine:
    def __init__(self):
        print("👁️ Initializing Computer Vision Engine...")
        
        # Initialize OCR readers
        self.tesseract_path = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
        self.initialize_ocr()
        
        # UI element patterns
        self.ui_patterns = self.load_ui_patterns()
        
    def initialize_ocr(self):
        """Initialize OCR engines"""
        try:
            # Set Tesseract path
            if os.path.exists(self.tesseract_path):
                pytesseract.pytesseract.tesseract_cmd = self.tesseract_path
            
            # Initialize EasyOCR
            self.easyocr_reader = easyocr.Reader(['en'])
            print("✅ OCR engines initialized")
            
        except Exception as e:
            print(f"⚠️ OCR initialization failed: {e}")
            self.easyocr_reader = None
    
    def capture_screen(self, region=None):
        """Capture screen or region"""
        screenshot = ImageGrab.grab(bbox=region)
        return cv2.cvtColor(np.array(screenshot), cv2.COLOR_RGB2BGR)
    
    def extract_text(self, image):
        """Extract text from image using multiple OCR methods"""
        results = {}
        
        try:
            # Method 1: Tesseract
            if os.path.exists(self.tesseract_path):
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
                text_tesseract = pytesseract.image_to_string(gray)
                results['tesseract'] = text_tesseract
            
            # Method 2: EasyOCR
            if self.easyocr_reader:
                text_easyocr = self.easyocr_reader.readtext(image, detail=0)
                results['easyocr'] = ' '.join(text_easyocr)
            
            # Choose best result
            best_text = ""
            for method, text in results.items():
                if len(text.strip()) > len(best_text):
                    best_text = text.strip()
            
            return {
                "success": True,
                "text": best_text,
                "all_results": results,
                "characters_found": len(best_text)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "text": ""
            }
    
    def find_ui_elements(self, image):
        """Find common UI elements in screenshot"""
        elements = []
        
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Find buttons (rectangular shapes)
        edges = cv2.Canny(gray, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for contour in contours:
            area = cv2.contourArea(contour)
            if 500 < area < 50000:  # Reasonable button size
                x, y, w, h = cv2.boundingRect(contour)
                aspect_ratio = w / h
                
                # Classify by shape
                if 0.8 < aspect_ratio < 1.2:
                    element_type = "button/square"
                elif aspect_ratio > 2:
                    element_type = "input_field"
                else:
                    element_type = "ui_element"
                
                elements.append({
                    "type": element_type,
                    "position": {"x": x, "y": y, "width": w, "height": h},
                    "area": area,
                    "center": {"x": x + w//2, "y": y + h//2}
                })
        
        return elements
    
    def analyze_screenshot(self, screenshot_path=None, image=None):
        """Complete screenshot analysis"""
        if image is None and screenshot_path:
            if os.path.exists(screenshot_path):
                image = cv2.imread(screenshot_path)
            else:
                return {"success": False, "error": "Screenshot not found"}
        
        if image is None:
            # Capture current screen
            image = self.capture_screen()
        
        results = {
            "timestamp": datetime.now().isoformat(),
            "screen_size": {
                "width": image.shape[1],
                "height": image.shape[0]
            }
        }
        
        # Extract text
        text_result = self.extract_text(image)
        results["text_analysis"] = text_result
        
        # Find UI elements
        ui_elements = self.find_ui_elements(image)
        results["ui_elements"] = ui_elements
        
        # Analyze screen type
        results["screen_type"] = self.classify_screen(image, text_result.get("text", ""))
        
        # Suggest actions
        results["suggested_actions"] = self.suggest_actions(ui_elements, text_result.get("text", ""))
        
        return results
    
    def classify_screen(self, image, text):
        """Classify screen type"""
        text_lower = text.lower()
        
        if any(word in text_lower for word in ["login", "sign in", "password"]):
            return "login_screen"
        elif any(word in text_lower for word in ["email", "compose", "send"]):
            return "email_client"
        elif any(word in text_lower for word in ["file", "save", "open"]):
            return "file_dialog"
        elif any(word in text_lower for word in ["browser", "chrome", "firefox"]):
            return "browser"
        elif any(word in text_lower for word in ["excel", "spreadsheet"]):
            return "spreadsheet"
        else:
            return "general_screen"
    
    def suggest_actions(self, ui_elements, text):
        """Suggest automation actions based on screen content"""
        suggestions = []
        
        # Look for login elements
        if any("password" in text.lower() for text in [text] if text):
            suggestions.append("Auto-fill login credentials")
        
        # Look for buttons
        buttons = [e for e in ui_elements if e["type"] == "button/square"]
        if buttons:
            suggestions.append(f"Click on {len(buttons)} detected button(s)")
        
        # Look for input fields
        inputs = [e for e in ui_elements if e["type"] == "input_field"]
        if inputs:
            suggestions.append(f"Fill {len(inputs)} input field(s)")
        
        # General suggestions
        if len(text) > 100:
            suggestions.append("Extract and process text data")
        
        if len(ui_elements) > 5:
            suggestions.append("Complex UI - consider multi-step automation")
        
        return suggestions
    
    def load_ui_patterns(self):
        """Load UI element patterns"""
        patterns = {
            "buttons": ["OK", "Cancel", "Submit", "Save", "Next", "Back"],
            "inputs": ["Username", "Password", "Email", "Search"],
            "dialogs": ["Open", "Save As", "Select File"]
        }
        return patterns

# Test function
def test_vision():
    """Test computer vision capabilities"""
    vision = ComputerVisionEngine()
    
    print("\n🎯 Testing Computer Vision:")
    print("1. Capturing screen...")
    image = vision.capture_screen()
    
    print("2. Analyzing screen...")
    analysis = vision.analyze_screenshot(image=image)
    
    print(f"📊 Results:")
    print(f"  Screen Type: {analysis.get('screen_type')}")
    print(f"  UI Elements: {len(analysis.get('ui_elements', []))}")
    print(f"  Text Found: {analysis.get('text_analysis', {}).get('characters_found', 0)} chars")
    print(f"  Suggestions: {analysis.get('suggested_actions', [])}")
    
    # Save analysis
    with open("vision_analysis.json", "w") as f:
        json.dump(analysis, f, indent=2)
    print("💾 Saved analysis to: vision_analysis.json")

if __name__ == "__main__":
    test_vision()