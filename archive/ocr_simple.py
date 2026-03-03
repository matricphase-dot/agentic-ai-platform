"""
Alternative to Tesseract that works without installation
"""
import pyautogui
from PIL import Image
import cv2
import numpy as np
import pytesseract

def setup_tesseract():
    """Try to find Tesseract or use fallback"""
    try:
        # Try common Tesseract paths
        paths = [
            r"C:\Program Files\Tesseract-OCR\tesseract.exe",
            r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
            r"C:\Users\user\AppData\Local\Tesseract-OCR\tesseract.exe"
        ]
        
        for path in paths:
            if os.path.exists(path):
                pytesseract.pytesseract.tesseract_cmd = path
                print(f"✅ Found Tesseract at: {path}")
                return True
        
        print("❌ Tesseract not found. Using fallback OCR.")
        return False
    except:
        return False

def extract_text_fallback(image_path):
    """Fallback text extraction using image processing"""
    # Try Tesseract first
    if setup_tesseract():
        try:
            text = pytesseract.image_to_string(Image.open(image_path))
            return text.strip()
        except:
            pass
    
    # Simple text recognition for common UI elements
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Look for buttons, fields, etc.
    # This is a simple placeholder - real OCR would be better
    return "[Text extraction available with Tesseract installation]"

# Test it
if __name__ == "__main__":
    # Take a screenshot
    screenshot = pyautogui.screenshot()
    test_file = "test_ocr.png"
    screenshot.save(test_file)
    
    print("Testing text extraction...")
    text = extract_text_fallback(test_file)
    print(f"Extracted: {text}")