const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function safeCreate(model, data, name) {
  try {
    const result = await prisma[model].create({ data });
    console.log(`✅ ${name} created: ${result.id}`);
    return result;
  } catch (error) {
    console.log(`❌ Failed to create ${name}:`, error.message);
    return null;
  }
}

async function main() {
  const admin = await prisma.users.findUnique({ where: { email: 'admin@example.com' } });
  if (!admin) {
    console.error('Admin not found – run seed-admin.js first');
    return;
  }

  const now = Date.now();

  // Agent
  const agent = await safeCreate('agents', {
    name: `Sample Agent ${now}`,
    description: 'A sample agent for testing',
    capabilities: 'ollama:tinyllama',
    system_prompt: 'You are a helpful assistant.',
    model_provider: 'ollama-local',
    model_name: 'llama2',
    status: 'active',
    agentType: 'SUPPORT',
    specialties: [],
    configuration: {},
    owner: { connect: { id: admin.id } },
  }, 'Agent');
  if (!agent) return;

  // Stake
  await safeCreate('stakes', {
    amount: 100,
    sharePercentage: 5,
    totalReturns: 0,
    staker: { connect: { id: admin.id } },
    agent: { connect: { id: agent.id } },
  }, 'Stake');

  // Proposal
  const proposal = await safeCreate('proposals', {
    title: `Sample Proposal ${now}`,
    description: 'Test proposal',
    options: ['Yes', 'No'],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    creator: { connect: { id: admin.id } },
    status: 'active',
  }, 'Proposal');
  if (proposal) {
    // Vote
    await safeCreate('votes', {
      proposal: { connect: { id: proposal.id } },
      user: { connect: { id: admin.id } },
      option: 'Yes',
      weight: 100,
    }, 'Vote');
  }

  // Node
  const node = await safeCreate('nodes', {
    name: `Test Node ${now}`,
    endpoint: 'http://localhost:8080',
    specs: { cpu: 4, ram: 8 },
    location: 'Local',
    version: '1.0.0',
    status: 'offline',
    owner: { connect: { id: admin.id } },
  }, 'Node');
  if (node) {
    // Node task
    const task = await safeCreate('node_tasks', {
      node: { connect: { id: node.id } },
      agent: { connect: { id: agent.id } },
      user: { connect: { id: admin.id } },
      type: 'test',
      input: { data: 'test' },
      status: 'pending',
    }, 'Node task');
    if (task) {
      // Node reward
      await safeCreate('node_rewards', {
        node: { connect: { id: node.id } },
        amount: 10,
        reason: 'Test reward',
        task: { connect: { id: task.id } },
      }, 'Node reward');
    }
  }

  // Team
  const team = await safeCreate('teams', {
    name: `Test Team ${now}`,
    description: 'A team for testing',
    user: { connect: { id: admin.id } },
  }, 'Team');
  if (team && agent) {
    // Team agent
    await safeCreate('team_agents', {
      team: { connect: { id: team.id } },
      agent: { connect: { id: agent.id } },
    }, 'Team agent');
  }

  // Webhook
  await safeCreate('webhook', {
    name: `Test Webhook ${now}`,
    url: 'https://webhook.site/example',
    events: ['agent.created'],
    isActive: true,
    user: { connect: { id: admin.id } },
  }, 'Webhook');

  // User settings
  try {
    await prisma.userSettings.upsert({
      where: { userId: admin.id },
      update: {},
      create: {
        user: { connect: { id: admin.id } },
        primaryColor: '#6366f1',
        logoUrl: '',
        theme: 'light',
      },
    });
    console.log('✅ User settings created/updated.');
  } catch (error) {
    console.log('❌ Failed to upsert user settings:', error.message);
  }

  // Audit log
  try {
    await prisma.audit_logs.create({
      data: {
        user: { connect: { id: admin.id } },
        action: 'TEST_RUN',
        entity: 'system',
        entityId: 'test',
      },
    });
    console.log('✅ Audit log created.');
  } catch (error) {
    console.log('❌ Failed to create audit log:', error.message);
  }

  console.log('Seeding complete.');
}

main().finally(() => prisma.$disconnect());
