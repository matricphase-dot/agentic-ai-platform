import * as https from 'https';

const BASE_URL = 'agenticai-backend-xao9.onrender.com';

interface Result {
  endpoint: string;
  totalRequests: number;
  successCount: number;
  failCount: number;
  avgMs: number;
  minMs: number;
  maxMs: number;
  p95Ms: number;
  requestsPerSecond: number;
}

async function makeRequest(path: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const req = https.get({
      hostname: BASE_URL,
      path,
      timeout: 10000,
    }, (res) => {
      res.resume();
      res.on('end', () => resolve(Date.now() - start));
    });
    req.on('error', reject);
    req.on('timeout', () => reject(new Error('timeout')));
  });
}

async function loadTest(
  path: string,
  concurrency: number,
  totalRequests: number
): Promise<Result> {
  const times: number[] = [];
  let successCount = 0;
  let failCount = 0;
  const startTime = Date.now();

  // Run in batches of concurrency
  for (let i = 0; i < totalRequests; i += concurrency) {
    const batch = Math.min(concurrency, totalRequests - i);
    const promises = Array(batch).fill(null).map(() =>
      makeRequest(path)
        .then(ms => { times.push(ms); successCount++; })
        .catch(() => failCount++)
    );
    await Promise.all(promises);
  }

  const totalTime = Date.now() - startTime;
  times.sort((a, b) => a - b);

  return {
    endpoint: path,
    totalRequests,
    successCount,
    failCount,
    avgMs: times.reduce((a, b) => a + b, 0) / times.length || 0,
    minMs: times[0] || 0,
    maxMs: times[times.length - 1] || 0,
    p95Ms: times[Math.floor(times.length * 0.95)] || 0,
    requestsPerSecond: Math.round((successCount / totalTime) * 1000),
  };
}

async function runAllTests() {
  console.log('🚀 Starting load test for AgenticAI Platform...\n');

  const tests = [
    { path: '/health', concurrency: 100, total: 500 },
    { path: '/api/stats', concurrency: 50, total: 200 },
    { path: '/api/marketplace', concurrency: 50, total: 200 },
    { path: '/api/governance/proposals', concurrency: 30, total: 100 },
  ];

  const results: Result[] = [];

  for (const test of tests) {
    console.log(`Testing ${test.path} with ${test.concurrency} concurrent users...`);
    const result = await loadTest(test.path, test.concurrency, test.total);
    results.push(result);
    console.log(`✅ ${test.path}: ${result.avgMs.toFixed(0)}ms avg, ${result.requestsPerSecond} req/s, ${result.failCount} failures\n`);
  }

  console.log('\n📊 FULL LOAD TEST REPORT');
  console.log('='.repeat(80));
  console.log('Endpoint'.padEnd(30) + 'Avg'.padEnd(10) + 'P95'.padEnd(10) + 'Max'.padEnd(10) + 'Req/s'.padEnd(10) + 'Failures');
  console.log('-'.repeat(80));

  for (const r of results) {
    console.log(
      r.endpoint.padEnd(30) +
      `${r.avgMs.toFixed(0)}ms`.padEnd(10) +
      `${r.p95Ms.toFixed(0)}ms`.padEnd(10) +
      `${r.maxMs.toFixed(0)}ms`.padEnd(10) +
      `${r.requestsPerSecond}`.padEnd(10) +
      `${r.failCount}/${r.totalRequests}`
    );
  }

  console.log('='.repeat(80));

  const allPassed = results.every(r =>
    r.avgMs < 3000 &&
    r.failCount / r.totalRequests < 0.05
  );

  console.log(`\n🎯 Overall result: ${allPassed ? '✅ READY FOR MILLIONS' : '❌ NEEDS OPTIMIZATION'}`);
  console.log(`Success rate: ${results.map(r => ((r.successCount/r.totalRequests)*100).toFixed(1)+'%').join(', ')}`);
}

runAllTests().catch(console.error);
