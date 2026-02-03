"use client";

import { useState } from 'react';
import Link from 'next/link';

interface Agent {
  id: number;
  name: string;
  description: string;
  category: string;
  rating: number;
  reviews: number;
  price: string;
  icon: string;
}

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All');

  const agents: Agent[] = [
    {
      id: 1,
      name: 'Marketing Copywriter',
      description: 'Creates compelling marketing copy for ads, emails, and social media',
      category: 'Marketing',
      rating: 4.8,
      reviews: 124,
      price: 'Free',
      icon: '📝'
    },
    {
      id: 2,
      name: 'Code Assistant',
      description: 'Helps write, debug, and optimize code in multiple programming languages',
      category: 'Development',
      rating: 4.9,
      reviews: 89,
      price: '$19/mo',
      icon: '💻'
    },
    {
      id: 3,
      name: 'Customer Support',
      description: 'Automates customer inquiries and provides 24/7 support',
      category: 'Support',
      rating: 4.7,
      reviews: 203,
      price: '$29/mo',
      icon: '🎯'
    },
    {
      id: 4,
      name: 'Content Summarizer',
      description: 'Summarizes long articles, reports, and documents into key points',
      category: 'Productivity',
      rating: 4.6,
      reviews: 56,
      price: 'Free',
      icon: '📊'
    },
    {
      id: 5,
      name: 'SEO Optimizer',
      description: 'Analyzes and optimizes content for search engine rankings',
      category: 'Marketing',
      rating: 4.5,
      reviews: 78,
      price: '$15/mo',
      icon: '🚀'
    },
    {
      id: 6,
      name: 'Data Analyst',
      description: 'Analyzes datasets and provides insights and visualizations',
      category: 'Analytics',
      rating: 4.8,
      reviews: 45,
      price: '$25/mo',
      icon: '📈'
    },
    {
      id: 7,
      name: 'Social Media Manager',
      description: 'Creates and schedules social media posts across platforms',
      category: 'Marketing',
      rating: 4.4,
      reviews: 92,
      price: '$22/mo',
      icon: '📱'
    },
    {
      id: 8,
      name: 'Legal Assistant',
      description: 'Drafts legal documents and provides legal research assistance',
      category: 'Legal',
      rating: 4.7,
      reviews: 34,
      price: '$39/mo',
      icon: '⚖️'
    },
    {
      id: 9,
      name: 'Financial Advisor',
      description: 'Analyzes financial data and provides investment recommendations',
      category: 'Finance',
      rating: 4.9,
      reviews: 67,
      price: '$45/mo',
      icon: '💰'
    },
  ];

  const categories = ['All', 'Marketing', 'Development', 'Support', 'Productivity', 'Analytics', 'Sales', 'Design', 'Legal', 'Finance'];
  const priceOptions = ['All', 'Free', 'Paid'];

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || agent.category === selectedCategory;
    const matchesPrice = priceFilter === 'All' || 
                        (priceFilter === 'Free' && agent.price === 'Free') ||
                        (priceFilter === 'Paid' && agent.price !== 'Free');
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 mb-6">
            <span className="text-sm font-medium text-blue-400">✨ Discover Pre-built AI Agents</span>
          </div>
          <h1 className="text-5xl font-bold mb-6">
            AI Agent <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Marketplace</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Discover and deploy pre-built AI agents to automate any business task.
            No coding required. Try free or choose premium agents.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
            <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">{agents.length}+</div>
              <div className="text-gray-400">AI Agents</div>
            </div>
            <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">12</div>
              <div className="text-gray-400">Categories</div>
            </div>
            <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">4.7</div>
              <div className="text-gray-400">Avg Rating</div>
            </div>
            <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">5</div>
              <div className="text-gray-400">Free Agents</div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
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
            
            <div className="flex flex-col md:flex-row gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-6 py-4 bg-gray-900/50 border border-gray-700 rounded-2xl text-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'All' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="px-6 py-4 bg-gray-900/50 border border-gray-700 rounded-2xl text-white"
              >
                {priceOptions.map(option => (
                  <option key={option} value={option}>
                    {option === 'All' ? 'All Prices' : option}
                  </option>
                ))}
              </select>
              
              <button className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-2xl font-semibold text-white transition-all duration-200">
                🔄 Reset Filters
              </button>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
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

        {/* Results Info */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">
            {filteredAgents.length} {filteredAgents.length === 1 ? 'Agent' : 'Agents'} Available
          </h2>
          <p className="text-gray-400">
            Showing {filteredAgents.length} of {agents.length} agents
          </p>
        </div>

        {/* Agent Grid */}
        <div className="mb-16">
          {filteredAgents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-2">No agents found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => {setSearchTerm(''); setSelectedCategory('All'); setPriceFilter('All');}}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-medium text-white"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map(agent => (
                <div
                  key={agent.id}
                  className="group bg-gray-900/50 p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                      agent.price === 'Free' 
                        ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20' 
                        : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'
                    }`}>
                      {agent.icon}
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold mb-1 ${
                        agent.price === 'Free' ? 'text-green-400' : 'text-white'
                      }`}>
                        {agent.price}
                      </div>
                      <div className="text-xs text-gray-400">
                        {agent.price === 'Free' ? 'Free forever' : 'per month'}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3">{agent.name}</h3>
                  <p className="text-gray-400 mb-6">{agent.description}</p>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="flex text-yellow-400 mr-2">
                        {'★'.repeat(Math.floor(agent.rating))}
                        {'☆'.repeat(5 - Math.floor(agent.rating))}
                      </div>
                      <span className="text-sm text-gray-400">({agent.rating})</span>
                      <span className="text-sm text-gray-500 ml-2">• {agent.reviews} reviews</span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800/50 text-gray-400">
                      {agent.category}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-medium text-white">
                      {agent.price === 'Free' ? 'Get Free' : 'Try Free 7 Days'}
                    </button>
                    <Link 
                      href={`/agents/${agent.id}`}
                      className="px-4 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg font-medium text-gray-300"
                    >
                      Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="text-center py-12 border-t border-gray-800">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">
              Want to build your own custom AI agent?
            </h2>
            <p className="text-gray-400 mb-8">
              Use our no-code builder to create custom AI agents tailored to your specific business needs.
              No technical skills required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/agent-builder"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold text-white text-lg"
              >
                🛠️ Start Building Now
              </Link>
              <Link
                href="/pricing"
                className="px-8 py-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl font-semibold text-white text-lg"
              >
                💰 View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}