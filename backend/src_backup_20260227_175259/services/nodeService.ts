import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// // export async function registerNode(userId: string, name: string, endpoint?: string) {
  return (prisma as any).nodes.create({ data: { 
      owner_id: userId,
      name,
      endpoint: endpoint || null,
      status: 'offline',
    },
  });
}

// // export async function heartbeat(nodeId: string, version?: string) {
  return (prisma as any).nodes.update({
    where: { id: nodeId },
    data: {
      last_ping: new Date(),
      status: 'online',
      version: version || null,
    },
  });
}

// // export async function getNodes(owner_id?: string) {
  const where = owner_id ? { owner_id } : {};
  return (prisma as any).nodes.findMany({
    where,
    include: { tasks: true },
    orderBy: { created_at: 'desc' },
  });
}

// // export async function assignTask(nodeId: string, taskData: any) {
  return (prisma as any).node_tasks.create({ data: { 
      nodeId,
      type: taskData.type,
      payload: taskData.payload || {},
      status: 'pending',
    },
  });
}

// // export async function completeTask(taskId: string, result: any, reward: number) {
  const task = await (prisma as any).node_tasks.update({
    where: { id: taskId },
    data: {
      status: 'completed',
      result,
      completed_at: new Date(),
      reward,
    },
  });

// @ts-ignore
  await (prisma as any).nodes.update({
    where: { id: task.nodeId },
    data: { total_earned: { increment: reward } },
  });

// @ts-ignore
  await (prisma as any).node_rewards.create({ data: { 
      nodeId: task.nodeId,
      amount: reward,
      reason: 'task_completion',
      period_start: new Date(),
      period_end: new Date(),
      paid: true,
    },
  });

  return task;
}

// // export async function checkNodeHealth() {
  const threshold = new Date(Date.now() - 10 * 60 * 1000);
// @ts-ignore
  await (prisma as any).nodes.updateMany({
    where: {
      last_ping: { lt: threshold },
      status: 'online',
    },
    data: { status: 'offline' },
  });
}

// Run health check every 5 minutes
setInterval(checkNodeHealth, 5 * 60 * 1000);




















