'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { agentsApi } from '@/lib/api';

const STEPS = [
  'Basic Info',
  'Model Config',
  'Compute & Pricing',
  'Review & Create',
];

const CATEGORIES = [
  'CHATBOT', 'DATA_ANALYST', 'CODE_ASSISTANT', 'RESEARCH',
  'AUTOMATION', 'CUSTOMER_SUPPORT', 'FINANCE', 'LEGAL', 'OTHER',
];

const PROVIDERS = [
  {
    id: 'groq',
    label: 'Groq (Free — Fastest)',
    badge: 'FREE',
    models: [
      'llama3-8b-8192',
      'llama3-70b-8192',
      'mixtral-8x7b-32768',
      'gemma-7b-it',
    ],
  },
  {
    id: 'huggingface',
    label: 'Hugging Face (Free)',
    badge: 'FREE',
    models: [
      'mistralai/Mistral-7B-Instruct-v0.2',
      'microsoft/Phi-3-mini-4k-instruct',
      'HuggingFaceH4/zephyr-7b-beta',
      'google/gemma-7b-it',
    ],
  },
  {
    id: 'ollama',
    label: 'Ollama (Self-Hosted)',
    badge: 'FREE',
    models: [
      'llama3',
      'mistral',
      'phi3',
      'gemma',
      'codellama',
    ],
  },
  {
    id: 'google',
    label: 'Google Gemini',
    badge: 'FREE TIER',
    models: [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro',
    ],
  },
  {
    id: 'openai',
    label: 'OpenAI',
    badge: 'PAID',
    models: [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
    ],
  },
  {
    id: 'anthropic',
    label: 'Anthropic',
    badge: 'PAID',
    models: [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
    ],
  },
  { id: 'custom', label: 'Custom', badge: 'VARIES', models: [] },
];

const PRICING_MODELS = ['FREE', 'PER_INVOCATION', 'PER_TOKEN'];

interface AgentForm {
  name: string;
  description: string;
  category: string;
  tags: string;
  modelProvider: string;
  modelName: string;
  customModel: string;
  systemPrompt: string;
  gpuRequired: boolean;
  pricingModel: string;
  pricePerCall: string;
  pricePerToken: string;
  isPublic: boolean;
}

