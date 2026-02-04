"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
}

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [user, setUser] = useState<any>(null);
  const [recentAgents, setRecentAgents] = useState<any[]>([]);

  // Check authentication on component mount
  useEffect(() => {
    checkAuth();
    loadAgents();
    loadRecentAgents();
  }, []);

  const checkAuth = async () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
      } else {
        // Redirect to login if not authenticated
        router.push('/login');
      }
    }
    setIsLoading(false);
  };

  const loadAgents = async () => {
    try {
      const mockAgents: Agent[] = [
        {
          id: '1',
          name: 'Marketing Copywriter',
          description: 'Creates compelling marketing copy for ads, emails, and social media',
          category: 'Marketing',
          icon: '📝',
          color: 'from-pink-500 to-rose-500',
        },
        {
          id: '2',
          name: 'Code Assistant',
          description: 'Helps write, debug, and optimize code in multiple programming languages',
          category: 'Development',
          icon: '💻',
          color: 'from-blue-500 to-cyan-500',
        },
        {
          id: '3',
          name: 'Customer Support',
          description: 'Automates customer inquiries and provides 24/7 support',
          category: 'Support',
          icon: '🎯',
          color: 'from-green-500 to-emerald-500',
        },
        {
          id: '4',
          name: 'Content Summarizer',
          description: 'Summarizes long articles, reports, and documents into key points',
          category: 'Productivity',
          icon: '📊',
          color: 'from-purple-500 to-violet-500',
        },
        {
          id: '5',
          name: 'SEO Optimizer',
          description: 'Analyzes and optimizes content for search engine rankings',
          category: 'Marketing',
          icon: '🚀',
          color: 'from-orange-500 to-amber-500',
        },
        {
          id: '6',
          name: 'Data Analyst',
          description: 'Analyzes datasets and provides insights and visualizations',
          category: 'Analytics',
          icon: '📈',
          color: 'from-indigo-500 to-blue-500',
        },
        {
          id: '7',
          name: 'Social Media Manager',
          description: 'Creates and schedules social media posts across platforms',
          category: 'Marketing',
          icon: '📱',
          color: 'from-blue-500 to-teal-500',
        },
        {
          id: '8',
          name: 'Legal Assistant',
          description: 'Drafts legal documents and provides legal research assistance',
          category: 'Legal',
          icon: '⚖️',
          color: 'from-gray-500 to-gray-700',
        },
        {
          id: '9',
          name: 'Financial Advisor',
          description: 'Analyzes financial data and provides investment recommendations',
          category: 'Finance',
          icon: '💰',
          color: 'from-green-500 to-lime-500',
        },
      ];
      setAgents(mockAgents);
    } catch (error) {
      console.error('Failed to load agents:', error);
      toast.error('Failed to load agents');
    }
  };

  const loadRecentAgents = () => {
    // Load demo agents from localStorage
    if (typeof window !== 'undefined') {
      const demoAgents = JSON.parse(localStorage.getItem('demo_agents') || '[]');
      setRecentAgents(demoAgents.slice(0, 3)); // Show only 3 recent agents
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    router.push('/login');
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || agent.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories - ES5 compatible way
  const categories = ['All'];
  const uniqueCategories = new Set<string>();
  agents.forEach(agent => uniqueCategories.add(agent.category));
  uniqueCategories.forEach(category => {
    if (!categories.includes(category)) {
      categories.push(category);
    }
  });

  const handleQuickExecute = async (agentId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to execute agents');
        router.push('/login');
        return;
      }

      // Simple test execution
      toast.success('Redirecting to agent execution...');
      router.push(`/agents/${agentId}`);
    } catch (error) {
      toast.error('Failed to execute agent');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 mb-6">
            <span className="text-sm font-medium text-blue-400">✨ Welcome back, {user?.name || 'User'}!</span>
          </div>
          <h1 className="text-5xl font-bold mb-6">
            Your <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">AI Agents</span> Dashboard
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Discover, customize, and deploy AI agents to automate your workflows. 
            Start with pre-built agents or create your own in minutes.
          </p>
          
          {/* Hero Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/builder"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold text-white text-lg flex items-center justify-center space-x-2"
            >
              <span>🛠️</span>
              <span>Build Your Own Agent</span>
            </Link>
            <Link
              href="/marketplace"
              className="px-8 py-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl font-semibold text-white text-lg flex items-center justify-center space-x-2"
            >
              <span>🛍️</span>
              <span>Browse Marketplace</span>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto my-12">
            <div className="glass p-6 rounded-2xl">
              <div className="text-3xl font-bold gradient-text mb-2">{agents.length}+</div>
              <div className="text-gray-400">Available Agents</div>
            </div>
            <div className="glass p-6 rounded-2xl">
              <div className="text-3xl font-bold gradient-text mb-2">24/7</div>
              <div className="text-gray-400">AI Support</div>
            </div>
            <div className="glass p-6 rounded-2xl">
              <div className="text-3xl font-bold gradient-text mb-2">100%</div>
              <div className="text-gray-400">No-Code</div>
            </div>
            <div className="glass p-6 rounded-2xl">
              <div className="text-3xl font-bold gradient-text mb-2">{recentAgents.length}</div>
              <div className="text-gray-400">Your Agents</div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-grow">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search agents by name, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 pl-12 bg-gray-900/50 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
                />
                <div className="absolute left-4 top-4 text-gray-500">
                  🔍
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-6 py-4 bg-gray-900/50 border border-gray-700 rounded-2xl text-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              
              <Link
                href="/builder"
                className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-2xl font-semibold text-white transition-all duration-200 flex items-center space-x-2"
              >
                <span>+</span>
                <span>New Agent</span>
              </Link>
            </div>
          </div>
          
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Agents Section */}
        {recentAgents.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Your Recent Agents</h2>
              <Link href="/builder" className="text-blue-400 hover:text-blue-300">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentAgents.map((agent: any) => (
                <div
                  key={agent.id}
                  className="group bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-6 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition-all duration-300 card-hover"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 rounded-xl ${agent.color} flex items-center justify-center text-2xl`}>
                      {agent.icon}
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800/50 text-gray-400">
                      {agent.category}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3">{agent.name}</h3>
                  <p className="text-gray-400 mb-6">{agent.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/agents/${agent.id}`}
                      className="text-blue-400 hover:text-blue-300 font-medium text-sm"
                    >
                      Use Agent →
                    </Link>
                    <span className="text-xs text-gray-500">
                      {new Date(agent.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Featured Agent Grid */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Featured AI Agents</h2>
            <p className="text-gray-400">{filteredAgents.length} agents available</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map(agent => (
              <div
                key={agent.id}
                className="group glass p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all duration-300 card-hover"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-2xl`}>
                    {agent.icon}
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800/50 text-gray-400">
                    {agent.category}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold mb-3">{agent.name}</h3>
                <p className="text-gray-400 mb-6">{agent.description}</p>
                
                <div className="flex items-center justify-between">
                  <Link
                    href={`/agents/${agent.id}`}
                    className="text-blue-400 hover:text-blue-300 font-medium text-sm"
                  >
                    Try Agent →
                  </Link>
                  <button 
                    onClick={() => handleQuickExecute(agent.id)}
                    className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 rounded-lg text-sm font-medium text-blue-400 transition-all duration-200"
                  >
                    Quick Run
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {filteredAgents.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-2">No agents found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => {setSearchTerm(''); setSelectedCategory('All');}}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-medium text-white"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass p-6 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-2xl mb-4">
                ⚡
              </div>
              <h3 className="text-lg font-bold mb-2">Build Workflow</h3>
              <p className="text-gray-400 mb-4">Chain multiple agents together for complex automations</p>
              <Link href="/builder" className="text-blue-400 hover:text-blue-300 font-medium text-sm">
                Start Building →
              </Link>
            </div>
            
            <div className="glass p-6 rounded-2xl border border-gray-800 hover:border-purple-500/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-2xl mb-4">
                🛍️
              </div>
              <h3 className="text-lg font-bold mb-2">Browse Marketplace</h3>
              <p className="text-gray-400 mb-4">Discover 100+ pre-built agents from the community</p>
              <Link href="/marketplace" className="text-blue-400 hover:text-blue-300 font-medium text-sm">
                Explore Marketplace →
              </Link>
            </div>
            
            <div className="glass p-6 rounded-2xl border border-gray-800 hover:border-green-500/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center text-2xl mb-4">
                📊
              </div>
              <h3 className="text-lg font-bold mb-2">View Analytics</h3>
              <p className="text-gray-400 mb-4">Track agent performance and usage statistics</p>
              <Link href="/history" className="text-blue-400 hover:text-blue-300 font-medium text-sm">
                View Dashboard →
              </Link>
            </div>
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl border border-blue-500/20 p-8">
          <h2 className="text-2xl font-bold mb-6">Getting Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">1</div>
                <h3 className="font-semibold">Explore Agents</h3>
              </div>
              <p className="text-gray-400 text-sm">Browse our marketplace to discover AI agents for every task.</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">2</div>
                <h3 className="font-semibold">Create Your Own</h3>
              </div>
              <p className="text-gray-400 text-sm">Use our no-code builder to create custom AI agents in minutes.</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center">3</div>
                <h3 className="font-semibold">Automate Workflows</h3>
              </div>
              <p className="text-gray-400 text-sm">Chain multiple agents together to automate complex business processes.</p>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-400">
              Need help? Check out our <Link href="/docs" className="text-blue-400 hover:text-blue-300">documentation</Link> or join our <Link href="/community" className="text-blue-400 hover:text-blue-300">community</Link>.
            </p>
            <Link
              href="/builder"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold text-white"
            >
              Start Building Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}