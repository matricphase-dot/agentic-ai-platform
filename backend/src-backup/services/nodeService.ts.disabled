import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// // export async function registerNode(user_id: string, name: string, endpoint?: string) {
  return prisma.nodes.create({ data: { 
      owner_id: user_id,
      name,
      endpoint: endpoint || null,
      status: 'offline',
    },
  });
}

// // export async function heartbeat(node_id: string, version?: string) {
  return prisma.nodes.update({
    where: { id: node_id },
    data: {
      last_ping: new Date(),
      status: 'online',
      version: version || null,
    },
  });
}

// // export async function getNodes(owner_id?: string) {
  const where = owner_id ? { owner_id } : {};
  return prisma.nodes.findMany({
    where,
    include: { tasks: true },
    orderBy: { created_at: 'desc' },
  });
}

// // export async function assignTask(node_id: string, taskData: any) {
  return prisma.node_tasks.create({ data: { 
      node_id,
      type: taskData.type,
      payload: taskData.payload || {},
      status: 'pending',
    },
  });
}

// // export async function completeTask(taskId: string, result: any, reward: number) {
  const task = await prisma.node_tasks.update({
    where: { id: taskId },
    data: {
      status: 'completed',
      result,
      completed_at: new Date(),
      reward,
    },
  });

  await prisma.nodes.update({
    where: { id: task.node_id },
    data: { total_earned: { increment: reward } },
  });

  await prisma.node_rewards.create({ data: { 
      node_id: task.node_id,
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
  await prisma.nodes.updateMany({
    where: {
      last_ping: { lt: threshold },
      status: 'online',
    },
    data: { status: 'offline' },
  });
}

// Run health check every 5 minutes
setInterval(checkNodeHealth, 5 * 60 * 1000);

















