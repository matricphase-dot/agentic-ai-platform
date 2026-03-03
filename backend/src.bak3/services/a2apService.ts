import { PrismaClient } from '@prisma/client';
import { sign, verify } from './quantumCrypto';

const prisma = new PrismaClient();

export async function sendMessage(
  fromAgentId: string,
  toAgentId: string,
  content: any
) {
  const fromAgent = await prisma.agents.findUnique({ where: { id: fromAgentId } });
  if (!fromAgent) throw new Error('Sender agent not found');
  const toAgent = await prisma.agents.findUnique({ where: { id: toAgentId } });
  if (!toAgent) throw new Error('Recipient agent not found');

  // Get sender's quantum key
  const key = await prisma.quantum_keys.findUnique({ where: { agent_id: fromAgentId } });
  if (!key) throw new Error('Sender has no quantum key');

  const messageStr = JSON.stringify(content);
  const signature = await sign(messageStr, key.private_key);

  const message = await prisma.agent_messages.create({ data: { 
      fromAgentId,
      toAgentId,
      content,
      signature,
      status: 'pending',
    },
  });

  // In a real system, you'd deliver via WebSocket or queue
  return message;
}

export async function receiveMessages(agent_id: string) {
  const messages = await prisma.agent_messages.findMany({
    where: { toAgentId: agent_id, status: 'pending' },
    orderBy: { created_at: 'asc' },
  });

  // Verify signatures
  for (const msg of messages) {
    const key = await prisma.quantum_keys.findUnique({ where: { agent_id: msg.fromAgentId } });
    if (!key) {
      await prisma.agent_messages.update({
        where: { id: msg.id },
        data: { status: 'failed' },
      });
      continue;
    }
    const messageStr = JSON.stringify(msg.content);
    const valid = await verify(messageStr, msg.signature, key.public_key);
    if (valid) {
      await prisma.agent_messages.update({
        where: { id: msg.id },
        data: { status: 'delivered', delivered_at: new Date() },
      });
    } else {
      await prisma.agent_messages.update({
        where: { id: msg.id },
        data: { status: 'failed' },
      });
    }
  }

  return prisma.agent_messages.findMany({
    where: { toAgentId: agent_id, status: 'delivered' },
    orderBy: { delivered_at: 'desc' },
  });
}








