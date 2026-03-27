'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

export default function AgentChatPage() {
  const params = useParams();
  const agentId = params.id as string;
  const [agent, setAgent] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const res = await api.get(`/agents/${agentId}`);
        setAgent(res.data);
      } catch (err) {
        console.error('Failed to fetch agent', err);
      }
    };
    fetchAgent();
  }, [agentId]);

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setSending(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      senderId: 'user',
      receiverId: agentId,
      content: input,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const res = await api.post(`/agents/${agentId}/chat`, { message: input });
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        senderId: agentId,
        receiverId: 'user',
        content: res.data.response,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!agent) return <div>Agent not found.</div>;

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-2xl font-bold mb-2">Chat with {agent.name}</h1>
      <div className="flex-1 overflow-y-auto border rounded p-4 mb-4 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-2 flex ${msg.senderId === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-3 py-2 ${
                  msg.senderId === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border text-gray-800'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={sending}
        />
        <button
          onClick={sendMessage}
          disabled={sending || !input.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
