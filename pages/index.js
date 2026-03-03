export default function Home() {
  const testBackend = async () => {
    try {
      const res = await fetch('http://localhost:5000/health');
      const data = await res.json();
      alert(`✅ Backend working! ${JSON.stringify(data)}`);
    } catch (err) {
      alert('❌ Backend not reachable. Start: python ai_agent_mock_collab.py');
    }
  };
  
  const createAgent = async () => {
    const res = await fetch('http://localhost:5000/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Agent', type: 'researcher' })
    });
    const data = await res.json();
    alert(`Agent created: ${data.agent.name}`);
  };
  
  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>🤖 Agentic AI Platform</h1>
      <p>Phase 1: Foundation & MVP</p>
      <div style={{ marginTop: 20 }}>
        <button onClick={testBackend} style={{ marginRight: 10, padding: 10 }}>Test Backend</button>
        <button onClick={createAgent} style={{ padding: 10 }}>Create Test Agent</button>
      </div>
    </div>
  );
}
