import { User, Star, Clock } from 'lucide-react';

interface AgentCardProps {
  role: {
    value: string;
    description: string;
  };
}

export default function AgentCard({ role }: AgentCardProps) {
  const getRoleColor = (roleValue: string) => {
    const colors: Record<string, string> = {
      researcher: 'bg-blue-100 text-blue-800',
      validator: 'bg-green-100 text-green-800',
      executor: 'bg-purple-100 text-purple-800',
      qa_agent: 'bg-yellow-100 text-yellow-800',
      synthesizer: 'bg-pink-100 text-pink-800',
    };
    return colors[role.value] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-full flex items-center justify-center">
          <User className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900 capitalize">{role.value.replace('_', ' ')}</h3>
          <p className="text-sm text-gray-500">{role.description}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center text-sm text-gray-500">
          <Star className="h-4 w-4 text-yellow-400 mr-1" />
          <span>4.8</span>
        </div>
        <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Use
        </button>
      </div>
    </div>
  );
}

