import axios from 'axios';

const BACKEND_URL = 'https://agenticai-backend-xao9.onrender.com';
const CONCURRENT_USERS = 50;

async function runLoadTest() {
  console.log(`🚀 Starting load test with ${CONCURRENT_USERS} concurrent users...`);

  const tests = [
    { name: 'GET /api/marketplace', url: '/api/marketplace', count: 20 },
    { name: 'GET /api/stats', url: '/api/stats', count: 10 },
    { name: 'GET /api/governance/proposals', url: '/api/governance/proposals', count: 10 },
    { name: 'POST /api/auth/login', url: '/api/auth/login', count: 10, method: 'POST', body: { email: 'alice@agenticai.dev', password: 'wrongpassword' } },
  ];

  const allRequests: Promise<any>[] = [];
  const results: Record<string, { times: number[], success: number, fail: number }> = {};

  tests.forEach(test => {
    results[test.name] = { times: [], success: 0, fail: 0 };
    for (let i = 0; i < test.count; i++) {
      allRequests.push((async () => {
        const start = Date.now();
        try {
          const res = await axios({
            url: `${BACKEND_URL}${test.url}`,
            method: test.method || 'GET',
            data: test.body,
            validateStatus: () => true
          });
          const duration = Date.now() - start;
          results[test.name].times.push(duration);
          if (res.status < 400 || res.status === 401 || res.status === 429) { 
            results[test.name].success++;
          } else {
            results[test.name].fail++;
          }
        } catch (error) {
          results[test.name].fail++;
        }
      })());
    }
  });

  await Promise.all(allRequests);

  console.log('\n📊 LOAD TEST RESULTS');
  console.log('='.repeat(50));
  
  for (const [name, data] of Object.entries(results)) {
    const avg = data.times.reduce((a, b) => a + b, 0) / data.times.length || 0;
    const min = Math.min(...data.times);
    const max = Math.max(...data.times);
    const successRate = (data.success / (data.success + data.fail)) * 100;

    console.log(`${name}:`);
    console.log(`  Avg: ${avg.toFixed(2)}ms`);
    console.log(`  Min: ${min}ms`);
    console.log(`  Max: ${max}ms`);
    console.log(`  Success Rate: ${successRate.toFixed(2)}%`);
    console.log('-'.repeat(25));
  }
}

runLoadTest();
