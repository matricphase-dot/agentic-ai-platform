'use client';

import { useState, useRef } from 'react';
import { Camera, Mic, StopCircle, Save, Upload } from 'lucide-react';
import { api } from '@/lib/api';

export default function RecorderPage() {
  const [recording, setRecording] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: audioEnabled,
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setVideoBlob(blob);
        setUploadSuccess(false);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      alert('Could not start recording. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setRecording(false);
    }
  };

  const saveRecording = () => {
    if (!videoUrl) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `recording-${new Date().toISOString()}.webm`;
    a.click();
  };

  const uploadRecording = async () => {
    if (!videoBlob) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('video', videoBlob, `recording-${Date.now()}.webm`);
    formData.append('duration', '0');

    try {
      await api.post('/api/recordings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadSuccess(true);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Desktop Recorder</h1>
        <p className="text-gray-600 mb-8">Record your screen to create inputs for your AI agents.</p>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={audioEnabled}
                onChange={(e) => setAudioEnabled(e.target.checked)}
                disabled={recording}
              />
              <Mic className="w-5 h-5" /> Include microphone audio
            </label>
          </div>

          <div className="flex gap-4">
            {!recording ? (
              <button
                onClick={startRecording}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                <Camera className="w-5 h-5" /> Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                <StopCircle className="w-5 h-5" /> Stop Recording
              </button>
            )}
          </div>
        </div>

        {videoUrl && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            <video src={videoUrl} controls className="w-full mb-4 rounded" />
            <div className="flex gap-4">
              <button
                onClick={saveRecording}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                <Save className="w-5 h-5" /> Save Locally
              </button>
              <button
                onClick={uploadRecording}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
              >
                <Upload className="w-5 h-5" /> {uploading ? 'Uploading...' : 'Upload to Cloud'}
              </button>
            </div>
            {uploadSuccess && (
              <p className="mt-4 text-green-600">âœ“ Uploaded successfully! You can now use this recording with your agents.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}