export default function CreateAgentPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<AgentForm>({
    name: '',
    description: '',
    category: 'CHATBOT',
    tags: '',
    modelProvider: 'groq',
    modelName: 'llama3-8b-8192',
    customModel: '',
    systemPrompt: 'You are a helpful AI assistant.',
    gpuRequired: false,
    pricingModel: 'FREE',
    pricePerCall: '0.05',
    pricePerToken: '0.0001',
    isPublic: false,
  });

  const set = (key: keyof AgentForm, val: any) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const selectedProvider = PROVIDERS.find(p => p.id === form.modelProvider);

  const canNext = () => {
    if (step === 0) return form.name.length >= 3 && 
                           form.description.length >= 20;
    if (step === 1) return form.systemPrompt.length >= 10;
    return true;
  };

  const handleCreate = async (publish = false) => {
    setCreating(true);
    setError('');

    try {
      const slug = form.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const payload = {
      name: form.name,
      slug,
      description: form.description,
      category: form.category,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      modelProvider: form.modelProvider,
      modelName: form.modelProvider === 'custom' 
        ? form.customModel 
        : form.modelName,
      systemPrompt: form.systemPrompt,
      gpuRequired: form.gpuRequired,
      pricingModel: form.pricingModel,
      pricePerCall: parseFloat(form.pricePerCall) || 0,
      pricePerToken: parseFloat(form.pricePerToken) || 0,
      isPublic: form.isPublic,
      status: publish ? 'PUBLISHED' : 'DRAFT',
    };

      const res = await agentsApi.create(payload);
      if (res.success) {
        if (publish) {
          const pubRes = await agentsApi.publish((res.data as any).id);
          if (!pubRes.success) {
            setError(pubRes.error || pubRes.message || 'Created successfully, but failed to publish.');
            setCreating(false);
            return;
          }
        }
        router.push('/dashboard/agents');
      } else {
        const errorMsg = (res as any).error || (res as any).message || 'Failed to create agent';
        setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-4 md:p-8 w-full max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <a href="/dashboard/agents" 
           className="text-zinc-400 hover:text-white text-sm">
          ← Agents
        </a>
        <h1 className="text-2xl font-bold text-white">
          Create Agent
        </h1>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`flex-1 h-1 rounded-full transition-all ${
              i <= step ? 'bg-purple-600' : 'bg-zinc-700'
            }`} />
            {i === STEPS.length - 1 && null}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-zinc-400">
        {STEPS.map((s, i) => (
          <span key={s} className={i === step ? 'text-purple-400' : ''}>
            {s}
          </span>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-[#111111] border border-[#1E1E1E] 
                      rounded-xl p-6 space-y-5">

        {/* STEP 0: Basic Info */}
        {step === 0 && (
          <>
            <h2 className="text-white font-semibold text-lg">
              Basic Information
            </h2>
            <div>
              <label className="text-zinc-400 text-sm block mb-1">
                Agent Name *
              </label>
              <input value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="DataMind Pro"
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] 
                           text-white rounded-lg px-4 py-3 
                           focus:outline-none focus:border-purple-500/50"/>
            </div>
            <div>
              <label className="text-zinc-400 text-sm block mb-1">
                Description * (min 20 chars)
              </label>
              <textarea value={form.description}
                onChange={e => set('description', e.target.value)}
                rows={3} placeholder="What does this agent do?"
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] 
                           text-white rounded-lg px-4 py-3 resize-none
                           focus:outline-none focus:border-purple-500/50"/>
            </div>
            <div>
              <label className="text-zinc-400 text-sm block mb-2">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => set('category', cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium 
                                transition ${
                      form.category === cat
                        ? 'bg-purple-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}>
                    {cat.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-zinc-400 text-sm block mb-1">
                Tags (comma-separated)
              </label>
              <input value={form.tags}
                onChange={e => set('tags', e.target.value)}
                placeholder="analytics, data, insights"
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] 
                           text-white rounded-lg px-4 py-3
                           focus:outline-none focus:border-purple-500/50"/>
            </div>
          </>
        )}

        {/* STEP 1: Model Config */}
        {step === 1 && (
          <>
            <h2 className="text-white font-semibold text-lg">
              Model Configuration
            </h2>
            <div>
              <label className="text-zinc-400 text-sm block mb-2">
                Provider
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PROVIDERS.map(p => (
                  <button key={p.id}
                    type="button"
                    onClick={() => {
                      set('modelProvider', p.id);
                      if (p.models.length > 0) {
                        set('modelName', p.models[0]);
                      }
                    }}
                    className={`p-4 rounded-xl text-left transition border-2 ${
                      form.modelProvider === p.id
                        ? 'border-purple-600 bg-purple-600/10'
                        : 'border-[#2A2A2A] bg-zinc-800/30 hover:border-zinc-700'
                    }`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        p.badge === 'PAID' ? 'bg-zinc-700 text-zinc-300' : 'bg-green-500/20 text-green-400'
                      }`}>
                        {p.badge}
                      </span>
                    </div>
                    <span className={`block font-bold ${
                      form.modelProvider === p.id ? 'text-white' : 'text-zinc-400'
                    }`}>
                      {p.label.split(' (')[0]}
                    </span>
                    <span className="text-[10px] text-zinc-500 block mt-1 uppercase tracking-tight">
                      {p.label.includes('(') ? p.label.split('(')[1].replace(')', '') : ''}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {form.modelProvider !== 'custom' && 
             selectedProvider?.models.length ? (
              <div>
                <label className="text-zinc-400 text-sm block mb-1">
                  Model
                </label>
                <select value={form.modelName}
                  onChange={e => set('modelName', e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] 
                             text-white rounded-lg px-4 py-3
                             focus:outline-none focus:border-purple-500/50">
                  {selectedProvider.models.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            ) : form.modelProvider === 'custom' ? (
              <div>
                <label className="text-zinc-400 text-sm block mb-1">
                  Custom Model Name
                </label>
                <input value={form.customModel}
                  onChange={e => set('customModel', e.target.value)}
                  placeholder="my-model-v1"
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] 
                             text-white rounded-lg px-4 py-3
                             focus:outline-none focus:border-purple-500/50"/>
              </div>
            ) : null}

            <div>
              <label className="text-zinc-400 text-sm block mb-1">
                System Prompt *
              </label>
              <p className="text-zinc-600 text-xs mb-2">
                Use {'{{secret.KEY_NAME}}'} to inject secrets
              </p>
              <textarea value={form.systemPrompt}
                onChange={e => set('systemPrompt', e.target.value)}
                rows={8}
                placeholder="You are an expert AI assistant specialized in..."
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] 
                           text-white rounded-lg px-4 py-3 resize-none 
                           font-mono text-sm
                           focus:outline-none focus:border-purple-500/50"/>
              <p className="text-zinc-600 text-xs mt-1">
                {form.systemPrompt.length} characters
              </p>
            </div>
          </>
        )}

        {/* STEP 2: Compute & Pricing */}
        {step === 2 && (
          <>
            <h2 className="text-white font-semibold text-lg">
              Compute & Pricing
            </h2>

            <div className="flex items-center justify-between 
                            p-4 bg-zinc-800/50 rounded-xl">
              <div>
                <p className="text-white font-medium">GPU Required</p>
                <p className="text-zinc-400 text-sm">
                  For models needing GPU compute
                </p>
              </div>
              <button onClick={() => set('gpuRequired', !form.gpuRequired)}
                className={`w-12 h-6 rounded-full transition-all 
                            relative ${
                  form.gpuRequired ? 'bg-purple-600' : 'bg-zinc-600'
                }`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full 
                                  bg-white transition-all ${
                  form.gpuRequired ? 'left-6' : 'left-0.5'
                }`} />
              </button>
            </div>

            <div>
              <label className="text-zinc-400 text-sm block mb-2">
                Pricing Model
              </label>
              <div className="grid grid-cols-3 gap-3">
                {PRICING_MODELS.map(pm => (
                  <button key={pm} onClick={() => set('pricingModel', pm)}
                    className={`py-3 rounded-lg text-sm font-medium 
                                transition ${
                      form.pricingModel === pm
                        ? 'bg-purple-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}>
                    {pm.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {form.pricingModel === 'PER_INVOCATION' && (
              <div>
                <label className="text-zinc-400 text-sm block mb-1">
                  Price per call ($)
                </label>
                <input type="number" step="0.001" min="0"
                  value={form.pricePerCall}
                  onChange={e => set('pricePerCall', e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] 
                             text-white rounded-lg px-4 py-3
                             focus:outline-none focus:border-purple-500/50"/>
                <p className="text-zinc-500 text-xs mt-1">
                  You earn 80% · Platform takes 20%
                </p>
              </div>
            )}

            {form.pricingModel === 'PER_TOKEN' && (
              <div>
                <label className="text-zinc-400 text-sm block mb-1">
                  Price per token ($)
                </label>
                <input type="number" step="0.00001" min="0"
                  value={form.pricePerToken}
                  onChange={e => set('pricePerToken', e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] 
                             text-white rounded-lg px-4 py-3
                             focus:outline-none focus:border-purple-500/50"/>
              </div>
            )}

            <div className="flex items-center justify-between 
                            p-4 bg-zinc-800/50 rounded-xl">
              <div>
                <p className="text-white font-medium">
                  Public Marketplace
                </p>
                <p className="text-zinc-400 text-sm">
                  List on the public marketplace
                </p>
              </div>
              <button onClick={() => set('isPublic', !form.isPublic)}
                className={`w-12 h-6 rounded-full transition-all 
                            relative ${
                  form.isPublic ? 'bg-purple-600' : 'bg-zinc-600'
                }`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full 
                                  bg-white transition-all ${
                  form.isPublic ? 'left-6' : 'left-0.5'
                }`} />
              </button>
            </div>
          </>
        )}

        {/* STEP 3: Review */}
        {step === 3 && (
          <>
            <h2 className="text-white font-semibold text-lg">
              Review & Create
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Name', value: form.name },
                { label: 'Category', value: form.category },
                { label: 'Model', value: `${form.modelProvider} / ${form.modelName || form.customModel}` },
                { label: 'Pricing', value: form.pricingModel === 'FREE' ? 'Free' : form.pricingModel === 'PER_INVOCATION' ? `$${form.pricePerCall}/call` : `$${form.pricePerToken}/token` },
                { label: 'GPU Required', value: form.gpuRequired ? 'Yes' : 'No' },
                { label: 'Public', value: form.isPublic ? 'Yes' : 'No' },
              ].map(row => (
                <div key={row.label}
                     className="flex justify-between py-2 border-b 
                                border-[#1E1E1E] last:border-0">
                  <span className="text-zinc-400 text-sm">
                    {row.label}
                  </span>
                  <span className="text-white text-sm font-medium">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <p className="text-zinc-400 text-xs font-mono mb-1">
                System Prompt Preview:
              </p>
              <p className="text-zinc-300 text-sm font-mono line-clamp-3">
                {form.systemPrompt}
              </p>
            </div>
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
          className="border border-zinc-700 text-zinc-300 px-6 py-2.5 
                     rounded-lg hover:border-zinc-500 transition 
                     disabled:opacity-30 text-sm">
          Back
        </button>

        <div className="flex gap-3">
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="bg-purple-600 text-white font-medium px-6 py-2.5 
                         rounded-lg hover:bg-purple-500 transition 
                         disabled:opacity-50 text-sm">
              Next
            </button>
          ) : (
            <>
              <button onClick={() => handleCreate(false)}
                disabled={creating}
                className="border border-zinc-700 text-zinc-300 px-6 py-2.5 
                           rounded-lg hover:border-zinc-500 transition 
                           disabled:opacity-50 text-sm">
                {creating ? 'Creating...' : 'Save as Draft'}
              </button>
              <button onClick={() => handleCreate(true)}
                disabled={creating}
                className="bg-purple-600 text-white font-bold px-6 py-2.5 
                           rounded-lg hover:bg-purple-500 transition 
                           disabled:opacity-50 text-sm">
                {creating ? 'Creating...' : 'Create & Publish'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
