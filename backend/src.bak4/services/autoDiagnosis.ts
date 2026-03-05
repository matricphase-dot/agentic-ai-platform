import { PrismaClient } from '@prisma/client';
import os from 'os';
import axios from 'axios';

const prisma = new PrismaClient();

const CPU_THRESHOLD = 80;
const MEMORY_THRESHOLD = 85;
const REQUEST_RATE_THRESHOLD = 1000;

export async function runDiagnostics() {
  const cpuUsage = (os.loadavg()[0] || 0) * 100 / os.cpus().length;
  const memoryUsage = (1 - os.freemem() / os.totalmem()) * 100;
  const requestRate = await getCurrentRequestRate();

  if (cpuUsage > CPU_THRESHOLD) {
    await handleBottleneck('cpu', cpuUsage, CPU_THRESHOLD);
  }
  if (memoryUsage > MEMORY_THRESHOLD) {
    await handleBottleneck('memory', memoryUsage, MEMORY_THRESHOLD);
  }
  if (requestRate > REQUEST_RATE_THRESHOLD) {
    await handleBottleneck('request_rate', requestRate, REQUEST_RATE_THRESHOLD);
  }
}

async function handleBottleneck(metric: string, value: number, threshold: number) {
// @ts-ignore
  await (prisma as any).system_diagnostics.create({ data: { 
      metric,
      value,
      threshold,
      actionTaken: 'scaling_requested'
    }
  });
  await scaleUp();
}

async function scaleUp() {
  console.log('[AUTO-SCALING] Scaling up backend instances...');
  // Here you would call your cloud provider's API (AWS, GCP, etc.)
}

async function getCurrentRequestRate(): Promise<number> {
  // Placeholder: replace with actual metrics (e.g., from database or Prometheus)
  return 500;
}

// Start the diagnostic loop (every 5 minutes)
setInterval(runDiagnostics, 5 * 60 * 1000);













