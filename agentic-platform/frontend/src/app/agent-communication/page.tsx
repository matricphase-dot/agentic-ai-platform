// frontend/src/app/agent-communication/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/services/api';
import { toast } from 'react-hot-toast';

interface Agent {
  agent_id: string;
  agent_name: string;
  status: string;
  agent_type: string;
  last_active: string;
  capabilities: string[];
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: any;
  message_type: string;
  timestamp: string;
  delivered: boolean;
}

interface Conversation {
  id: string;
  conversation_id: string;
  topic: string;
  participants: string[];
  participant_count: number;
  message_count: number;
  last_message_at: string;
}

export default function AgentCommunicationPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [agentId, setAgentId] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedConversation, setSelectedConversation] = useState('');
  
  const wsRef = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    fetchData();
    
    // Generate random agent ID for testing
    const randomId = `agent-${Math.random().toString(36).substr(2, 9)}`;
    setAgentId(randomId);
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);
  
  const fetchData = async () => {
    try {
      const [agentsRes, convsRes] = await Promise.all([
        api.get('/api/v1/agent-communication/agents'),
        api.get('/api/v1/agent-communication/conversations')
      ]);
      
      setAgents(agentsRes.data);
      setConversations(convsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load agent network data');
    } finally {
      setLoading(false);
    }
  };
  
  const connectWebSocket = () => {
    if (!agentId) {
      toast.error('Please enter an Agent ID');
      return;
    }
    
    const wsUrl = `ws://${window.location.host.replace('http://', '').replace('https://', '')}/api/v1/ws/agent/${agentId}`;
    
    try {
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        setWsConnected(true);
        toast.success('Connected to agent network');
        
        // Register agent
        wsRef.current?.send(JSON.stringify({
          type: 'register',
          agent_id: agentId,
          agent_info: {
            name: `Agent ${agentId}`,
            type: 'web_client',
            capabilities: ['chat', 'collaboration']
          }
        }));
      };
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };
      
      wsRef.current.onclose = () => {
        setWsConnected(false);
        toast.error('Disconnected from agent network');
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('WebSocket connection error');
      };
      
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      toast.error('Failed to connect to agent network');
    }
  };
  
  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'registered':
        toast.success(`Agent registered as ${data.agent_id}`);
        break;
      
      case 'message_sent':
        toast.success('Message sent successfully');
        break;
      
      case 'agent_joined':
        toast.info(`Agent ${data.agent_id} joined the network`);
        fetchData(); // Refresh agent list
        break;
      
      case 'agent_left':
        toast.info(`Agent ${data.agent_id} left the network`);
        fetchData(); // Refresh agent list
        break;
      
      case 'conversation_created':
        toast.success(`Created conversation: ${data.conversation_id}`);
        fetchData(); // Refresh conversations
        break;
      
      case 'message':
        // Handle incoming message
        setMessages(prev => [...prev, data.message]);
        toast.info(`New message from ${data.message.sender_id}`);
        break;
      
      default:
        console.log('Received WebSocket message:', data);
    }
  };
  
  const sendMessage = () => {
    if (!wsRef.current || !wsConnected) {
      toast.error('Not connected to agent network');
      return;
    }
    
    if (!messageInput.trim()) {
      toast.error('Please enter a message');
      return;
    }
    
    if (!selectedAgent && !selectedConversation) {
      toast.error('Please select an agent or conversation');
      return;
    }
    
    const message = {
      type: 'message',
      receiver_id: selectedAgent,
      content: messageInput,
      message_type: 'text',
      conversation_id: selectedConversation || undefined
    };
    
    wsRef.current.send(JSON.stringify(message));
    setMessageInput('');
  };
  
  const createConversation = () => {
    if (!wsRef.current || !wsConnected) {
      toast.error('Not connected to agent network');
      return;
    }
    
    const topic = prompt('Enter conversation topic:');
    if (!topic) return;
    
    const participants = agents
      .filter(agent => agent.agent_id !== agentId)
      .map(agent => agent.agent_id)
      .slice(0, 3); // Limit to 3 other agents
    
    if (participants.length === 0) {
      toast.error('No other agents available');
      return;
    }
    
    wsRef.current.send(JSON.stringify({
      type: 'collaboration',
      action: 'create_conversation',
      participants,
      topic
    }));
  };
  
  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      setWsConnected(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Agent Communication Network</h1>
      
      {/* Connection Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Agent Connection</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Agent ID</label>
            <input
              type="text"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Enter agent ID"
            />
          </div>
          
          <div className="flex gap-2">
            {!wsConnected ? (
              <button
                onClick={connectWebSocket}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Connect to Network
              </button>
            ) : (
              <button
                onClick={disconnectWebSocket}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Disconnect
              </button>
            )}
          </div>
          
          <div className={`px-4 py-2 rounded-lg font-medium ${wsConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            Status: {wsConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Agents Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Connected Agents</h2>
            <button
              onClick={fetchData}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Refresh
            </button>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {agents.map((agent) => (
              <div
                key={agent.agent_id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedAgent === agent.agent_id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => {
                  setSelectedAgent(agent.agent_id);
                  setSelectedConversation('');
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{agent.agent_name}</h3>
                    <p className="text-sm text-gray-500">{agent.agent_id}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    agent.status === 'online'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {agent.status}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {agent.capabilities.slice(0, 3).map((cap) => (
                    <span
                      key={cap}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            
            {agents.length === 0 && (
              <p className="text-gray-500 text-center py-8">No agents connected</p>
            )}
          </div>
        </div>
        
        {/* Conversations Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Conversations</h2>
            <button
              onClick={createConversation}
              disabled={!wsConnected}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              + New
            </button>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {conversations.map((conv) => (
              <div
                key={conv.conversation_id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedConversation === conv.conversation_id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => {
                  setSelectedConversation(conv.conversation_id);
                  setSelectedAgent('');
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {conv.topic || 'Untitled Conversation'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {conv.participant_count} participants • {conv.message_count} messages
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-gray-500 truncate">
                    Participants: {conv.participants.join(', ')}
                  </p>
                </div>
              </div>
            ))}
            
            {conversations.length === 0 && (
              <p className="text-gray-500 text-center py-8">No conversations yet</p>
            )}
          </div>
        </div>
        
        {/* Chat Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Chat</h2>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {selectedAgent && `Talking to: ${selectedAgent}`}
              {selectedConversation && `In conversation: ${selectedConversation}`}
              {!selectedAgent && !selectedConversation && 'Select an agent or conversation'}
            </p>
          </div>
          
          {/* Messages Area */}
          <div className="h-64 border border-gray-200 rounded-lg p-4 mb-4 overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-3 p-3 rounded-lg max-w-xs ${
                  msg.sender_id === agentId
                    ? 'bg-blue-100 ml-auto'
                    : 'bg-gray-100'
                }`}
              >
                <div className="text-xs text-gray-500 mb-1">
                  {msg.sender_id === agentId ? 'You' : msg.sender_id}
                </div>
                <div className="text-gray-900">
                  {typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
            
            {messages.length === 0 && (
              <p className="text-gray-500 text-center py-8">No messages yet</p>
            )}
          </div>
          
          {/* Message Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              disabled={!wsConnected || (!selectedAgent && !selectedConversation)}
            />
            <button
              onClick={sendMessage}
              disabled={!wsConnected || !messageInput.trim() || (!selectedAgent && !selectedConversation)}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}