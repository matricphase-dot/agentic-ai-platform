const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.users.findFirst({
    where: { role: 'ADMIN' }
  }) || await prisma.users.findFirst({
    where: { email: 'admin@example.com' }
  });

  if (!admin) {
    console.error('❌ No admin user found.');
    return;
  }

  const templates = [
    {
      title: 'Healthcare Assistant',
      description: 'Helps with medical queries, appointment scheduling, and symptom analysis.',
      category: 'healthcare',
      price: 99.99,
      unit: 'month',
      agentConfig: {
        name: 'Healthcare Assistant',
        agentType: 'SUPPORT',
        capabilities: 'ollama:tinyllama, medical knowledge',
        systemPrompt: 'You are a healthcare assistant. Provide general medical information and help with appointments.',
        modelProvider: 'ollama-local',
        modelName: 'llama2',
      },
    },
    {
      title: 'Financial Advisor',
      description: 'Analyzes investments, tracks portfolios, and provides market insights.',
      category: 'finance',
      price: 149.99,
      unit: 'month',
      agentConfig: {
        name: 'Financial Advisor',
        agentType: 'ANALYTICS',
        capabilities: 'ollama:tinyllama, financial data',
        systemPrompt: 'You are a financial advisor. Help users with investment strategies and market analysis.',
        modelProvider: 'ollama-local',
        modelName: 'llama2',
      },
    },
    {
      title: 'Tutor',
      description: 'Personalized learning assistant for students of all ages.',
      category: 'education',
      price: 79.99,
      unit: 'month',
      agentConfig: {
        name: 'Tutor',
        agentType: 'SUPPORT',
        capabilities: 'ollama:tinyllama, teaching',
        systemPrompt: 'You are a tutor. Help students learn and understand various subjects.',
        modelProvider: 'ollama-local',
        modelName: 'llama2',
      },
    },
  ];

  for (const tmpl of templates) {
    const agent = await prisma.agents.create({
      data: {
        name: tmpl.agentConfig.name,
        description: tmpl.description,
        capabilities: tmpl.agentConfig.capabilities,
        system_prompt: tmpl.agentConfig.systemPrompt,
        model_provider: tmpl.agentConfig.modelProvider,
        model_name: tmpl.agentConfig.modelName,
        status: 'active',
        agentType: tmpl.agentConfig.agentType,
        specialties: [],
        configuration: {},
        owner: { connect: { id: admin.id } },
      },
    });
    await prisma.templates.create({
      data: {
        title: tmpl.title,
        description: tmpl.description,
        category: tmpl.category,
        price: tmpl.price,
        unit: tmpl.unit,
        status: 'active',
        agent: { connect: { id: agent.id } },
      },
    });
    console.log(`✅ Created template: ${tmpl.title}`);
  }
}

main().finally(() => prisma.$disconnect());
