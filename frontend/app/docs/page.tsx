"use client";

import { useState } from "react";

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", title: "Overview" },
    { id: "authentication", title: "Authentication" },
    { id: "agents", title: "Agents API" },
    { id: "staking", title: "Staking" },
    { id: "governance", title: "Governance" },
    { id: "webhooks", title: "Webhooks" },
    { id: "nodes", title: "Compute Nodes" },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">Documentation</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-64 flex-shrink-0">
          <nav className="space-y-2 sticky top-8">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-4 py-2 rounded transition ${
                  activeSection === section.id
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {section.title}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 prose max-w-none">
          {activeSection === "overview" && (
            <>
              <h2>Overview</h2>
              <p>
                Welcome to the Agentic AI Platform API documentation. Our platform enables you to create, manage, and monetize AI agents. This guide covers the core endpoints and concepts.
              </p>
              <h3>Base URL</h3>
              <pre className="bg-gray-100 p-3 rounded">http://localhost:5000/api</pre>
              <p>All requests require authentication via JWT token (see Authentication).</p>
            </>
          )}
          {activeSection === "authentication" && (
            <>
              <h2>Authentication</h2>
              <p>Most endpoints require a valid JWT token obtained by logging in.</p>
              <h3>Login</h3>
              <pre className="bg-gray-100 p-3 rounded">{`POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "yourpassword"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}`}</pre>
              <p>Include the token in subsequent requests:</p>
              <pre className="bg-gray-100 p-3 rounded">Authorization: Bearer &lt;token&gt;</pre>
              <h3>Get Current User</h3>
              <pre className="bg-gray-100 p-3 rounded">GET /auth/me</pre>
            </>
          )}
          {activeSection === "agents" && (
            <>
              <h2>Agents API</h2>
              <h3>List your agents</h3>
              <pre className="bg-gray-100 p-3 rounded">GET /agents</pre>
              <h3>Create an agent</h3>
              <pre className="bg-gray-100 p-3 rounded">{`POST /agents
{
  "name": "My Agent",
  "description": "Does cool things",
  "capabilities": "ollama:tinyllama",
  "systemPrompt": "You are a helpful assistant",
  "modelProvider": "ollama-local",
  "modelName": "llama2",
  "status": "active",
  "agentType": "CUSTOM"
}`}</pre>
              <h3>Get single agent</h3>
              <pre className="bg-gray-100 p-3 rounded">GET /agents/:id</pre>
              <h3>Update agent</h3>
              <pre className="bg-gray-100 p-3 rounded">PUT /agents/:id</pre>
              <h3>Delete agent</h3>
              <pre className="bg-gray-100 p-3 rounded">DELETE /agents/:id</pre>
            </>
          )}
          {activeSection === "staking" && (
            <>
              <h2>Staking</h2>
              <h3>Get user stakes</h3>
              <pre className="bg-gray-100 p-3 rounded">GET /staking</pre>
              <h3>Create a stake</h3>
              <pre className="bg-gray-100 p-3 rounded">{`POST /staking
{
  "agentId": "agent-id",
  "amount": 100,
  "sharePercentage": 5
}`}</pre>
              <h3>Claim rewards</h3>
              <pre className="bg-gray-100 p-3 rounded">POST /staking/:id/claim</pre>
            </>
          )}
          {activeSection === "governance" && (
            <>
              <h2>Governance</h2>
              <h3>List proposals</h3>
              <pre className="bg-gray-100 p-3 rounded">GET /governance/proposals</pre>
              <h3>Create proposal</h3>
              <pre className="bg-gray-100 p-3 rounded">{`POST /governance/proposals
{
  "title": "Increase stake reward",
  "description": "Should we increase rewards?",
  "options": ["Yes", "No"],
  "endDate": "2026-12-31T23:59:59Z"
}`}</pre>
              <h3>Vote on proposal</h3>
              <pre className="bg-gray-100 p-3 rounded">{`POST /governance/proposals/:id/vote { "option": "Yes" }`}</pre>
            </>
          )}
          {activeSection === "webhooks" && (
            <>
              <h2>Webhooks</h2>
              <p>Webhooks allow you to receive real-time notifications when events occur (e.g., agent created, task completed).</p>
              <h3>List webhooks</h3>
              <pre className="bg-gray-100 p-3 rounded">GET /webhooks</pre>
              <h3>Create a webhook</h3>
              <pre className="bg-gray-100 p-3 rounded">{`POST /webhooks
{
  "name": "My Webhook",
  "url": "https://your-server.com/webhook",
  "events": ["agent.created", "task.completed"],
  "secret": "optional-secret"
}`}</pre>
              <h3>Delete webhook</h3>
              <pre className="bg-gray-100 p-3 rounded">DELETE /webhooks/:id</pre>
              <h3>Payload format</h3>
              <pre className="bg-gray-100 p-3 rounded">{`{
  "event": "agent.created",
  "timestamp": "2026-03-19T12:34:56.789Z",
  "data": { ... }
}`}</pre>
            </>
          )}
          {activeSection === "nodes" && (
            <>
              <h2>Compute Nodes</h2>
              <h3>Register a node</h3>
              <pre className="bg-gray-100 p-3 rounded">{`POST /nodes/register
{
  "name": "My Node",
  "endpoint": "http://localhost:8080",
  "specs": { "cpu": 4, "ram": 8 },
  "location": "us-east",
  "version": "1.0.0"
}`}</pre>
              <h3>List nodes</h3>
              <pre className="bg-gray-100 p-3 rounded">GET /nodes</pre>
              <h3>Get node tasks</h3>
              <pre className="bg-gray-100 p-3 rounded">GET /nodes/:id/tasks</pre>
              <h3>Claim a task</h3>
              <pre className="bg-gray-100 p-3 rounded">POST /nodes/:id/tasks/:taskId/claim</pre>
              <h3>Complete a task</h3>
              <pre className="bg-gray-100 p-3 rounded">{`POST /tasks/:taskId/complete { "output": "result", "reward": 10 }`}</pre>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
