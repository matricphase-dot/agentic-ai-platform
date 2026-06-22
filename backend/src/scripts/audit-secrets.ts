import { PrismaClient, AgentStatus } from '@prisma/client';

const prisma = new PrismaClient();

const RESERVED_PROVIDER_KEYS = [
  'GROQ_API_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY',
  'GEMINI_API_KEY', 'HF_API_KEY', 'HF_TOKEN'
];

async function main() {
  const isFixMode = process.argv.includes('--fix');
  console.log(`Starting secret leak audit... Mode: ${isFixMode ? 'FIX' : 'REPORT'}`);

  const agents = await prisma.agent.findMany({
    where: {
      status: AgentStatus.PUBLISHED
    }
  });

  let affectedCount = 0;

  for (const agent of agents) {
    let leakedKeys: string[] = [];
    
    for (const key of RESERVED_PROVIDER_KEYS) {
      if (agent.systemPrompt && agent.systemPrompt.includes(`{{secret.${key}}}`)) {
        leakedKeys.push(key);
      }
    }

    if (leakedKeys.length > 0) {
      affectedCount++;
      const keysStr = leakedKeys.join(', ');
      
      if (isFixMode) {
        // Unpublish agent
        await prisma.agent.update({
          where: { id: agent.id },
          data: { 
            status: AgentStatus.DRAFT,
            isPublic: false
          }
        });

        // Notify owner
        await prisma.notification.create({
          data: {
            userId: agent.userId,
            title: 'Agent Automatically Unpublished',
            message: `Your agent '${agent.name}' was automatically unpublished because its system prompt referenced a reserved provider key (${keysStr}), which could leak your API key. Please remove the reference and republish.`,
            type: 'SECURITY_ALERT',
            isRead: false
          }
        });

        console.log(`[FIXED] Agent ID: ${agent.id} | Slug: ${agent.slug} | Leaked Keys: ${keysStr} -> Unpublished & Notified`);
      } else {
        console.log(`[REPORT] Agent ID: ${agent.id} | Slug: ${agent.slug} | Leaked Keys: ${keysStr}`);
      }
    }
  }

  console.log(`\nAudit complete. Found ${affectedCount} affected agents.`);
  if (!isFixMode && affectedCount > 0) {
    console.log(`Run with --fix to unpublish these agents and notify owners.`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
