const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const templates = await prisma.templates.findMany({
    include: { agent: true }
  });
  console.log('Current templates:');
  templates.forEach(t => {
    console.log(`- ${t.title} (${t.category || 'NO CATEGORY'})`);
  });

  // Fix missing categories
  let updated = 0;
  for (const t of templates) {
    if (!t.category) {
      let newCategory = 'general';
      // Guess category from title or agent type
      if (t.title.toLowerCase().includes('health')) newCategory = 'healthcare';
      else if (t.title.toLowerCase().includes('finance') || t.title.toLowerCase().includes('advisor')) newCategory = 'finance';
      else if (t.title.toLowerCase().includes('tutor') || t.title.toLowerCase().includes('education')) newCategory = 'education';
      else if (t.agent?.agentType === 'SUPPORT') newCategory = 'support';
      else if (t.agent?.agentType === 'ANALYTICS') newCategory = 'analytics';
      else if (t.agent?.agentType === 'CODING') newCategory = 'development';
      else newCategory = 'general';

      await prisma.templates.update({
        where: { id: t.id },
        data: { category: newCategory }
      });
      console.log(`   Fixed: ${t.title} -> category: ${newCategory}`);
      updated++;
    }
  }
  console.log(`\n✅ Updated ${updated} templates with missing categories.`);

  // Add some default templates if none exist
  if (templates.length === 0) {
    console.log('No templates found. Seeding default marketplace templates...');
    // Create a default agent first
    const admin = await prisma.users.findFirst({ where: { email: 'admin@example.com' } });
    if (admin) {
      const defaultTemplates = [
        { title: 'Customer Support Agent', description: 'Handles customer inquiries and support tickets.', category: 'support', price: 50, unit: 'month', agentType: 'SUPPORT', capabilities: 'ollama:tinyllama' },
        { title: 'Data Analyst', description: 'Analyzes data and generates reports.', category: 'analytics', price: 75, unit: 'month', agentType: 'ANALYTICS', capabilities: 'ollama:tinyllama' },
        { title: 'Code Assistant', description: 'Helps write and debug code.', category: 'development', price: 60, unit: 'month', agentType: 'CODING', capabilities: 'ollama:tinyllama' },
        { title: 'Healthcare Assistant', description: 'Medical information and appointment scheduling.', category: 'healthcare', price: 90, unit: 'month', agentType: 'SUPPORT', capabilities: 'ollama:tinyllama' },
        { title: 'Financial Advisor', description: 'Investment and portfolio advice.', category: 'finance', price: 120, unit: 'month', agentType: 'ANALYTICS', capabilities: 'ollama:tinyllama' },
        { title: 'Tutor', description: 'Personalized learning assistant.', category: 'education', price: 40, unit: 'month', agentType: 'SUPPORT', capabilities: 'ollama:tinyllama' },
      ];
      for (const tmpl of defaultTemplates) {
        const agent = await prisma.agents.create({
          data: {
            name: tmpl.title,
            description: tmpl.description,
            capabilities: tmpl.capabilities,
            system_prompt: 'You are a helpful assistant.',
            model_provider: 'ollama-local',
            model_name: 'llama2',
            status: 'active',
            agentType: tmpl.agentType,
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
        console.log(`   Seeded: ${tmpl.title}`);
      }
    }
  }
}

main().finally(() => prisma.$disconnect());
