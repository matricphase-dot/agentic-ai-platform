"""
Test Desktop Automation BEFORE running full platform
"""
import pyautogui
import cv2
import numpy as np
from PIL import Image
import pytesseract
import os
import sys

def check_desktop_capabilities():
    print("=" * 50)
    print("DESKTOP AUTOMATION TEST")
    print("=" * 50)
    
    tests_passed = 0
    tests_total = 5
    
    # Test 1: PyAutoGUI availability
    try:
        print("\n1. Testing PyAutoGUI...")
        screen_width, screen_height = pyautogui.size()
        print(f"✅ Screen resolution: {screen_width}x{screen_height}")
        tests_passed += 1
    except Exception as e:
        print(f"❌ PyAutoGUI failed: {e}")
        print("Run: pip install pyautogui==0.9.53")
    
    # Test 2: Screenshot capability
    try:
        print("\n2. Testing screenshot...")
        screenshot = pyautogui.screenshot()
        screenshot.save("test_screenshot.png")
        print(f"✅ Screenshot saved to test_screenshot.png ({screenshot.size[0]}x{screenshot.size[1]})")
        tests_passed += 1
    except Exception as e:
        print(f"❌ Screenshot failed: {e}")
    
    # Test 3: Mouse position
    try:
        print("\n3. Testing mouse control...")
        x, y = pyautogui.position()
        print(f"✅ Mouse position: X={x}, Y={y}")
        tests_passed += 1
    except Exception as e:
        print(f"❌ Mouse position failed: {e}")
    
    # Test 4: Tesseract OCR
    try:
        print("\n4. Testing Tesseract OCR...")
        # Create a test image with text
        from PIL import Image, ImageDraw, ImageFont
        img = Image.new('RGB', (200, 100), color='white')
        d = ImageDraw.Draw(img)
        d.text((10, 10), "Hello World", fill='black')
        img.save("test_text.png")
        
        # Try to read text
        text = pytesseract.image_to_string(Image.open("test_text.png"))
        print(f"✅ OCR Test: Extracted text: '{text.strip()}'")
        tests_passed += 1
    except Exception as e:
        print(f"❌ Tesseract OCR failed: {e}")
        print("Install Tesseract from: https://github.com/UB-Mannheim/tesseract/wiki")
        print("Add to PATH: C:\\Program Files\\Tesseract-OCR")
    
    # Test 5: OpenCV
    try:
        print("\n5. Testing OpenCV...")
        img_array = np.array(Image.open("test_screenshot.png"))
        print(f"✅ OpenCV loaded image: {img_array.shape}")
        tests_passed += 1
    except Exception as e:
        print(f"❌ OpenCV failed: {e}")
    
    print("\n" + "=" * 50)
    print(f"TEST RESULTS: {tests_passed}/{tests_total} passed")
    
    if tests_passed >= 4:
        print("✅ Desktop automation READY for Agentic AI Platform!")
        return True
    else:
        print("❌ Fix desktop automation issues first")
        return False

if __name__ == "__main__":
    check_desktop_capabilities()
    input("\nPress Enter to continue...")