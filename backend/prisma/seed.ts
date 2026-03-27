import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 1. Get or create a placeholder agent for templates
  const adminUser = await prisma.users.findUnique({ where: { email: 'admin@example.com' } });
  if (!adminUser) throw new Error('Admin user not found');

  const templateAgent = await prisma.agents.upsert({
    where: { id: 'template-agent' },
    update: {},
    create: {
      id: 'template-agent',
      name: 'Template Host',
      description: 'Host agent for marketplace templates',
      agentType: 'template',
      status: 'active',
      ownerId: adminUser.id,
    },
  });

  // 2. Templates
  await prisma.templates.upsert({
    where: { id: 'chatbot-template' },
    update: {},
    create: {
      id: 'chatbot-template',
      title: 'Chatbot',
      description: 'A conversational AI assistant that can answer questions, provide recommendations, and hold natural conversations.',
      category: 'conversation',
      price: 10,
      unit: 'credits',
      agentId: templateAgent.id,
      status: 'active',
    },
  });

  await prisma.templates.upsert({
    where: { id: 'data-analyst-template' },
    update: {},
    create: {
      id: 'data-analyst-template',
      title: 'Data Analyst',
      description: 'Analyzes CSV, Excel, and JSON data, generates visualizations, and provides insights.',
      category: 'analytics',
      price: 20,
      unit: 'credits',
      agentId: templateAgent.id,
      status: 'active',
    },
  });

  await prisma.templates.upsert({
    where: { id: 'code-assistant-template' },
    update: {},
    create: {
      id: 'code-assistant-template',
      title: 'Code Assistant',
      description: 'Helps with coding tasks: debugging, code review, writing tests, and explaining code.',
      category: 'development',
      price: 15,
      unit: 'credits',
      agentId: templateAgent.id,
      status: 'active',
    },
  });

  // 3. Sample agent (owned by admin)
  await prisma.agents.upsert({
    where: { id: 'sample-agent' },
    update: {},
    create: {
      id: 'sample-agent',
      name: 'Welcome Bot',
      description: 'A sample agent to get you started. It can answer basic questions about the platform.',
      agentType: 'chat',
      status: 'active',
      ownerId: adminUser.id,
      configuration: { model: 'gpt-3.5-turbo', systemPrompt: 'You are a helpful assistant for the Agentic AI Platform.' },
      model_provider: 'ollama-local',
      model_name: 'llama2',
    },
  });

  console.log('Database seeded with templates and a sample agent.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
