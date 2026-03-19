export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  avatar?: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'idle' | 'error' | 'maintenance';
  type: 'chatbot' | 'analytics' | 'content' | 'development' | 'research';
  tasksCompleted: number;
  lastActive: Date;
  createdAt: Date;
  configuration: Record<string, any>;
}

export interface Task {
  id: string;
  agentId: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  completedAt?: Date;
  result?: any;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'archived';
  agents: string[];
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}
