# desktop_bridge.py - Complete Desktop Recorder Integration
import subprocess
import os
import json
import threading
import time
from datetime import datetime
import pyautogui
import cv2
import numpy as np
from PIL import ImageGrab
import keyboard

class DesktopRecorderBridge:
    def __init__(self):
        self.recorder_path = r"D:\agentic-core\desktop_recorder.py"
        self.process = None
        self.is_recording = False
        self.current_recording = None
        self.recordings_dir = "recordings"
        self.screenshots_dir = "screenshots"
        
        # Create directories
        os.makedirs(self.recordings_dir, exist_ok=True)
        os.makedirs(self.screenshots_dir, exist_ok=True)
        
        # Hotkey setup
        self.setup_hotkeys()
        
    def setup_hotkeys(self):
        """Setup global hotkeys"""
        try:
            # Register F10 to start/stop recording
            keyboard.add_hotkey('f10', self.toggle_recording)
            print("✅ Hotkeys registered: F10 to toggle recording")
        except Exception as e:
            print(f"⚠️ Could not register hotkeys: {e}")
    
    def get_status(self):
        """Get recorder status"""
        return {
            "available": os.path.exists(self.recorder_path),
            "is_recording": self.is_recording,
            "recorder_path": self.recorder_path,
            "current_recording": self.current_recording,
            "recordings_count": len(self.list_recordings()),
            "recordings_dir": self.recordings_dir,
            "screenshots_dir": self.screenshots_dir
        }
    
    def toggle_recording(self):
        """Toggle recording with hotkey"""
        if self.is_recording:
            return self.stop_recording()
        else:
            return self.start_recording()
    
    def start_recording(self, output_file=None):
        """Start desktop recording"""
        try:
            if not os.path.exists(self.recorder_path):
                return {"success": False, "message": "Recorder not found at specified path"}
            
            if output_file is None:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                output_file = os.path.join(self.recordings_dir, f"recording_{timestamp}.mp4")
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(output_file), exist_ok=True)
            
            print(f"🎥 Starting recording: {output_file}")
            
            # Try to use the existing recorder
            if os.path.exists(self.recorder_path):
                cmd = ["python", self.recorder_path, "--output", output_file, "--start"]
                self.process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            else:
                # Fallback: Use simple screen recording
                self.process = self._start_simple_recording(output_file)
            
            self.is_recording = True
            self.current_recording = output_file
            
            # Start monitoring thread
            monitor_thread = threading.Thread(target=self._monitor_recording, daemon=True)
            monitor_thread.start()
            
            return {
                "success": True,
                "message": "Desktop recording started",
                "output_file": output_file,
                "pid": self.process.pid if self.process else None,
                "hotkey": "Press F10 to stop recording"
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _start_simple_recording(self, output_file):
        """Start simple screen recording (fallback)"""
        # This is a simplified version - you should use your actual recorder
        print("⚠️ Using simple recording fallback")
        
        # Return a dummy process
        class DummyProcess:
            def __init__(self):
                self.pid = 9999
                self.returncode = None
            def terminate(self):
                self.returncode = 0
            def wait(self, timeout=None):
                return 0
        
        return DummyProcess()
    
    def _monitor_recording(self):
        """Monitor recording process"""
        try:
            if self.process:
                # Wait for process to complete
                self.process.wait()
                self.is_recording = False
                print("✅ Recording stopped")
        except:
            pass
    
    def stop_recording(self):
        """Stop desktop recording"""
        try:
            if self.process and self.is_recording:
                print("🛑 Stopping recording...")
                
                # Try to stop gracefully
                if hasattr(self.process, 'terminate'):
                    self.process.terminate()
                
                # Wait for process to stop
                time.sleep(2)
                
                self.is_recording = False
                
                # Get recording info
                recording_info = self._get_recording_info(self.current_recording)
                
                result = {
                    "success": True,
                    "message": "Recording stopped and saved",
                    "output_file": self.current_recording,
                    "recording_info": recording_info
                }
                
                self.current_recording = None
                return result
            else:
                return {"success": False, "message": "No recording in progress"}
                
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _get_recording_info(self, filepath):
        """Get recording file information"""
        try:
            if os.path.exists(filepath):
                stats = os.stat(filepath)
                return {
                    "size_mb": round(stats.st_size / (1024*1024), 2),
                    "created": datetime.fromtimestamp(stats.st_ctime).isoformat(),
                    "modified": datetime.fromtimestamp(stats.st_mtime).isoformat(),
                    "duration": "Unknown"  # You would calculate this from video metadata
                }
        except:
            pass
        return {}
    
    def take_screenshot(self, region=None, filename=None):
        """Take a screenshot"""
        try:
            if filename is None:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = os.path.join(self.screenshots_dir, f"screenshot_{timestamp}.png")
            
            os.makedirs(os.path.dirname(filename), exist_ok=True)
            
            # Take screenshot
            if region:
                screenshot = pyautogui.screenshot(region=region)
            else:
                screenshot = pyautogui.screenshot()
            
            screenshot.save(filename)
            
            # Get screen info
            screen_width, screen_height = pyautogui.size()
            
            return {
                "success": True,
                "message": "Screenshot taken successfully",
                "filename": filename,
                "screen_size": {
                    "width": screen_width,
                    "height": screen_height
                },
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def list_recordings(self):
        """List all recordings"""
        recordings = []
        try:
            if os.path.exists(self.recordings_dir):
                for file in sorted(os.listdir(self.recordings_dir), reverse=True):
                    if file.endswith(('.mp4', '.avi', '.mov', '.mkv', '.webm')):
                        file_path = os.path.join(self.recordings_dir, file)
                        stats = os.stat(file_path)
                        
                        recordings.append({
                            "name": file,
                            "path": file_path,
                            "size_mb": round(stats.st_size / (1024*1024), 2),
                            "created": datetime.fromtimestamp(stats.st_ctime).strftime("%Y-%m-%d %H:%M:%S"),
                            "duration": self._estimate_duration(file_path),
                            "thumbnail": self._generate_thumbnail(file_path) if len(recordings) < 5 else None
                        })
        except Exception as e:
            print(f"Error listing recordings: {e}")
        
        return recordings
    
    def _estimate_duration(self, filepath):
        """Estimate video duration"""
        try:
            # Try to get duration from video file
            import cv2
            cap = cv2.VideoCapture(filepath)
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
            cap.release()
            
            if fps > 0:
                duration = frame_count / fps
                minutes = int(duration // 60)
                seconds = int(duration % 60)
                return f"{minutes}:{seconds:02d}"
        except:
            pass
        
        return "Unknown"
    
    def _generate_thumbnail(self, filepath):
        """Generate thumbnail for video"""
        try:
            import cv2
            cap = cv2.VideoCapture(filepath)
            success, frame = cap.read()
            cap.release()
            
            if success:
                thumbnail_dir = os.path.join(self.recordings_dir, "thumbnails")
                os.makedirs(thumbnail_dir, exist_ok=True)
                
                thumbnail_path = os.path.join(thumbnail_dir, f"{os.path.basename(filepath)}.jpg")
                cv2.imwrite(thumbnail_path, frame)
                return thumbnail_path
        except:
            pass
        
        return None
    
    def delete_recording(self, filename):
        """Delete a recording"""
        try:
            filepath = os.path.join(self.recordings_dir, filename)
            if os.path.exists(filepath):
                os.remove(filepath)
                
                # Also delete thumbnail if exists
                thumbnail_path = os.path.join(self.recordings_dir, "thumbnails", f"{filename}.jpg")
                if os.path.exists(thumbnail_path):
                    os.remove(thumbnail_path)
                
                return {"success": True, "message": f"Recording '{filename}' deleted"}
            else:
                return {"success": False, "message": "File not found"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_system_info(self):
        """Get system information"""
        try:
            screen_width, screen_height = pyautogui.size()
            mouse_x, mouse_y = pyautogui.position()
            
            return {
                "screen_size": {
                    "width": screen_width,
                    "height": screen_height
                },
                "mouse_position": {
                    "x": mouse_x,
                    "y": mouse_y
                },
                "platform": os.name,
                "cpu_count": os.cpu_count(),
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            return {"error": str(e)}
    
    def record_mouse_movements(self, duration=10, output_file=None):
        """Record mouse movements"""
        try:
            if output_file is None:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                output_file = os.path.join(self.recordings_dir, f"mouse_movements_{timestamp}.json")
            
            movements = []
            start_time = time.time()
            
            print(f"🖱️ Recording mouse movements for {duration} seconds...")
            
            while time.time() - start_time < duration:
                x, y = pyautogui.position()
                movements.append({
                    "x": x,
                    "y": y,
                    "timestamp": time.time() - start_time
                })
                time.sleep(0.01)  # 100Hz sampling
            
            # Save movements
            with open(output_file, 'w') as f:
                json.dump({
                    "duration": duration,
                    "movements": movements,
                    "screen_size": pyautogui.size(),
                    "recorded_at": datetime.now().isoformat()
                }, f, indent=2)
            
            return {
                "success": True,
                "message": f"Mouse movements recorded for {duration} seconds",
                "output_file": output_file,
                "movement_count": len(movements)
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}

# Test the bridge
if __name__ == "__main__":
    bridge = DesktopRecorderBridge()
    print("🧪 Testing Desktop Bridge...")
    
    status = bridge.get_status()
    print(f"Status: {status}")
    
    # Test screenshot
    result = bridge.take_screenshot()
    if result["success"]:
        print(f"✅ Screenshot taken: {result['filename']}")
    
    # List recordings
    recordings = bridge.list_recordings()
    print(f"📁 Found {len(recordings)} recordings")
    
    # Test mouse recording
    result = bridge.record_mouse_movements(duration=3)
    if result["success"]:
        print(f"✅ Mouse movements recorded: {result['movement_count']} points")