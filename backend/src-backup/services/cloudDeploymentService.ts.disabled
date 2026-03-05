import { PrismaClient } from '@prisma/client';
import { getCloudProvider, CloudProvider } from './cloudProviders';

const prisma = new PrismaClient();

// Package agent code (simulate – in reality, you'd bundle the agent's logic)
function packageAgent(agent: any): any {
  // For now, just return the agent's configuration and a stub
  return {
    agent_id: agent.id,
    config: agent.configuration,
    code: 'function handler(event, context) { return { statusCode: 200, body: "Hello from agent" }; }',
  };
}

export async function deployAgentToCloud(
  deployment_id: string,
  platform: string,
  credentials: any // unused in mock
) {
  const deployment = await prisma.deployments.findUnique({
    where: { id: deployment_id },
    include: { agent: true, platform: true },
  });
  if (!deployment) throw new Error('Deployment not found');
  if (!deployment.agent) throw new Error('Agent not found');

  const provider = getCloudProvider(platform);
  if (!provider) throw new Error(`Unsupported platform: ${platform}`);

  const codePackage = packageAgent(deployment.agent);
  const config = {
    region: deployment.config?.region || 'us-east-1',
    runtime: 'nodejs18.x',
    handler: 'index.handler',
    memorySize: deployment.config?.memorySize || 128,
    timeout: deployment.config?.timeout || 30,
  };

  const result = await provider.deploy(deployment.agent.id, codePackage, config);

  // Update deployment record
  await prisma.deployments.update({
    where: { id: deployment_id },
    data: {
      external_id: result.external_id,
      config: { ...deployment.config, ...config, endpoint: result.endpoint },
      cloudProvider: platform,
      status: 'running',
    },
  });

  // Log deployment
  await prisma.deployment_logs.create({ data: { 
      deployment_id,
      level: 'info',
      message: `Deployed to ${platform} successfully. External ID: ${result.external_id}`,
    },
  });

  return result;
}

export async function invokeCloudAgent(deployment_id: string, payload: any) {
  const deployment = await prisma.deployments.findUnique({
    where: { id: deployment_id },
  });
  if (!deployment) throw new Error('Deployment not found');
  if (!deployment.external_id) throw new Error('Agent not deployed');

  const provider = getCloudProvider(deployment.cloudProvider || '');
  if (!provider) throw new Error('Provider not available');

  const result = await provider.invoke(deployment.external_id, payload);

  // Update invocation stats
  await prisma.deployments.update({
    where: { id: deployment_id },
    data: {
      invocations: { increment: 1 },
      lastInvoked: new Date(),
    },
  });

  // Log invocation
  await prisma.deployment_logs.create({ data: { 
      deployment_id,
      level: 'info',
      message: `Invoked with payload: ${JSON.stringify(payload)}`,
      metadata: { result },
    },
  });

  return result;
}

export async function getCloudDeploymentLogs(deployment_id: string) {
  const deployment = await prisma.deployments.findUnique({
    where: { id: deployment_id },
  });
  if (!deployment) throw new Error('Deployment not found');
  if (!deployment.external_id) throw new Error('Agent not deployed');

  const provider = getCloudProvider(deployment.cloudProvider || '');
  if (!provider) return { logs: [] };

  const cloudLogs = await provider.getLogs(deployment.external_id);
  const dbLogs = await prisma.deployment_logs.findMany({
    where: { deployment_id },
    orderBy: { timestamp: 'asc' },
  });

  return {
    cloud: cloudLogs.logs,
    database: dbLogs,
  };
}

export async function removeCloudDeployment(deployment_id: string) {
  const deployment = await prisma.deployments.findUnique({
    where: { id: deployment_id },
  });
  if (!deployment) throw new Error('Deployment not found');
  if (!deployment.external_id) throw new Error('Agent not deployed');

  const provider = getCloudProvider(deployment.cloudProvider || '');
  if (!provider) throw new Error('Provider not available');

  const success = await provider.remove(deployment.external_id);
  if (success) {
    await prisma.deployments.update({
      where: { id: deployment_id },
      data: { status: 'stopped', external_id: null },
    });
    await prisma.deployment_logs.create({ data: { 
        deployment_id,
        level: 'info',
        message: 'Removed from cloud',
      },
    });
  }
  return success;
}










