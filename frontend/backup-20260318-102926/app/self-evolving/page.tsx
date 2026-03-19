'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function SelfEvolvingPage() {
  const [diagnostics, setDiagnostics] = useState([]);
  const [insights, setInsights] = useState([]);
  const [pricing, setPricing] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [diagRes, insightRes, priceRes] = await Promise.all([
        axios.get('/api/diagnostics'),
        axios.get('/api/insights/competitor'),
        axios.get('/api/pricing'),
      ]);
      setDiagnostics(diagRes.data);
      setInsights(insightRes.data);
      setPricing(priceRes.data);
    } catch (error) {
      console.error('Failed to fetch self-evolving data', error);
    }
  };

  const triggerIntegration = async () => {
    const apiName = prompt('Enter API name:');
    const docsUrl = prompt('Enter documentation URL:');
    if (apiName && docsUrl) {
      try {
        await axios.post('/api/integration/generate', { apiName, docsUrl });
        alert('Connector generated successfully!');
      } catch (error) {
        alert('Failed to generate connector');
      }
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Self-Evolving Platform</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Auto-Diagnosis Logs</h2>
        <table className="w-full border">
          <thead>
            <tr>
              <th>Time</th>
              <th>Metric</th>
              <th>Value</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {diagnostics.map((d: any) => (
              <tr key={d.id}>
                <td>{new Date(d.timestamp).toLocaleString()}</td>
                <td>{d.metric}</td>
                <td>{d.value.toFixed(2)}</td>
                <td>{d.actionTaken}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Competitor Insights</h2>
        <ul className="list-disc pl-5">
          {insights.map((i: any) => (
            <li key={i.id}>
              <strong>{i.competitor}:</strong> {i.feature}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Dynamic Pricing</h2>
        <table className="w-full border">
          <thead>
            <tr>
              <th>Agent Type</th>
              <th>Base Price</th>
              <th>Demand</th>
              <th>Multiplier</th>
              <th>Effective Price</th>
            </tr>
          </thead>
          <tbody>
            {pricing.map((p: any) => (
              <tr key={p.id}>
                <td>{p.agentType}</td>
                <td>${p.basePrice}</td>
                <td>{p.demand.toFixed(2)}</td>
                <td>{p.multiplier.toFixed(2)}x</td>
                <td>${(p.basePrice * p.multiplier).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <button
        onClick={triggerIntegration}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Generate New Integration
      </button>
    </div>
  );
}
