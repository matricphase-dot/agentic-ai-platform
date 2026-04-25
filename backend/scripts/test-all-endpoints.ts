import axios, { AxiosInstance, AxiosError } from 'axios';

const BACKEND_URL = 'https://agenticai-backend-xao9.onrender.com';
const api: AxiosInstance = axios.create({
  baseURL: BACKEND_URL,
  validateStatus: () => true, // Don't throw on error codes
});

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIPPED';
  received: any;
  expected?: any;
  notes?: string;
}

const results: TestResult[] = [];

async function runTest(name: string, fn: () => Promise<any>, expectedStatus: number | number[]) {
  try {
    const response = await fn();
    const statusMatch = Array.isArray(expectedStatus) 
      ? expectedStatus.includes(response.status) 
      : response.status === expectedStatus;
    
    const result: TestResult = {
      name,
      status: statusMatch ? 'PASS' : 'FAIL',
      received: { status: response.status, data: response.data },
    };
    results.push(result);
    console.log(`[${result.status}] ${name} (${response.status})`);
    return response;
  } catch (error: any) {
    const result: TestResult = {
      name,
      status: 'FAIL',
      received: error.message,
    };
    results.push(result);
    console.log(`[FAIL] ${name} - Error: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('🧪 Starting Agentic AI Platform QA Test Suite...\n');

  let aliceToken = '';
  let bobToken = '';
  let agentId = '';
  let apiKey = '';
  let firstAgentId = '';
  let firstProposalId = '';

  // --- AUTH TESTS ---
  console.log('\n--- 1. AUTH TESTS ---');
  await runTest('POST /api/auth/signup', () => api.post('/api/auth/signup', {
    email: `test_qa_${Date.now()}@agenticai.dev`,
    password: 'QATest@1234',
    name: 'QA Tester'
  }), 201);

  await runTest('POST /api/auth/login with unverified email', () => api.post('/api/auth/login', {
    email: 'test_qa@agenticai.dev', // Assuming this one exists but unverified
    password: 'QATest@1234'
  }), 401);

  const loginRes = await runTest('POST /api/auth/login (Alice)', () => api.post('/api/auth/login', {
    email: 'alice@agenticai.dev',
    password: 'Demo@1234'
  }), 200);
  if (loginRes?.data?.success) aliceToken = loginRes.data.data.token;

  const loginBobRes = await runTest('POST /api/auth/login (Bob)', () => api.post('/api/auth/login', {
    email: 'bob@agenticai.dev',
    password: 'Demo@1234'
  }), 200);
  if (loginBobRes?.data?.success) bobToken = loginBobRes.data.data.token;

  await runTest('GET /api/auth/me', () => api.get('/api/auth/me', {
    headers: { Authorization: `Bearer ${aliceToken}` }
  }), 200);

  await runTest('POST /api/auth/login wrong password', () => api.post('/api/auth/login', {
    email: 'alice@agenticai.dev',
    password: 'wrongpassword'
  }), 401);

  await runTest('GET /api/auth/me no token', () => api.get('/api/auth/me'), 401);

  await runTest('POST /api/auth/forgot-password', () => api.post('/api/auth/forgot-password', {
    email: 'alice@agenticai.dev'
  }), 200);

  // --- RATE LIMITING ---
  console.log('\n--- 2. RATE LIMITING TESTS ---');
  console.log('Sending 6 rapid login attempts...');
  let lastRateLimitStatus = 0;
  for (let i = 0; i < 6; i++) {
    const res = await api.post('/api/auth/login', { email: 'alice@agenticai.dev', password: 'wrongpassword' });
    lastRateLimitStatus = res.status;
    process.stdout.write(`${res.status} `);
  }
  console.log();
  results.push({
    name: 'Rate Limiting Check',
    status: lastRateLimitStatus === 429 ? 'PASS' : 'FAIL',
    received: lastRateLimitStatus,
    notes: lastRateLimitStatus === 429 ? 'Rate limiting triggered' : 'Rate limiting NOT triggered'
  });

  // --- MARKETPLACE ---
  console.log('\n--- 3. MARKETPLACE TESTS ---');
  const marketRes = await runTest('GET /api/marketplace', () => api.get('/api/marketplace'), 200);
  if (marketRes?.data?.success && Array.isArray(marketRes.data.data)) {
    firstAgentId = marketRes.data.data[0]?.id;
    console.log(`Agents returned: ${marketRes.data.data.length}`);
  }

  await runTest('GET /api/marketplace search DataMind', () => api.get('/api/marketplace?search=DataMind'), 200);
  await runTest('GET /api/marketplace category DATA_ANALYST', () => api.get('/api/marketplace?category=DATA_ANALYST'), 200);
  await runTest('GET /api/marketplace sort rating', () => api.get('/api/marketplace?sort=rating'), 200);
  if (firstAgentId) {
    await runTest('GET /api/marketplace/{agentId}', () => api.get(`/api/marketplace/${firstAgentId}`), 200);
  }

  // --- AGENT TESTS ---
  console.log('\n--- 4. AGENT TESTS (Alice) ---');
  await runTest('GET /api/agents', () => api.get('/api/agents', {
    headers: { Authorization: `Bearer ${aliceToken}` }
  }), 200);

  const createAgentRes = await runTest('POST /api/agents', () => api.post('/api/agents', {
    name: "QA Test Agent",
    slug: `qa-test-agent-${Date.now()}`,
    description: "Test agent for QA",
    category: "CHATBOT",
    modelProvider: "google",
    modelName: "gemini-1.5-flash",
    systemPrompt: "You are a helpful assistant.",
    pricingModel: "FREE",
    isPublic: false
  }, { headers: { Authorization: `Bearer ${aliceToken}` } }), 201);
  if (createAgentRes?.data?.success) agentId = createAgentRes.data.data.id;

  if (agentId) {
    await runTest('GET /api/agents/{agentId}', () => api.get(`/api/agents/${agentId}`, {
      headers: { Authorization: `Bearer ${aliceToken}` }
    }), 200);

    await runTest('PUT /api/agents/{agentId}', () => api.put(`/api/agents/${agentId}`, {
      description: "Updated description for QA"
    }, { headers: { Authorization: `Bearer ${aliceToken}` } }), 200);

    await runTest('POST /api/agents/{agentId}/publish', () => api.post(`/api/agents/${agentId}/publish`, {}, {
      headers: { Authorization: `Bearer ${aliceToken}` }
    }), 200);

    await runTest('POST /api/agents/{agentId}/chat', () => api.post(`/api/agents/${agentId}/chat`, {
      message: "Hello, say hi back in one sentence"
    }, { headers: { Authorization: `Bearer ${aliceToken}` } }), 200);
  }

  // --- INVOCATION TESTS ---
  console.log('\n--- 5. INVOCATION TESTS ---');
  const keyRes = await runTest('POST /api/keys', () => api.post('/api/keys', {
    name: "QA Test Key"
  }, { headers: { Authorization: `Bearer ${aliceToken}` } }), 200);
  if (keyRes?.data?.success) apiKey = keyRes.data.data.key;

  if (apiKey && firstAgentId) {
    await runTest('POST /api/invoke/{agentId}', () => api.post(`/api/invoke/${firstAgentId}`, {
      message: "What is 2+2?"
    }, { headers: { 'X-API-Key': apiKey } }), 200);
  }

  // --- STAKING TESTS ---
  console.log('\n--- 6. STAKING TESTS ---');
  await runTest('GET /api/staking/positions', () => api.get('/api/staking/positions', {
    headers: { Authorization: `Bearer ${bobToken}` }
  }), 200);

  if (firstAgentId) {
    await runTest('POST /api/staking/stake (Bob)', () => api.post('/api/staking/stake', {
      agentId: firstAgentId,
      amount: 10
    }, { headers: { Authorization: `Bearer ${bobToken}` } }), [200, 400]); // 400 if already staked or insufficient
  }

  await runTest('GET /api/staking/rewards', () => api.get('/api/staking/rewards', {
    headers: { Authorization: `Bearer ${bobToken}` }
  }), 200);

  // --- GOVERNANCE TESTS ---
  console.log('\n--- 7. GOVERNANCE TESTS ---');
  const govRes = await runTest('GET /api/governance/proposals', () => api.get('/api/governance/proposals'), 200);
  if (govRes?.data?.success && Array.isArray(govRes.data.data)) {
    firstProposalId = govRes.data.data[0]?.id;
  }

  if (firstProposalId) {
    await runTest('GET /api/governance/proposals/{proposalId}', () => api.get(`/api/governance/proposals/${firstProposalId}`), 200);
    await runTest('POST /api/governance/proposals/{proposalId}/vote (Bob)', () => api.post(`/api/governance/proposals/${firstProposalId}/vote`, {
      choice: "FOR"
    }, { headers: { Authorization: `Bearer ${bobToken}` } }), [200, 409]);
  }

  // --- BILLING TESTS ---
  console.log('\n--- 8. BILLING TESTS ---');
  await runTest('GET /api/billing/balance', () => api.get('/api/billing/balance', {
    headers: { Authorization: `Bearer ${aliceToken}` }
  }), 200);

  await runTest('GET /api/billing/transactions', () => api.get('/api/billing/transactions', {
    headers: { Authorization: `Bearer ${aliceToken}` }
  }), 200);

  // --- NODE TESTS ---
  console.log('\n--- 9. NODE TESTS ---');
  await runTest('GET /api/nodes', () => api.get('/api/nodes'), 200);

  // --- MONITORING TESTS ---
  console.log('\n--- 10. MONITORING TESTS ---');
  await runTest('GET /api/monitoring/logs', () => api.get('/api/monitoring/logs', {
    headers: { Authorization: `Bearer ${aliceToken}` }
  }), 200);

  if (firstAgentId) {
    await runTest('GET /api/monitoring/metrics/{agentId}', () => api.get(`/api/monitoring/metrics/${firstAgentId}`, {
      headers: { Authorization: `Bearer ${aliceToken}` }
    }), 200);
  }

  // --- STATS & HEALTH ---
  console.log('\n--- 11. STATS & HEALTH ---');
  await runTest('GET /api/stats', () => api.get('/api/stats'), 200);
  await runTest('GET /health', () => api.get('/health'), 200);

  // --- SECURITY TESTS ---
  console.log('\n--- 12. SECURITY TESTS ---');
  await runTest('SQL Injection attempt', () => api.get("/api/marketplace?search=' OR '1'='1"), [200, 400]);
  
  await runTest('XSS attempt', () => api.post('/api/agents', {
    name: "<script>alert('xss')</script>",
    slug: `xss-test-${Date.now()}`,
    description: "XSS Test",
    category: "CHATBOT",
    modelProvider: "google",
    modelName: "gemini-1.5-flash",
    systemPrompt: "Test",
    pricingModel: "FREE",
    isPublic: false
  }, { headers: { Authorization: `Bearer ${aliceToken}` } }), 201);

  if (agentId) {
    await runTest("Access other user's agent (Bob -> Alice's Agent)", () => api.put(`/api/agents/${agentId}`, {
      description: "Hacked"
    }, { headers: { Authorization: `Bearer ${bobToken}` } }), 403);
  }

  await runTest('Access without token', () => api.get('/api/agents'), 401);
  await runTest('Invalid JWT', () => api.get('/api/agents', {
    headers: { Authorization: 'Bearer invalidtoken123' }
  }), 401);

  // --- FINAL REPORT ---
  console.log('\n' + '='.repeat(50));
  console.log('📊 FINAL TEST REPORT');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  
  console.log(`TOTAL TESTS: ${results.length}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log('='.repeat(50));

  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`- ${r.name}: ${JSON.stringify(r.received)}`);
    });
  } else {
    console.log('\n✅ ALL TESTS PASSED!');
  }
}

main();
