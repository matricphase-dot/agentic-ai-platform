import prisma from '../lib/prisma';

// Mock sign function – in production, use actual quantum-resistant signing
const sign = async (message: string, private_key: string) => {
  return 'sig_' + Buffer.from(message).toString('base64').substring(0, 10);
};

// Mock verify function
const verify = async (message: string, signature: string, public_key: string) => {
  return true; // mock
};

export const sendMessage = async (fromAgentId: string, toAgentId: string, content: string) => {
  // For mock purposes, we don't need a real signature
  const signature = 'mock_signature_' + Math.random().toString(36).substring(2);

  return prisma.agent_messages.create({
    data: {
      from_agent_id: fromAgentId,
      to_agent_id: toAgentId,
      content,
      signature,
      status: 'sent'
    }
  });
};

export const receiveMessages = async (agent_id: string) => {
  return prisma.agent_messages.findMany({
    where: { 
      to_agent_id: agent_id, 
      status: 'sent' 
    },
    orderBy: { created_at: 'asc' }
  });
};

export const tallyRound = async (round_id: string) => {
  const round = await prisma.consensus_rounds.findUnique({
    where: { id: round_id },
    include: { votes: true }
  });
  if (!round) throw new Error('Round not found');
  
  const forVotes = round.votes.filter(v => v.vote).reduce((sum, v) => sum + v.weight, 0);
  const againstVotes = round.votes.filter(v => !v.vote).reduce((sum, v) => sum + v.weight, 0);
  
  return {
    round_id: round.id,
    for: forVotes,
    against: againstVotes,
    passed: forVotes > againstVotes
  };
};



