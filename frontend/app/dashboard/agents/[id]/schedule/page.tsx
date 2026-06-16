'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { schedulesApi } from '@/lib/api';

interface ScheduleRun {
  id: string;
  status: string;
  ranAt: string;
  output: string;
  latencyMs: number;
}

interface Schedule {
  id: string;
  name: string;
  cronExpression: string;
  isActive: boolean;
  lastRunAt: string | null;
  nextRunAt: string | null;
  totalRuns: number;
  runs: ScheduleRun[];
}

const PRESETS = [
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every 6 hours', value: '0 */6 * * *' },
  { label: 'Every day at 9am', value: '0 9 * * *' },
  { label: 'Every day at midnight', value: '0 0 * * *' },
  { label: 'Every Monday', value: '0 9 * * 1' },
  { label: 'Every weekday', value: '0 9 * * 1-5' },
  { label: 'Every week', value: '0 9 * * 0' },
  { label: 'Every month', value: '0 9 1 * *' },
  { label: 'Custom', value: 'custom' },
];

export default function SchedulePage() {
  const { id } = useParams<{ id: string }>();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: '',
    preset: '0 * * * *',
    customCron: '',
    inputPayload: '{\n  "message": "Run your scheduled task now"\n}',
    isActive: true,
  });

  useEffect(() => {
    fetchSchedules();
  }, [id]);

  async function fetchSchedules() {
    const res = await schedulesApi.list(id);
    if (res.success) setSchedules(res.data || []);
    setLoading(false);
  }

  async function handleCreate() {
    if (!form.name.trim()) return;
    setCreating(true);
    
    let payloadObj = {};
    try {
      payloadObj = JSON.parse(form.inputPayload);
    } catch (e) {
      alert('Invalid JSON in input payload');
      setCreating(false);
      return;
    }

    const res = await schedulesApi.create(id, {
      name: form.name,
      cronExpression: form.preset === 'custom' ? form.customCron : form.preset,
      inputPayload: payloadObj,
      isActive: form.isActive,
    });

    if (res.success) {
      setSchedules(prev => [res.data, ...prev]);
      setShowForm(false);
      setForm({
        name: '',
        preset: '0 * * * *',
        customCron: '',
        inputPayload: '{\n  "message": "Run your scheduled task now"\n}',
        isActive: true,
      });
    } else {
      alert(res.message || 'Failed to create schedule');
    }
    setCreating(false);
  }

  async function toggleSchedule(scheduleId: string) {
    const res = await schedulesApi.toggle(scheduleId);
    if (res.success) {
      setSchedules(prev => prev.map(s => 
        s.id === scheduleId ? { ...s, isActive: res.data.isActive } : s
      ));
    }
  }

  async function deleteSchedule(scheduleId: string) {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    const res = await schedulesApi.delete(scheduleId);
    if (res.success) {
      setSchedules(prev => prev.filter(s => s.id !== scheduleId));
    }
  }

  async function runNow(scheduleId: string) {
    const res = await schedulesApi.runNow(scheduleId);
    if (res.success) {
      alert('Schedule run triggered!');
      setTimeout(fetchSchedules, 2000); // Reload to get run history
    } else {
      alert('Failed to run schedule');
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Scheduled Agents</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Set up cron jobs to run your agent automatically on a schedule.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-500 transition text-sm font-medium"
        >
          {showForm ? 'Cancel' : 'Create Schedule'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-5 space-y-4">
          <h3 className="text-white font-medium">New Schedule</h3>
          
          <div>
            <label className="text-zinc-400 text-sm block mb-1">Name</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Daily Summary Report"
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500/50"
            />
          </div>

          <div>
            <label className="text-zinc-400 text-sm block mb-1">Schedule</label>
            <div className="flex gap-3">
              <select
                value={form.preset}
                onChange={e => setForm({ ...form, preset: e.target.value })}
                className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500/50"
              >
                {PRESETS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              {form.preset === 'custom' && (
                <input
                  value={form.customCron}
                  onChange={e => setForm({ ...form, customCron: e.target.value })}
                  placeholder="* * * * *"
                  className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500/50"
                />
              )}
            </div>
          </div>

          <div>
            <label className="text-zinc-400 text-sm block mb-1">Input Payload (JSON)</label>
            <textarea
              value={form.inputPayload}
              onChange={e => setForm({ ...form, inputPayload: e.target.value })}
              rows={4}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg px-4 py-2 text-sm font-mono focus:outline-none focus:border-purple-500/50"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={e => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 rounded bg-[#1A1A1A] border border-[#2A2A2A] checked:bg-purple-600"
            />
            <label htmlFor="isActive" className="text-zinc-300 text-sm">Active</label>
          </div>

          <button
            onClick={handleCreate}
            disabled={creating || !form.name.trim()}
            className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-500 transition text-sm font-medium disabled:opacity-50"
          >
            {creating ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>
      )}

      {/* Schedules List */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-[#111111] border border-[#1E1E1E] rounded-xl h-32" />
          ))}
        </div>
      ) : schedules.length === 0 && !showForm ? (
        <div className="text-center py-16 bg-[#111111] border border-[#1E1E1E] rounded-xl">
          <p className="text-4xl mb-3">⏱️</p>
          <p className="text-white font-medium mb-1">No scheduled agents</p>
          <p className="text-zinc-400 text-sm">
            Create a schedule to automate your agent's tasks.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {schedules.map(schedule => (
            <div key={schedule.id} className="bg-[#111111] border border-[#1E1E1E] rounded-xl overflow-hidden">
              <div className="p-5 flex justify-between items-start border-b border-[#1E1E1E]">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-medium text-lg">{schedule.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${schedule.isActive ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-400'}`}>
                      {schedule.isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <p className="text-zinc-400 font-mono text-sm">{schedule.cronExpression}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => runNow(schedule.id)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                  >
                    Run Now
                  </button>
                  <button
                    onClick={() => toggleSchedule(schedule.id)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                  >
                    {schedule.isActive ? 'Pause' : 'Resume'}
                  </button>
                  <button
                    onClick={() => deleteSchedule(schedule.id)}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="bg-zinc-900/50 p-4 flex gap-8">
                <div>
                  <p className="text-zinc-500 text-xs mb-1">Last Run</p>
                  <p className="text-zinc-300 text-sm">{schedule.lastRunAt ? new Date(schedule.lastRunAt).toLocaleString() : 'Never'}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs mb-1">Total Runs</p>
                  <p className="text-zinc-300 text-sm">{schedule.totalRuns}</p>
                </div>
              </div>
              
              {schedule.runs && schedule.runs.length > 0 && (
                <div className="p-4 border-t border-[#1E1E1E]">
                  <h4 className="text-zinc-400 text-xs uppercase tracking-wider mb-3">Recent Runs</h4>
                  <div className="space-y-2">
                    {schedule.runs.map(run => (
                      <div key={run.id} className="flex items-center justify-between bg-zinc-900 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${run.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className="text-zinc-300 text-sm">{new Date(run.ranAt).toLocaleString()}</span>
                        </div>
                        <span className="text-zinc-500 text-xs">{run.latencyMs}ms</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
