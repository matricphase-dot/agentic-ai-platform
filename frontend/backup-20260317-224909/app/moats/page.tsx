'use client';

import { useState, useEffect } from 'react';
import axios from '../../lib/axios';

export default function MoatsPage() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [targetAgent, setTargetAgent] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [keyResult, setKeyResult] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    if (selectedAgent) fetchMessages();
  }, [selectedAgent]);

  const fetchAgents = async () => {
    try {
      const res = await axios.get('/api/agents');
      setAgents(res.data);
    } catch (err) {
      console.error('Error fetching agents:', err);
    }
  };

  const fetchMessages = async () => {
    if (!selectedAgent) return;
    try {
      const res = await axios.get(`/api/messages?agentId=${selectedAgent}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const generateKey = async () => {
    if (!selectedAgent) return alert('Select an agent');
    try {
      const res = await axios.post(`/api/quantum/keys`, { agentId: selectedAgent });
      setKeyResult(`Key generated: ${res.data.publicKey}`);
    } catch (err: any) {
      setKeyResult('Error: ' + err.response?.data?.error);
    }
  };

  const sendMessage = async () => {
    if (!selectedAgent || !targetAgent || !messageContent) return alert('Fill all fields');
    try {
      const content = JSON.parse(messageContent);
      const response = await axios.post('/api/messages/send', {
        fromAgentId: selectedAgent,
        toAgentId: targetAgent,
        content
      });
      if (response.data) {
        alert('Message sent');
        setMessageContent('');
        fetchMessages();
      }
    } catch (err: any) {
      alert('Error: ' + err.response?.data?.error);
    }
  };

  const startConsensus = async () => {
    alert('Consensus round started (mock)');
  };

  return (
    <div className="p-8">
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Select Your Agent</label>
        <select
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
          className="border p-2 w-full max-w-md"
        >
          <option value="">-- Select --</option>
          {agents.map((a: any) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quantum Key Generation */}
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Quantum Key</h2>
          <button
            onClick={generateKey}
            disabled={!selectedAgent}
            className="bg-purple-600 text-white px-4 py-2 rounded"
          >
            Generate Key
          </button>
          {keyResult && <p className="mt-2 text-sm break-all">{keyResult}</p>}
        </div>

        {/* A2AP Messaging */}
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">A2AP Messaging</h2>
          <div className="mb-2">
            <label className="block text-sm">Target Agent ID</label>
            <input
              type="text"
              value={targetAgent}
              onChange={(e) => setTargetAgent(e.target.value)}
              className="border p-2 w-full"
              placeholder="Agent ID"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm">Message (JSON)</label>
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              className="border p-2 w-full"
              rows={3}
              placeholder='{"text": "hello"}'
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!selectedAgent || !targetAgent || !messageContent}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Send Message
          </button>
          <div className="mt-4">
            <h3 className="font-semibold">Inbox</h3>
            {messages.length === 0 ? (
              <p className="text-sm">No messages</p>
            ) : (
              <ul className="text-sm">
                {messages.map((m: any) => (
                  <li key={m.id} className="border-b py-1">
                    <strong>From:</strong> {m.fromAgentId}<br />
                    <strong>Content:</strong> {JSON.stringify(m.content)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Distributed Consensus placeholder */}
        <div className="border p-4 rounded md:col-span-2">
          <h2 className="text-xl font-semibold mb-2">Distributed Consensus</h2>
          <p className="mb-2">Start a consensus round (mock).</p>
          <button
            onClick={startConsensus}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Start Round
          </button>
        </div>
      </div>
    </div>
  );
}
