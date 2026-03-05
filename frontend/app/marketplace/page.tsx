"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { 
  Bot, Code, Headphones, Search, BarChart, BookOpen, Zap, Store,
  Compass, Dumbbell, Languages, DollarSign, Utensils, Heart, Gamepad,
  Mail, Scale, Feather, X, ChevronRight
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  systemPrompt: string;
  category: string;
  popularity: number;
  tags: string[];
  icon: string;
}

const iconMap: Record<string, JSX.Element> = {
  Headphones: <Headphones className="w-6 h-6" />,
  BarChart: <BarChart className="w-6 h-6" />,
  Code: <Code className="w-6 h-6" />,
  BookOpen: <BookOpen className="w-6 h-6" />,
  Zap: <Zap className="w-6 h-6" />,
  Compass: <Compass className="w-6 h-6" />,
  Dumbbell: <Dumbbell className="w-6 h-6" />,
  Languages: <Languages className="w-6 h-6" />,
  DollarSign: <DollarSign className="w-6 h-6" />,
  Utensils: <Utensils className="w-6 h-6" />,
  Heart: <Heart className="w-6 h-6" />,
  Gamepad: <Gamepad className="w-6 h-6" />,
  Mail: <Mail className="w-6 h-6" />,
  Scale: <Scale className="w-6 h-6" />,
  Feather: <Feather className="w-6 h-6" />,
};

export default function MarketplacePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deploying, setDeploying] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await api.get('/templates');
        setTemplates(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch templates:', err);
        setError(err.message || 'Failed to load templates');
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const deployTemplate = async (template: Template) => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setDeploying(template.id);
    try {
      const agentData = {
        name: `${template.name} (${new Date().toLocaleTimeString()})`,
        description: template.description,
        capabilities: template.capabilities,
        systemPrompt: template.systemPrompt,
      };
      const response = await api.post('/agents', agentData);
      alert(`✅ Agent "${response.data.name}" created successfully!`);
      router.push('/agent-chat');
    } catch (err: any) {
      console.error('Deployment failed:', err);
      alert('❌ Failed to deploy agent. See console.');
    } finally {
      setDeploying(null);
    }
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                         t.description.toLowerCase().includes(search.toLowerCase()) ||
                         (t.tags && t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())));
    const matchesCategory = category === 'all' || t.category === category;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border rounded-lg p-6 bg-gray-50">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Agent Marketplace</h1>
      <p className="text-gray-600 mb-6">Browse and deploy pre-built agent templates</p>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search templates..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No templates found. Try adjusting your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <div key={template.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-white flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  {iconMap[template.icon] || <Bot className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{template.category}</span>
                    {template.tags?.includes('popular') && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">🔥 Popular</span>
                    )}
                    {template.tags?.includes('new') && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✨ New</span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4 flex-1">{template.description}</p>
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-500 mb-1">Capabilities:</div>
                <div className="flex flex-wrap gap-1">
                  {template.capabilities.map(cap => (
                    <span key={cap} className="bg-gray-100 text-xs px-2 py-1 rounded-full">
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => setSelectedTemplate(template)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-1"
                >
                  Details <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deployTemplate(template)}
                  disabled={deploying === template.id}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors text-sm"
                >
                  {deploying === template.id ? 'Deploying...' : 'Deploy'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                    {iconMap[selectedTemplate.icon] || <Bot className="w-8 h-8" />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedTemplate.name}</h2>
                    <div className="flex gap-2 mt-1">
                      <span className="text-sm bg-gray-100 px-2 py-0.5 rounded-full">{selectedTemplate.category}</span>
                      {selectedTemplate.tags?.includes('popular') && (
                        <span className="text-sm bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">🔥 Popular</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-gray-700 mb-6">{selectedTemplate.description}</p>

              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">System Prompt</h3>
                <div className="bg-gray-50 p-4 rounded-lg border text-sm font-mono whitespace-pre-wrap">
                  {selectedTemplate.systemPrompt}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">Capabilities</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.capabilities.map(cap => (
                    <span key={cap} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => deployTemplate(selectedTemplate)}
                  disabled={deploying === selectedTemplate.id}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                >
                  {deploying === selectedTemplate.id ? 'Deploying...' : 'Deploy This Agent'}
                </button>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



