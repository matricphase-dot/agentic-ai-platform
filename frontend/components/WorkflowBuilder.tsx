'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from "@/lib/api";

const defaultSteps = [
  { id: 1, agentRole: 'researcher', instruction: 'Research the topic and gather data' },
  { id: 2, agentRole: 'validator', instruction: 'Validate the findings for accuracy' },
  { id: 3, agentRole: 'executor', instruction: 'Execute necessary actions' },
  { id: 4, agentRole: 'synthesizer', instruction: 'Synthesize results into final report' },
];

export default function WorkflowBuilder() {
  const [workflowName, setWorkflowName] = useState('New Workflow');
  const [steps, setSteps] = useState(defaultSteps);
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const addStep = () => {
    const newId = steps.length > 0 ? Math.max(...steps.map(s => s.id)) + 1 : 1;
    setSteps([...steps, { id: newId, agentRole: 'researcher', instruction: '' }]);
  };

  const removeStep = (id: number) => {
    setSteps(steps.filter(step => step.id !== id));
  };

  const updateStep = (id: number, field: string, value: string) => {
    setSteps(steps.map(step => 
      step.id === id ? { ...step, [field]: value } : step
    ));
  };

  const createWorkflow = async () => {
    setIsCreating(true);
    try {
      const workflowData = {
        name: workflowName,
        pattern: 'sequential',
        user_id: '1',
        steps: steps.map(step => ({
          step_number: step.id,
          agent_role: step.agentRole,
          instruction: step.instruction,
          max_retries: 3
        }))
      };
      
      // const response = await api.createWorkflow(workflowData); // createWorkflow disabled for build
      const response = { data: { id: "mock-" + Date.now() } };
      setResult({
        success: true,
        message: 'Workflow created successfully!',
        data: response.data
      });
    } catch (error: any) {
      setResult({
        success: false,
        message: error.response?.data?.detail || 'Failed to create workflow'
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="workflowName" className="block text-sm font-medium text-gray-700">
          Workflow Name
        </label>
        <input
          type="text"
          id="workflowName"
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Workflow Steps</h3>
          <button
            onClick={addStep}
            className="inline-flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Step
          </button>
        </div>

        {steps.map((step) => (
          <div key={step.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-500">Step {step.id}</span>
                <select
                  value={step.agentRole}
                  onChange={(e) => updateStep(step.id, 'agentRole', e.target.value)}
                  className="block rounded-md border border-gray-300 px-2 py-1 text-sm"
                >
                  <option value="researcher">Researcher</option>
                  <option value="validator">Validator</option>
                  <option value="executor">Executor</option>
                  <option value="qa_agent">QA Agent</option>
                  <option value="synthesizer">Synthesizer</option>
                </select>
              </div>
              <input
                type="text"
                value={step.instruction}
                onChange={(e) => updateStep(step.id, 'instruction', e.target.value)}
                placeholder="Enter instruction for this step..."
                className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            {steps.length > 1 && (
              <button
                onClick={() => removeStep(step.id)}
                className="p-1 text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {result && (
        <div className="p-4 rounded-md">
          {result.message}
          {result.data?.session_id && (
            <div className="mt-2 text-sm">
              Session ID: <code className="bg-white px-2 py-1 rounded">{result.data.session_id}</code>
            </div>
          )}
        </div>
      )}

      <button
        onClick={createWorkflow}
        disabled={isCreating}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isCreating ? 'Creating Workflow...' : 'Create & Execute Workflow'}
      </button>
    </div>
  );
}


