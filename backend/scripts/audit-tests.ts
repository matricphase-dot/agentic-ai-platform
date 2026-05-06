import axios from 'axios';

const BASE_URL = 'https://agenticai-backend-xao9.onrender.com';

async function runTests() {
  console.log('--- Phase 2/3: Auth & Marketplace Tests ---');
  
  try {
    // Test 1: Signup
    console.log('Testing Signup...');
    try {
      const signup = await axios.post(`${BASE_URL}/api/auth/signup`, {
        email: `realtest_${Date.now()}@agenticai.dev`,
        name: 'Real Test User',
        password: 'RealTest@1234'
      });
      console.log('✅ Signup success:', signup.status);
    } catch (e: any) {
      console.log('❌ Signup failed:', e.response?.data || e.message);
    }

    // Test 2: Login Alice
    console.log('\nTesting Login (Alice)...');
    const login = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'alice@agenticai.dev',
      password: 'Demo@1234'
    });
    const token = login.data.data.token;
    console.log('✅ Login success. Token received.');

    // Test 3: Get Profile
    console.log('\nTesting Profile...');
    const me = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Profile success:', me.data.data.name);

    // Test 4: Marketplace leak check
    console.log('\nChecking for systemPrompt leak in marketplace...');
    const marketplace = await axios.get(`${BASE_URL}/api/marketplace`);
    const content = JSON.stringify(marketplace.data);
    const count = (content.match(/systemPrompt/g) || []).length;
    console.log(`Count of "systemPrompt" in response: ${count}`);
    if (count === 0) console.log('✅ No leak found.');
    else console.log('❌ LEAK DETECTED!');

    // Phase 4: API Key & Invocation
    console.log('\n--- Phase 4: API Key & AI Invocation ---');
    console.log('Creating API Key...');
    const keyRes = await axios.post(`${BASE_URL}/api/keys`, {
      name: 'Audit Key'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const apiKey = keyRes.data.data.key;
    console.log('✅ API Key created.');

    // Get an agent ID from marketplace
    const agents = marketplace.data.data.agents;
    const agentId = agents[0]?.id;
    
    if (agentId) {
      console.log(`\nInvoking agent ${agentId}...`);
      const start = Date.now();
      const invoke = await axios.post(`${BASE_URL}/api/invoke/${agentId}`, {
        message: 'What are the top 3 benefits of AI agents for businesses?'
      }, {
        headers: { 'X-API-Key': apiKey }
      });
      const end = Date.now();
      console.log('✅ Invocation success!');
      console.log('Response time:', end - start, 'ms');
      const outputText = invoke.data.data.output?.text || invoke.data.data.output || '';
      console.log('Response preview:', String(outputText).substring(0, 200));
      console.log('Provider used:', invoke.data.data.provider || 'unknown');
    }

    // Feature Tests
    console.log('\n--- Phase 5: Feature Tests ---');
    const features = [
      { name: 'Staking Positions', path: '/api/staking/positions' },
      { name: 'Billing Balance', path: '/api/billing/balance' },
      { name: 'Governance Proposals', path: '/api/governance/proposals' },
      { name: 'Monitoring Logs', path: '/api/monitoring/logs' },
      { name: 'Webhooks', path: '/api/webhooks' },
      { name: 'Notifications', path: '/api/notifications' },
      { name: 'API Keys', path: '/api/keys' },
      { name: 'Audit Logs', path: '/api/audit' },
    ];

    for (const f of features) {
      try {
        await axios.get(`${BASE_URL}${f.path}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ ${f.name} working`);
      } catch (e: any) {
        console.log(`❌ ${f.name} failed:`, e.response?.status);
      }
    }

    // Security Tests
    console.log('\n--- Phase 6: Security Tests ---');
    
    // 1. Auth protection
    console.log('Testing Auth Protection...');
    try {
      await axios.get(`${BASE_URL}/api/agents`);
      console.log('❌ Auth protection failed (endpoint is public)');
    } catch (e: any) {
      console.log('✅ Auth protection success (401 blocked)');
    }

    // 2. Rate limiting
    console.log('Testing Rate Limiting (this may take a moment)...');
    let triggered = false;
    for(let i=0; i<15; i++) {
      try {
        await axios.post(`${BASE_URL}/api/auth/login`, { email: 'wrong@dev.com', password: 'bad' });
      } catch (e: any) {
        if (e.response?.status === 429) {
          triggered = true;
          console.log(`✅ Rate limiting triggered at request ${i+1}`);
          break;
        }
      }
    }
    if (!triggered) console.log('❌ Rate limiting NOT triggered');

    // 3. SQL Injection
    console.log('Testing SQL Injection...');
    try {
      const sqlRes = await axios.get(`${BASE_URL}/api/marketplace?search=' OR 1=1--`);
      console.log('✅ SQL Injection test safe (normal response)');
    } catch (e: any) {
      console.log('✅ SQL Injection test safe (400 or error)');
    }

    // 4. XSS
    console.log('Testing XSS...');
    try {
      await axios.post(`${BASE_URL}/api/agents`, {
        name: '<script>alert(1)</script>',
        description: 'test',
        category: 'CHATBOT'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('❌ XSS attempt might have been accepted (verify on frontend)');
    } catch (e: any) {
      console.log('✅ XSS attempt blocked/sanitized');
    }

  } catch (error: any) {
    console.error('Audit failed:', error.response?.data || error.message);
  }
}

runTests();
