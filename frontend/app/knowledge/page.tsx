'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Upload, Send, Loader2, FileText } from 'lucide-react';

export default function KnowledgePage() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [querying, setQuerying] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadResult(`âœ… Indexed ${res.data.chunks} chunks.`);
    } catch (err) {
      console.error(err);
      setUploadResult('âŒ Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleQuery = async () => {
    if (!question.trim()) return;
    setQuerying(true);
    setAnswer('');
    try {
      const res = await api.post('/documents/query', { question });
      setAnswer(res.data.answer);
    } catch (err) {
      console.error(err);
      setAnswer('âŒ Query failed.');
    } finally {
      setQuerying(false);
    }
  };

  if (!user) return <div className="p-8 text-center">Please log in</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Knowledge Base</h1>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Upload Document
          </h2>
          <input
            type="file"
            accept=".txt,.pdf,.md"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mb-4 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2"
          >
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            {uploading ? 'Uploading...' : 'Upload & Index'}
          </button>
          {uploadResult && <p className="mt-2 text-sm text-gray-600">{uploadResult}</p>}
        </div>

        {/* Query Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Ask a Question</h2>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full p-3 border rounded-lg mb-4"
            rows={4}
            placeholder="What would you like to know about your documents?"
          />
          <button
            onClick={handleQuery}
            disabled={!question.trim() || querying}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300 flex items-center gap-2"
          >
            {querying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {querying ? 'Thinking...' : 'Ask'}
          </button>
          {answer && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg whitespace-pre-wrap">
              {answer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
