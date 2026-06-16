'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { apiRequest } from '@/lib/api';

interface KnowledgeBase {
  id: string;
  name: string;
  status: string;
  totalChunks: number;
  documents: Document[];
}

interface Document {
  id: string;
  filename: string;
  fileSize: number;
  status: string;
  chunkCount: number;
}

export default function KnowledgePage() {
  const { id } = useParams<{ id: string }>();
  const [kbs, setKbs] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedKb, setSelectedKb] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newKbName, setNewKbName] = useState('');

  useEffect(() => {
    fetchKbs();
  }, [id]);

  async function fetchKbs() {
    const res = await apiRequest(`/agents/${id}/knowledge-bases`);
    if (res.success) setKbs(res.data || []);
    setLoading(false);
  }

  async function createKb() {
    if (!newKbName.trim()) return;
    setCreating(true);
    const res = await apiRequest(`/agents/${id}/knowledge-bases`, {
      method: 'POST',
      body: JSON.stringify({ name: newKbName }),
    });
    if (res.success) {
      setKbs(prev => [res.data, ...prev]);
      setSelectedKb(res.data.id);
      setNewKbName('');
    }
    setCreating(false);
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!selectedKb || acceptedFiles.length === 0) return;
    
    setUploading(true);
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('agenticai_token');
    const API = process.env.NEXT_PUBLIC_API_URL || 
      'https://agenticai-backend-xao9.onrender.com';
    
    try {
      const res = await fetch(`${API}/api/knowledge-bases/${selectedKb}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        fetchKbs();
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
    setUploading(false);
  }, [selectedKb]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    disabled: !selectedKb || uploading,
  });

  function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Knowledge Base</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Upload documents so your agent can reference them when answering questions
        </p>
      </div>

      {/* Create KB */}
      <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-5">
        <h3 className="text-white font-medium mb-4">Create Knowledge Base</h3>
        <div className="flex gap-3">
          <input
            value={newKbName}
            onChange={e => setNewKbName(e.target.value)}
            placeholder="e.g. Product Documentation"
            className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] text-white 
                       rounded-lg px-4 py-2.5 text-sm focus:outline-none 
                       focus:border-purple-500/50"
          />
          <button
            onClick={createKb}
            disabled={creating || !newKbName.trim()}
            className="bg-purple-600 text-white px-5 py-2.5 rounded-lg 
                       hover:bg-purple-500 transition text-sm font-medium 
                       disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>

      {/* Knowledge Bases */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-[#111111] border border-[#1E1E1E] 
                                     rounded-xl h-32" />
          ))}
        </div>
      ) : kbs.length === 0 ? (
        <div className="text-center py-16 bg-[#111111] border 
                        border-[#1E1E1E] rounded-xl">
          <p className="text-4xl mb-3">📚</p>
          <p className="text-white font-medium mb-1">No knowledge bases yet</p>
          <p className="text-zinc-400 text-sm">
            Create one above to give your agent document memory
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {kbs.map(kb => (
            <div key={kb.id}
                 className={`bg-[#111111] border rounded-xl p-5 cursor-pointer 
                             transition ${
                   selectedKb === kb.id
                     ? 'border-purple-500/50'
                     : 'border-[#1E1E1E] hover:border-zinc-700'
                 }`}
                 onClick={() => setSelectedKb(kb.id)}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📚</span>
                  <div>
                    <p className="text-white font-medium">{kb.name}</p>
                    <p className="text-zinc-400 text-xs">
                      {kb.totalChunks} chunks indexed
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  kb.status === 'ready'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {kb.status}
                </span>
              </div>

              {/* Documents list */}
              {kb.documents.length > 0 && (
                <div className="space-y-2 mb-4">
                  {kb.documents.map(doc => (
                    <div key={doc.id}
                         className="flex items-center justify-between 
                                    bg-zinc-900 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">📄</span>
                        <span className="text-zinc-300 text-xs truncate 
                                         max-w-xs">
                          {doc.filename}
                        </span>
                        <span className="text-zinc-600 text-xs">
                          {formatBytes(doc.fileSize)}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        doc.status === 'ready'
                          ? 'bg-green-500/20 text-green-400'
                          : doc.status === 'processing'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {doc.status === 'ready'
                          ? `${doc.chunkCount} chunks`
                          : doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload zone */}
              {selectedKb === kb.id && (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-6 
                              text-center transition cursor-pointer ${
                    isDragActive
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-zinc-700 hover:border-zinc-500'
                  } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <input {...getInputProps()} />
                  {uploading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-purple-500 
                                      border-t-transparent rounded-full 
                                      animate-spin" />
                      <p className="text-zinc-400 text-sm">Processing...</p>
                    </div>
                  ) : isDragActive ? (
                    <p className="text-purple-400 text-sm">Drop file here</p>
                  ) : (
                    <div>
                      <p className="text-3xl mb-2">📎</p>
                      <p className="text-white text-sm font-medium">
                        Drop a file or click to upload
                      </p>
                      <p className="text-zinc-500 text-xs mt-1">
                        PDF, TXT, MD, DOCX — max 10MB
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
