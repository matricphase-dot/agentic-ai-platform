'use client';
import { useEffect, useState } from 'react';
import { pipelinesApi, agentsApi } from '@/lib/api';

interface Agent {
  id: string;
  name: string;
  slug: string;
}

interface PipelineStep {
  id: string;
  agentId: string;
  name: string;
  inputTemplate: string;
  outputKey: string;
}

interface Pipeline {
  id: string;
  name: string;
  description: string;
  config: { steps: PipelineStep[]; maxSteps?: number };
  totalRuns: number;
  runs: any[];
}

export default function PipelinesPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<Agent[]>([]);

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [showRun, setShowRun] = useState<string | null>(null);

  // Create Form
  const [form, setForm] = useState({
    name: '',
    description: '',
    steps: [] as PipelineStep[],
  });
  
  // Run Form
  const [runInput, setRunInput] = useState('');
  const [runResult, setRunResult] = useState<any>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    fetchPipelines();
    fetchAgents();
  }, []);

  async function fetchPipelines() {
    const res = await pipelinesApi.list();
    if (res.success) setPipelines(res.data || []);
    setLoading(false);
  }

  async function fetchAgents() {
    const res = await agentsApi.list();
    if (res.success) setAgents(res.data || []);
  }

  function addStep() {
    setForm(prev => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          id: Date.now().toString(),
          agentId: agents[0]?.id || '',
          name: agents[0]?.name || 'Step',
          inputTemplate: '{{userInput}}',
          outputKey: `step_${prev.steps.length + 1}_output`,
        }
      ]
    }));
  }

  function updateStep(index: number, key: string, value: string) {
    const newSteps = [...form.steps];
    newSteps[index] = { ...newSteps[index], [key]: value };
    // If agentId changed, update name too
    if (key === 'agentId') {
      newSteps[index].name = agents.find(a => a.id === value)?.name || 'Step';
    }
    setForm(prev => ({ ...prev, steps: newSteps }));
  }

  function removeStep(index: number) {
    const newSteps = [...form.steps];
    newSteps.splice(index, 1);
    setForm(prev => ({ ...prev, steps: newSteps }));
  }

  async function createPipeline() {
    if (!form.name.trim() || form.steps.length === 0) return;
    const res = await pipelinesApi.create({
      name: form.name,
      description: form.description,
      config: { steps: form.steps },
    });
    if (res.success) {
      setPipelines(prev => [res.data, ...prev]);
      setShowCreate(false);
      setForm({ name: '', description: '', steps: [] });
    } else {
      alert(res.message || 'Failed to create pipeline');
    }
  }

  async function deletePipeline(id: string) {
    if (!confirm('Delete pipeline?')) return;
    const res = await pipelinesApi.delete(id);
    if (res.success) {
      setPipelines(prev => prev.filter(p => p.id !== id));
    }
  }

  async function runPipeline() {
    if (!showRun || !runInput.trim()) return;
    setRunning(true);
    setRunResult(null);
    const res = await pipelinesApi.run(showRun, runInput);
    if (res.success) {
      setRunResult(res.data);
      fetchPipelines();
    } else {
      alert(res.message || 'Run failed');
    }
    setRunning(false);
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Pipelines</h1>
          <p className="text-zinc-400 text-sm mt-1">Orchestrate multiple agents in a workflow.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-500 transition text-sm font-medium"
        >
          Create Pipeline
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-[#111111] border border-[#1E1E1E] rounded-xl h-40" />
          ))}
        </div>
      ) : pipelines.length === 0 ? (
        <div className="text-center py-16 bg-[#111111] border border-[#1E1E1E] rounded-xl">
          <p className="text-4xl mb-3">🔗</p>
          <p className="text-white font-medium mb-1">No pipelines yet</p>
          <p className="text-zinc-400 text-sm mb-4">Connect agents together to solve complex tasks.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="text-purple-400 hover:text-purple-300 text-sm font-medium"
          >
            Create your first pipeline
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pipelines.map(p => (
            <div key={p.id} className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white font-medium text-lg">{p.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowRun(p.id)}
                      className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-md text-xs font-medium transition"
                    >
                      Run Now
                    </button>
                    <button
                      onClick={() => deletePipeline(p.id)}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-1.5 rounded-md text-xs font-medium transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-zinc-400 text-sm mb-4">{p.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {p.config.steps.map((step, i) => (
                    <div key={step.id} className="flex items-center text-xs">
                      <span className="bg-zinc-800 text-zinc-300 px-2 py-1 rounded">{step.name}</span>
                      {i < p.config.steps.length - 1 && <span className="mx-1 text-zinc-600">→</span>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-xs text-zinc-500">
                {p.totalRuns} runs total
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <h2 className="text-xl font-bold text-white">Create Pipeline</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-zinc-400 text-sm block mb-1">Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Research & Summarize"
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div>
                <label className="text-zinc-400 text-sm block mb-1">Description</label>
                <input
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Researches a topic and summarizes the findings"
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div>
                <div className="flex justify-between items-end mb-3">
                  <label className="text-zinc-400 text-sm block">Pipeline Steps</label>
                  <button onClick={addStep} className="text-purple-400 hover:text-purple-300 text-xs font-medium">
                    + Add Step
                  </button>
                </div>
                
                <div className="space-y-4">
                  {form.steps.map((step, index) => (
                    <div key={step.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 relative">
                      <button onClick={() => removeStep(index)} className="absolute top-2 right-2 text-zinc-500 hover:text-red-400">
                        ✕
                      </button>
                      <div className="mb-2 font-medium text-white text-sm">Step {index + 1}</div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-zinc-500 text-xs block mb-1">Agent</label>
                          <select
                            value={step.agentId}
                            onChange={e => updateStep(index, 'agentId', e.target.value)}
                            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg px-3 py-2 text-sm focus:outline-none"
                          >
                            <option value="">Select an agent</option>
                            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-zinc-500 text-xs block mb-1">Output Variable Name</label>
                          <input
                            value={step.outputKey}
                            onChange={e => updateStep(index, 'outputKey', e.target.value)}
                            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg px-3 py-2 text-sm focus:outline-none font-mono"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <label className="text-zinc-500 text-xs block mb-1">Input Template</label>
                        <textarea
                          value={step.inputTemplate}
                          onChange={e => updateStep(index, 'inputTemplate', e.target.value)}
                          rows={2}
                          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg px-3 py-2 text-sm focus:outline-none font-mono"
                        />
                        <p className="text-[10px] text-zinc-500 mt-1">Use {'{{userInput}}'} or {'{{step_1_output}}'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#1E1E1E]">
              <button onClick={() => setShowCreate(false)} className="text-zinc-400 hover:text-white px-4 py-2 text-sm">
                Cancel
              </button>
              <button onClick={createPipeline} className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-500 text-sm font-medium">
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RUN MODAL */}
      {showRun && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <h2 className="text-xl font-bold text-white">Run Pipeline</h2>
            
            {!runResult ? (
              <div className="space-y-4">
                <div>
                  <label className="text-zinc-400 text-sm block mb-1">Input</label>
                  <textarea
                    value={runInput}
                    onChange={e => setRunInput(e.target.value)}
                    rows={4}
                    placeholder="Enter input for the pipeline..."
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-[#1E1E1E]">
                  <button disabled={running} onClick={() => setShowRun(null)} className="text-zinc-400 hover:text-white px-4 py-2 text-sm">
                    Cancel
                  </button>
                  <button disabled={running || !runInput.trim()} onClick={runPipeline} className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-500 text-sm font-medium disabled:opacity-50">
                    {running ? 'Running...' : 'Run Pipeline'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-white font-medium mb-2">Final Output</h3>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-zinc-300 text-sm whitespace-pre-wrap">
                    {runResult.output}
                  </div>
                </div>

                <div>
                  <h3 className="text-zinc-400 text-sm font-medium mb-3">Execution Steps</h3>
                  <div className="space-y-3">
                    {runResult.steps.map((step: any, i: number) => (
                      <div key={i} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-white font-medium text-sm">{step.agentName}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${step.status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {step.status} ({step.latencyMs}ms)
                          </span>
                        </div>
                        <div className="text-xs text-zinc-500 mt-2 mb-1">Output:</div>
                        <p className="text-zinc-400 text-xs bg-zinc-900 p-2 rounded line-clamp-3">
                          {step.output || step.error}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-[#1E1E1E]">
                  <button onClick={() => { setShowRun(null); setRunResult(null); setRunInput(''); }} className="bg-zinc-800 text-white px-6 py-2 rounded-lg hover:bg-zinc-700 text-sm font-medium">
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
