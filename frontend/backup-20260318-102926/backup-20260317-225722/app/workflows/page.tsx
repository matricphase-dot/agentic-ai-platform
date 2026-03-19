'use client';

import { useState } from 'react';
import { Play, Pause, Trash2, Copy, Eye } from 'lucide-react';

const mockWorkflows = [
  {
    id: '1',
    name: 'Market Research Pipeline',
    description: 'Research ? Validate ? Execute ? Report',
    status: 'completed',
    steps: 5,
    lastRun: '2024-01-15T10:30:00Z',
    runs: 12,
  },
  {
    id: '2',
    name: 'Content Creation Flow',
    description: 'Generate content, add SEO, publish',
    status: 'running',
    steps: 4,
    lastRun: '2024-01-15T09:15:00Z',
    runs: 8,
  },
  {
    id: '3',
    name: 'Data Analysis Pipeline',
    description: 'Collect, clean, analyze, visualize',
    status: 'draft',
    steps: 6,
    lastRun: null,
    runs: 0,
  },
];

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState(mockWorkflows);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      running: 'bg-blue-100 text-blue-800',
      draft: 'bg-gray-100 text-gray-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const runWorkflow = (id: string) => {
    setWorkflows(
      workflows.map((w) => (w.id === id ? { ...w, status: 'running' } : w))
    );
  };

  const deleteWorkflow = (id: string) => {
    setWorkflows(workflows.filter((w) => w.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflows</h1>
          <p className="text-gray-600">Create and manage automated workflows</p>
        </div>
        <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          + New Workflow
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Workflow Stats */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Workflows</span>
              <span className="font-semibold">{workflows.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Running Now</span>
              <span className="font-semibold text-blue-600">
                {workflows.filter((w) => w.status === 'running').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Runs</span>
              <span className="font-semibold">
                {workflows.reduce((sum, w) => sum + w.runs, 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium text-gray-900">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button className="w-full rounded-md bg-gray-50 px-4 py-3 text-left hover:bg-gray-100">
              Import from Template
            </button>
            <button className="w-full rounded-md bg-gray-50 px-4 py-3 text-left hover:bg-gray-100">
              View Documentation
            </button>
            <button className="w-full rounded-md bg-gray-50 px-4 py-3 text-left hover:bg-gray-100">
              Schedule Workflow
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium text-gray-900">
            Recent Activity
          </h2>
          <div className="text-sm text-gray-500">
            <div className="border-b py-2">
              Market Research Pipeline completed
            </div>
            <div className="border-b py-2">Content Creation Flow started</div>
            <div className="py-2">New workflow created: Data Analysis</div>
          </div>
        </div>
      </div>

      {/* Workflows List */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900">All Workflows</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium text-gray-900">
                      {workflow.name}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${getStatusColor(workflow.status)}`}
                    >
                      {workflow.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {workflow.description}
                  </p>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <span>{workflow.steps} steps</span>
                    <span>{workflow.runs} runs</span>
                    {workflow.lastRun && (
                      <span>
                        Last run:{' '}
                        {new Date(workflow.lastRun).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => runWorkflow(workflow.id)}
                    className="p-2 text-green-600 hover:text-green-800"
                    title="Run"
                  >
                    <Play className="h-5 w-5" />
                  </button>
                  <button
                    className="p-2 text-blue-600 hover:text-blue-800"
                    title="View"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    className="p-2 text-gray-600 hover:text-gray-800"
                    title="Duplicate"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => deleteWorkflow(workflow.id)}
                    className="p-2 text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
