import { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';

export default function Recorder() {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideo(url);
        await uploadRecording(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const uploadRecording = async (blob: Blob) => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('video', blob, 'recording.webm');

    try {
      const res = await fetch('/api/recordings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setTranscript(data.transcript);
        setAnalysis(data.analysis);
        toast.success('Recording processed');
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (err) {
      toast.error('Error uploading');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Screen Recorder</h1>
      <div className="space-y-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Stop Recording
          </button>
        )}
        {recordedVideo && (
          <video src={recordedVideo} controls className="w-full border rounded" />
        )}
        {isProcessing && <p>Processing recording...</p>}
        {transcript && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold">Transcript</h2>
            <p className="p-3 bg-gray-50 rounded">{transcript}</p>
          </div>
        )}
        {analysis && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold">AI Analysis</h2>
            <p className="p-3 bg-gray-50 rounded">{analysis}</p>
          </div>
        )}
      </div>
    </div>
  );
}
