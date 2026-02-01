#!/usr/bin/env python3
"""
COMPUTER VISION - REAL SCREEN ANALYSIS
Working screen analysis and OCR
"""

import cv2
import numpy as np
from PIL import ImageGrab, Image
import pytesseract
import os
import json
from datetime import datetime
import mss
import mss.tools

class ComputerVision:
    def __init__(self):
        self.screenshots_dir = "screenshots"
        os.makedirs(self.screenshots_dir, exist_ok=True)
        
        # Try to find Tesseract path (common locations)
        tesseract_paths = [
            r'C:\Program Files\Tesseract-OCR\tesseract.exe',
            r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
            '/usr/bin/tesseract'
        ]
        
        for path in tesseract_paths:
            if os.path.exists(path):
                pytesseract.pytesseract.tesseract_cmd = path
                break
        
        print("👁️ Computer Vision loaded")
    
    def capture_screen(self, region=None):
        """Capture screen or region"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = os.path.join(self.screenshots_dir, f"capture_{timestamp}.png")
            
            if region:
                # Capture specific region
                x1, y1, x2, y2 = region
                screenshot = ImageGrab.grab(bbox=(x1, y1, x2, y2))
            else:
                # Capture full screen
                screenshot = ImageGrab.grab()
            
            screenshot.save(filename, "PNG")
            
            return {
                "success": True,
                "filename": filename,
                "path": os.path.abspath(filename),
                "size": os.path.getsize(filename),
                "dimensions": screenshot.size,
                "timestamp": timestamp
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def analyze_screen(self):
        """Analyze current screen for text and elements"""
        try:
            # Capture screen
            screenshot = ImageGrab.grab()
            screenshot_np = np.array(screenshot)
            
            # Convert to OpenCV format
            screenshot_cv = cv2.cvtColor(screenshot_np, cv2.COLOR_RGB2BGR)
            
            # Convert to grayscale for analysis
            gray = cv2.cvtColor(screenshot_cv, cv2.COLOR_BGR2GRAY)
            
            # Perform OCR
            text = pytesseract.image_to_string(gray)
            text_boxes = pytesseract.image_to_boxes(gray)
            
            # Detect edges
            edges = cv2.Canny(gray, 50, 150)
            
            # Detect contours (potential UI elements)
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Filter large contours
            large_contours = [c for c in contours if cv2.contourArea(c) > 1000]
            
            # Detect colors
            hsv = cv2.cvtColor(screenshot_cv, cv2.COLOR_BGR2HSV)
            
            # Save analysis image
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            analysis_file = os.path.join(self.screenshots_dir, f"analysis_{timestamp}.png")
            
            # Create analysis visualization
            analysis_img = screenshot_cv.copy()
            
            # Draw contours
            cv2.drawContours(analysis_img, large_contours, -1, (0, 255, 0), 2)
            
            # Draw text boxes
            for box in text_boxes.splitlines():
                box = box.split()
                if len(box) == 6:
                    x, y, w, h = int(box[1]), int(box[2]), int(box[3]), int(box[4])
                    cv2.rectangle(analysis_img, (x, screenshot.height - y), (w, screenshot.height - h), (255, 0, 0), 2)
            
            cv2.imwrite(analysis_file, analysis_img)
            
            # Extract text lines
            text_lines = [line.strip() for line in text.split('\n') if line.strip()]
            
            return {
                "success": True,
                "text_found": text_lines[:20],  # First 20 lines
                "text_character_count": len(text),
                "elements_detected": len(large_contours),
                "screen_dimensions": screenshot.size,
                "analysis_image": analysis_file,
                "timestamp": timestamp,
                "text_sample": text[:500] if text else "No text detected"
            }
        except Exception as e:
            print(f"Screen analysis error: {e}")
            return {
                "success": False,
                "error": str(e),
                "fallback": "Screen analysis requires OpenCV and Tesseract installation"
            }
    
    def ocr_image(self, image_path):
        """Extract text from image using OCR"""
        if not os.path.exists(image_path):
            return {"success": False, "error": "Image file not found"}
        
        try:
            # Load image
            image = Image.open(image_path)
            
            # Convert to grayscale if needed
            if image.mode != 'L':
                image = image.convert('L')
            
            # Perform OCR
            text = pytesseract.image_to_string(image)
            
            # Get confidence data
            data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
            
            # Calculate average confidence
            confidences = [int(conf) for conf in data['conf'] if int(conf) > 0]
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0
            
            # Extract words with confidence
            words_with_conf = []
            for i in range(len(data['text'])):
                if data['text'][i].strip():
                    words_with_conf.append({
                        "text": data['text'][i],
                        "confidence": int(data['conf'][i]),
                        "position": {
                            "left": data['left'][i],
                            "top": data['top'][i],
                            "width": data['width'][i],
                            "height": data['height'][i]
                        }
                    })
            
            return {
                "success": True,
                "text": text,
                "average_confidence": round(avg_confidence, 2),
                "word_count": len([w for w in text.split() if w]),
                "words": words_with_conf[:50],  # First 50 words
                "image_dimensions": image.size,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            print(f"OCR error: {e}")
            return {"success": False, "error": str(e)}
    
    def find_color(self, image_path, target_color, tolerance=30):
        """Find areas of specific color in image"""
        if not os.path.exists(image_path):
            return {"success": False, "error": "Image file not found"}
        
        try:
            image = cv2.imread(image_path)
            if image is None:
                return {"success": False, "error": "Could not read image"}
            
            # Convert target color to HSV
            target_bgr = np.uint8([[target_color]])
            target_hsv = cv2.cvtColor(target_bgr, cv2.COLOR_BGR2HSV)[0][0]
            
            # Convert image to HSV
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            
            # Define range for color
            lower = np.array([max(0, target_hsv[0] - tolerance), 50, 50])
            upper = np.array([min(179, target_hsv[0] + tolerance), 255, 255])
            
            # Create mask
            mask = cv2.inRange(hsv, lower, upper)
            
            # Find contours in mask
            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Get contour areas
            color_areas = []
            for contour in contours:
                area = cv2.contourArea(contour)
                if area > 10:  # Filter small areas
                    x, y, w, h = cv2.boundingRect(contour)
                    color_areas.append({
                        "area": area,
                        "bounding_box": {"x": x, "y": y, "width": w, "height": h},
                        "center": {"x": x + w//2, "y": y + h//2}
                    })
            
            return {
                "success": True,
                "target_color": target_color,
                "tolerance": tolerance,
                "areas_found": len(color_areas),
                "areas": color_areas[:20],  # First 20 areas
                "total_pixels": np.sum(mask > 0),
                "image_dimensions": image.shape[:2]
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def compare_screenshots(self, image1_path, image2_path):
        """Compare two screenshots for differences"""
        if not os.path.exists(image1_path) or not os.path.exists(image2_path):
            return {"success": False, "error": "One or both images not found"}
        
        try:
            img1 = cv2.imread(image1_path)
            img2 = cv2.imread(image2_path)
            
            if img1.shape != img2.shape:
                return {"success": False, "error": "Images have different dimensions"}
            
            # Compute difference
            diff = cv2.absdiff(img1, img2)
            gray_diff = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
            
            # Threshold to get significant differences
            _, thresh = cv2.threshold(gray_diff, 30, 255, cv2.THRESH_BINARY)
            
            # Find contours of differences
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Calculate difference percentage
            total_pixels = img1.shape[0] * img1.shape[1]
            diff_pixels = np.sum(thresh > 0)
            diff_percentage = (diff_pixels / total_pixels) * 100
            
            # Get difference areas
            diff_areas = []
            for contour in contours[:10]:  # First 10 differences
                area = cv2.contourArea(contour)
                if area > 100:  # Filter small differences
                    x, y, w, h = cv2.boundingRect(contour)
                    diff_areas.append({
                        "area": area,
                        "bounding_box": {"x": x, "y": y, "width": w, "height": h}
                    })
            
            # Save difference visualization
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            diff_file = os.path.join(self.screenshots_dir, f"difference_{timestamp}.png")
            
            # Create visualization
            visualization = img2.copy()
            for area in diff_areas:
                box = area["bounding_box"]
                cv2.rectangle(visualization, 
                            (box["x"], box["y"]), 
                            (box["x"] + box["width"], box["y"] + box["height"]), 
                            (0, 0, 255), 2)
            
            cv2.imwrite(diff_file, visualization)
            
            return {
                "success": True,
                "difference_percentage": round(diff_percentage, 2),
                "diff_pixels": int(diff_pixels),
                "total_pixels": int(total_pixels),
                "difference_areas": len(diff_areas),
                "areas": diff_areas,
                "visualization": diff_file,
                "images_same": diff_percentage < 1.0  # Less than 1% difference
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

# Create singleton instance
computer_vision = ComputerVision()

if __name__ == "__main__":
    print("🧪 Testing Computer Vision...")
    result = computer_vision.analyze_screen()
    print(f"📊 Screen Analysis: {result.get('elements_detected', 0)} elements detected")
    print("✅ Computer Vision is ready!")