const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.users.findUnique({ where: { email: 'admin@example.com' } });
  if (!admin) {
    console.error('Admin not found – run seed-admin.js first');
    return;
  }

  const now = Date.now(); // for unique names

  // ---- Clean up existing data for this user ----
  console.log('Cleaning up existing data...');
  await prisma.audit_logs.deleteMany({ where: { userId: admin.id } });
  await prisma.userSettings.deleteMany({ where: { userId: admin.id } });
  await prisma.webhook.deleteMany({ where: { userId: admin.id } });
  await prisma.team_agents.deleteMany({ where: { team: { userId: admin.id } } });
  await prisma.teams.deleteMany({ where: { userId: admin.id } });
  await prisma.node_rewards.deleteMany({ where: { node: { ownerId: admin.id } } });
  await prisma.node_tasks.deleteMany({ where: { node: { ownerId: admin.id } } });
  await prisma.nodes.deleteMany({ where: { ownerId: admin.id } });
  await prisma.votes.deleteMany({ where: { userId: admin.id } });
  await prisma.proposals.deleteMany({ where: { createdById: admin.id } });
  await prisma.stakes.deleteMany({ where: { stakerId: admin.id } });
  await prisma.agents.deleteMany({ where: { ownerId: admin.id } });
  console.log('Cleanup complete.');

  // ---- Create fresh data ----

  // Agent
  const agent = await prisma.agents.create({
    data: {
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
    },
  });
  console.log(`✅ Agent created: ${agent.id}`);

  // Stake
  const stake = await prisma.stakes.create({
    data: {
      amount: 100,
      sharePercentage: 5,
      totalReturns: 0,
      staker: { connect: { id: admin.id } },
      agent: { connect: { id: agent.id } },
    },
  });
  console.log(`✅ Stake created: ${stake.id}`);

  // Proposal
  const proposal = await prisma.proposals.create({
    data: {
      title: `Sample Proposal ${now}`,
      description: 'Test proposal',
      options: ['Yes', 'No'],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      creator: { connect: { id: admin.id } },
      status: 'active',
    },
  });
  console.log(`✅ Proposal created: ${proposal.id}`);

  // Vote
  await prisma.votes.create({
    data: {
      proposal: { connect: { id: proposal.id } },
      user: { connect: { id: admin.id } },
      option: 'Yes',
      weight: 100,
    },
  });

  // Node
  const node = await prisma.nodes.create({
    data: {
      name: `Test Node ${now}`,
      endpoint: 'http://localhost:8080',
      specs: { cpu: 4, ram: 8 },
      location: 'Local',
      version: '1.0.0',
      status: 'offline',
      owner: { connect: { id: admin.id } },
    },
  });
  console.log(`✅ Node created: ${node.id}`);

  // Node task
  const task = await prisma.node_tasks.create({
    data: {
      node: { connect: { id: node.id } },
      agent: { connect: { id: agent.id } },
      user: { connect: { id: admin.id } },
      type: 'test',
      input: { data: 'test' },
      status: 'pending',
    },
  });
  console.log(`✅ Node task created: ${task.id}`);

  // Node reward
  await prisma.node_rewards.create({
    data: {
      node: { connect: { id: node.id } },
      amount: 10,
      reason: 'Test reward',
      task: { connect: { id: task.id } },
    },
  });

  // Team
  const team = await prisma.teams.create({
    data: {
      name: `Test Team ${now}`,
      description: 'A team for testing',
      user: { connect: { id: admin.id } },
    },
  });
  console.log(`✅ Team created: ${team.id}`);

  // Team agent
  await prisma.team_agents.create({
    data: {
      team: { connect: { id: team.id } },
      agent: { connect: { id: agent.id } },
    },
  });

  // Webhook
  const webhook = await prisma.webhook.create({
    data: {
      name: `Test Webhook ${now}`,
      url: 'https://webhook.site/example',
      events: ['agent.created'],
      isActive: true,
      user: { connect: { id: admin.id } },
    },
  });
  console.log(`✅ Webhook created: ${webhook.id}`);

  // User settings
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
  console.log('✅ User settings created.');

  // Audit log
  await prisma.audit_logs.create({
    data: {
      user: { connect: { id: admin.id } },
      action: 'TEST_RUN',
      entity: 'system',
      entityId: 'test',
    },
  });
  console.log('✅ Audit log created.');

  console.log('Seeding complete.');
}

main().finally(() => prisma.$disconnect());
