"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AgentBuilderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Marketing',
    icon: '🤖',
    color: 'from-blue-500 to-purple-500',
    instructions: '',
    exampleInput: '',
    exampleOutput: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to create agents');
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      // Try to create agent via API
      const response = await fetch('http://localhost:8000/api/v1/agents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Agent created successfully!');
        router.push(`/agents/${data.id}`);
      } else {
        // If API fails, show success in demo mode
        toast.success('Agent created successfully! (Demo Mode)');
        
        // Create mock agent ID and redirect
        const mockAgentId = Date.now().toString();
        
        // Store in localStorage for demo
        const demoAgents = JSON.parse(localStorage.getItem('demo_agents') || '[]');
        demoAgents.push({
          id: mockAgentId,
          ...formData,
          created_at: new Date().toISOString(),
        });
        localStorage.setItem('demo_agents', JSON.stringify(demoAgents));
        
        // Redirect to agent page
        setTimeout(() => {
          router.push(`/agents/${mockAgentId}`);
        }, 1000);
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      toast.error('Failed to create agent. Using demo mode.');
      
      // Fallback to demo mode
      const mockAgentId = Date.now().toString();
      const demoAgents = JSON.parse(localStorage.getItem('demo_agents') || '[]');
      demoAgents.push({
        id: mockAgentId,
        ...formData,
        created_at: new Date().toISOString(),
      });
      localStorage.setItem('demo_agents', JSON.stringify(demoAgents));
      
      setTimeout(() => {
        router.push(`/agents/${mockAgentId}`);
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const categories = ['Marketing', 'Development', 'Support', 'Productivity', 'Analytics', 'Sales', 'Design', 'Finance', 'Legal', 'HR'];
  const icons = ['🤖', '📝', '💻', '🎯', '📊', '🚀', '💰', '📱', '⚡', '✨', '🔍', '🎨', '📈', '🔧', '🛡️', '💬', '🎓', '🔄', '📋', '🔔'];
  const colors = [
    { value: 'from-blue-500 to-purple-500', label: 'Blue-Purple' },
    { value: 'from-green-500 to-emerald-500', label: 'Green-Emerald' },
    { value: 'from-pink-500 to-rose-500', label: 'Pink-Rose' },
    { value: 'from-orange-500 to-amber-500', label: 'Orange-Amber' },
    { value: 'from-indigo-500 to-blue-500', label: 'Indigo-Blue' },
    { value: 'from-purple-500 to-pink-500', label: 'Purple-Pink' },
    { value: 'from-red-500 to-orange-500', label: 'Red-Orange' },
    { value: 'from-teal-500 to-cyan-500', label: 'Teal-Cyan' },
  ];

  // Sample templates
  const templates = [
    {
      name: 'Social Media Manager',
      description: 'Creates and schedules social media posts',
      category: 'Marketing',
      icon: '📱',
      color: 'from-pink-500 to-rose-500',
      instructions: 'Create engaging social media posts for various platforms. Use trending hashtags, emojis, and include calls to action.',
      exampleInput: 'Create a Twitter thread about AI ethics',
      exampleOutput: '🧵 AI Ethics: Why It Matters\n\n1. Transparency in AI decision-making builds trust\n2. Bias in training data leads to unfair outcomes\n3. Privacy concerns with data collection\n\n#AIethics #ResponsibleAI #MachineLearning'
    },
    {
      name: 'Code Reviewer',
      description: 'Reviews code and suggests improvements',
      category: 'Development',
      icon: '🔍',
      color: 'from-blue-500 to-cyan-500',
      instructions: 'Review code for bugs, security issues, and best practices. Provide constructive feedback and improvement suggestions.',
      exampleInput: 'Review this Python function for calculating fibonacci',
      exampleOutput: '✅ Good: Function works correctly\n⚠️ Improvement: Add input validation\n🐛 Bug: No handling for negative numbers\n💡 Suggestion: Use memoization for better performance'
    },
    {
      name: 'Meeting Summarizer',
      description: 'Summarizes meeting notes and action items',
      category: 'Productivity',
      icon: '📋',
      color: 'from-green-500 to-emerald-500',
      instructions: 'Extract key decisions, action items, and deadlines from meeting transcripts. Organize information clearly.',
      exampleInput: 'Summarize this team meeting about Q2 goals',
      exampleOutput: '📋 Q2 Meeting Summary\n\nKey Decisions:\n- Launch new feature by April 15\n- Increase marketing budget by 20%\n\nAction Items:\n- John: Complete UX designs by March 30\n- Sarah: Prepare marketing plan by April 5\n\nNext Meeting: April 10, 2 PM'
    }
  ];

  const applyTemplate = (template: any) => {
    setFormData(template);
    toast.success(`Template "${template.name}" loaded!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 mb-4">
              <span className="text-sm font-medium text-blue-400">✨ No-Code AI Agent Builder</span>
            </div>
            <h1 className="text-5xl font-bold mb-4">
              Create Your <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Custom AI Agent</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Build powerful AI agents without writing code. Customize instructions, examples, and behavior for your specific needs.
            </p>
          </div>

          {/* Template Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Start with a Template</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {templates.map((template, index) => (
                <div
                  key={index}
                  className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6 hover:border-gray-700 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  onClick={() => applyTemplate(template)}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl ${template.color} flex items-center justify-center text-2xl`}>
                      {template.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{template.name}</h3>
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-800 text-gray-400">
                        {template.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">{template.description}</p>
                  <button className="w-full py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 text-blue-400 rounded-lg">
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
              <h2 className="text-2xl font-bold mb-6">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Agent Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    placeholder="e.g., Social Media Manager"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Icon *
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {icons.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({...formData, icon})}
                        className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all ${
                          formData.icon === icon 
                            ? 'ring-2 ring-blue-500 bg-gray-800 scale-110' 
                            : 'bg-gray-800/50 hover:bg-gray-800 hover:scale-105'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Color Theme *
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {colors.map(color => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData({...formData, color: color.value})}
                        className={`h-10 rounded-lg ${color.value} flex items-center justify-center ${
                          formData.color === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''
                        }`}
                        title={color.label}
                      >
                        {formData.color === color.value && (
                          <span className="text-white text-sm">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  placeholder="Describe what your agent does..."
                />
                <p className="text-sm text-gray-500 mt-2">
                  Briefly explain the purpose and capabilities of your agent.
                </p>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
              <h2 className="text-2xl font-bold mb-6">Agent Instructions</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  System Instructions *
                </label>
                <textarea
                  name="instructions"
                  required
                  value={formData.instructions}
                  onChange={handleChange}
                  rows={8}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  placeholder={`Example: You are a helpful marketing assistant. Your role is to create engaging content that converts. 
Always include:
1. Clear value proposition
2. Emotional appeal
3. Strong call to action
4. Relevant hashtags for social media`}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Define the agent's personality, capabilities, and limitations. Be specific about format, tone, and response style.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Example Input
                  </label>
                  <textarea
                    name="exampleInput"
                    value={formData.exampleInput}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    placeholder="Example input from users..."
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Show what kind of inputs users should provide.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Example Output
                  </label>
                  <textarea
                    name="exampleOutput"
                    value={formData.exampleOutput}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    placeholder="Expected output from the agent..."
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Show what kind of outputs users should expect.
                  </p>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
              <h2 className="text-2xl font-bold mb-6">Agent Preview</h2>
              
              <div className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                  <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <div className={`w-16 h-16 rounded-xl ${formData.color} flex items-center justify-center text-3xl`}>
                      {formData.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{formData.name || 'Your Agent Name'}</h3>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="px-3 py-1 rounded-full text-sm bg-gray-700 text-gray-300">
                          {formData.category || 'Category'}
                        </span>
                        <span className="px-3 py-1 rounded-full text-sm bg-green-500/20 text-green-400">
                          Ready to Use
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => router.push('/marketplace')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold text-white"
                  >
                    Publish to Marketplace
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Description</h4>
                    <p className="text-gray-300">
                      {formData.description || 'Agent description will appear here...'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Example Usage</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-900/50 rounded-lg p-4">
                        <div className="text-xs text-gray-500 mb-2">Input</div>
                        <div className="text-sm text-gray-300">
                          {formData.exampleInput || 'User input example...'}
                        </div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-4">
                        <div className="text-xs text-gray-500 mb-2">Output</div>
                        <div className="text-sm text-gray-300">
                          {formData.exampleOutput || 'Agent response example...'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-gray-400 text-sm">
                <p>Your agent will be available in your dashboard immediately.</p>
                <p>You can edit or delete it anytime from your agent list.</p>
              </div>
              
              <div className="flex space-x-4">
                <Link
                  href="/"
                  className="px-6 py-3 bg-gray-800/50 hover:bg-gray-800 rounded-xl font-medium text-gray-300"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold text-white text-lg disabled:opacity-50 flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Agent & Continue'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}