#!/usr/bin/env python3
"""
DESKTOP BRIDGE - REAL SCREEN RECORDER WITH F10 HOTKEY
Working screen recording with actual capture
"""

import threading
import time
import os
import json
from datetime import datetime
from pynput import keyboard
import mss
import mss.tools
import cv2
import numpy as np
from PIL import ImageGrab
import wave
import pyaudio

class DesktopRecorder:
    def __init__(self):
        self.is_recording = False
        self.is_paused = False
        self.recordings_dir = "recordings"
        self.screenshots_dir = "screenshots"
        self.current_recording = None
        self.recording_thread = None
        self.start_time = None
        self.frames = []
        self.audio_frames = []
        self.fps = 30
        self.quality = "medium"
        self.audio_enabled = False
        
        # Create directories
        os.makedirs(self.recordings_dir, exist_ok=True)
        os.makedirs(self.screenshots_dir, exist_ok=True)
        
        # Setup hotkey listener
        self.setup_hotkeys()
        
        print("✅ Desktop Bridge ready (F10 to record)")
    
    def setup_hotkeys(self):
        """Setup global hotkeys"""
        self.listener = keyboard.GlobalHotKeys({
            '<f10>': self.toggle_recording,
            '<f9>': self.capture_screenshot,
            '<ctrl>+<alt>+s': self.capture_screenshot
        })
        self.listener.start()
    
    def toggle_recording(self):
        """Toggle recording with F10"""
        if not self.is_recording:
            self.start_recording()
        else:
            self.stop_recording()
    
    def start_recording(self, quality="medium", fps=30, audio=False):
        """Start screen recording"""
        if self.is_recording:
            return {"success": False, "message": "Already recording"}
        
        self.is_recording = True
        self.is_paused = False
        self.quality = quality
        self.fps = fps
        self.audio_enabled = audio
        self.start_time = datetime.now()
        
        # Set resolution based on quality
        if quality == "low":
            self.width, self.height = 1280, 720
        elif quality == "high":
            self.width, self.height = 2560, 1440
        else:  # medium
            self.width, self.height = 1920, 1080
        
        # Generate filename
        timestamp = self.start_time.strftime("%Y%m%d_%H%M%S")
        self.current_recording = os.path.join(self.recordings_dir, f"recording_{timestamp}.mp4")
        
        # Start recording in background thread
        self.recording_thread = threading.Thread(target=self._record_screen)
        self.recording_thread.start()
        
        return {
            "success": True,
            "message": "Recording started",
            "filename": os.path.basename(self.current_recording),
            "quality": quality,
            "fps": fps,
            "audio": audio,
            "start_time": self.start_time.isoformat()
        }
    
    def stop_recording(self):
        """Stop screen recording"""
        if not self.is_recording:
            return {"success": False, "message": "Not recording"}
        
        self.is_recording = False
        
        if self.recording_thread:
            self.recording_thread.join(timeout=2)
        
        duration = (datetime.now() - self.start_time).total_seconds()
        
        # Save video file
        if self.frames:
            self._save_video()
        
        return {
            "success": True,
            "message": "Recording stopped",
            "filename": os.path.basename(self.current_recording),
            "duration": round(duration, 2),
            "filepath": self.current_recording,
            "frames_captured": len(self.frames),
            "file_size": os.path.getsize(self.current_recording) if os.path.exists(self.current_recording) else 0
        }
    
    def pause_recording(self):
        """Pause/resume recording"""
        self.is_paused = not self.is_paused
        return {
            "success": True,
            "paused": self.is_paused,
            "message": "Recording paused" if self.is_paused else "Recording resumed"
        }
    
    def capture_screenshot(self):
        """Capture screenshot with F9"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = os.path.join(self.screenshots_dir, f"screenshot_{timestamp}.png")
            
            # Capture screen
            screenshot = ImageGrab.grab()
            screenshot.save(filename, "PNG")
            
            return {
                "success": True,
                "filename": filename,
                "timestamp": timestamp,
                "message": "Screenshot captured"
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _record_screen(self):
        """Actual screen recording logic"""
        self.frames = []
        
        # Define codec and create VideoWriter
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(self.current_recording, fourcc, self.fps, (self.width, self.height))
        
        print(f"[RECORDING] Started recording to {self.current_recording}")
        print(f"[RECORDING] Quality: {self.quality}, FPS: {self.fps}")
        
        frame_count = 0
        start_time = time.time()
        
        try:
            with mss.mss() as sct:
                # Monitor size
                monitor = sct.monitors[1]  # Primary monitor
                
                while self.is_recording:
                    if self.is_paused:
                        time.sleep(0.1)
                        continue
                    
                    # Capture screen
                    screenshot = sct.grab(monitor)
                    
                    # Convert to numpy array
                    frame = np.array(screenshot)
                    
                    # Convert BGRA to BGR
                    frame = cv2.cvtColor(frame, cv2.COLOR_BGRA2BGR)
                    
                    # Resize to target resolution
                    frame = cv2.resize(frame, (self.width, self.height))
                    
                    # Write frame
                    out.write(frame)
                    self.frames.append(frame)
                    
                    frame_count += 1
                    
                    # Maintain FPS
                    elapsed = time.time() - start_time
                    expected_time = frame_count / self.fps
                    
                    if elapsed < expected_time:
                        time.sleep(expected_time - elapsed)
                    
                    # Safety limit for testing (remove in production)
                    if frame_count >= 900:  # 30 seconds at 30 FPS
                        print("[RECORDING] Safety limit reached (30 seconds)")
                        break
                        
        except Exception as e:
            print(f"[RECORDING ERROR] {e}")
        finally:
            out.release()
            cv2.destroyAllWindows()
            print(f"[RECORDING] Finished. Captured {frame_count} frames")
    
    def _save_video(self):
        """Save captured frames as video"""
        if not self.frames:
            return
        
        print(f"[RECORDING] Saving {len(self.frames)} frames...")
    
    def get_status(self):
        """Get current recording status"""
        if self.is_recording and self.start_time:
            duration = (datetime.now() - self.start_time).total_seconds()
            return {
                "is_recording": True,
                "is_paused": self.is_paused,
                "duration": round(duration, 2),
                "frames_captured": len(self.frames),
                "filename": os.path.basename(self.current_recording),
                "start_time": self.start_time.isoformat(),
                "quality": self.quality,
                "fps": self.fps
            }
        return {
            "is_recording": False,
            "is_paused": False,
            "duration": 0,
            "message": "Ready to record"
        }
    
    def get_recordings(self):
        """Get list of all recordings"""
        recordings = []
        if os.path.exists(self.recordings_dir):
            for file in os.listdir(self.recordings_dir):
                if file.endswith(('.mp4', '.avi', '.mov')):
                    filepath = os.path.join(self.recordings_dir, file)
                    stat = os.stat(filepath)
                    recordings.append({
                        "filename": file,
                        "filepath": filepath,
                        "size": stat.st_size,
                        "size_mb": round(stat.st_size / (1024*1024), 2),
                        "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                        "duration": self._get_video_duration(filepath)
                    })
        # Sort by creation time, newest first
        recordings.sort(key=lambda x: x["created"], reverse=True)
        return recordings
    
    def _get_video_duration(self, filepath):
        """Get duration of video file"""
        try:
            cap = cv2.VideoCapture(filepath)
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
            cap.release()
            
            if fps > 0:
                return round(frame_count / fps, 2)
        except:
            pass
        return 0

# Create singleton instance
desktop_recorder = DesktopRecorder()

if __name__ == "__main__":
    print("🧪 Testing Desktop Bridge...")
    print("Press F10 to start/stop recording")
    print("Press F9 to capture screenshot")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n✅ Desktop Bridge is ready!")