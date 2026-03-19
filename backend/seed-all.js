const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Get admin user
  const admin = await prisma.users.findUnique({ where: { email: 'admin@example.com' } });
  if (!admin) {
    console.error('Admin not found');
    return;
  }

  // Create a sample agent (owned by admin)
  const agent = await prisma.agents.create({
    data: {
      name: 'Sample Agent',
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

  // Create a stake on that agent
  const stake = await prisma.stakes.create({
    data: {
      stakeAmount: 100,
      sharePercentage: 5,
      totalReturns: 0,
      staker: { connect: { id: admin.id } },
      agent: { connect: { id: agent.id } },
    },
  });
  console.log(`✅ Stake created: ${stake.id}`);

  // Create a proposal
  const proposal = await prisma.proposals.create({
    data: {
      title: 'Sample Proposal',
      description: 'Test proposal',
      options: ['Yes', 'No'],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      creator: { connect: { id: admin.id } },
      status: 'active',
    },
  });
  console.log(`✅ Proposal created: ${proposal.id}`);

  // Create a vote (optional, if you want to test voting)
  await prisma.votes.create({
    data: {
      proposal: { connect: { id: proposal.id } },
      user: { connect: { id: admin.id } },
      option: 'Yes',
      weight: 100,
    },
  });

  // Create a node
  const node = await prisma.nodes.create({
    data: {
      name: 'Test Node',
      endpoint: 'http://localhost:8080',
      specs: { cpu: 4, ram: 8 },
      location: 'Local',
      version: '1.0.0',
      status: 'offline',
      owner: { connect: { id: admin.id } },
    },
  });
  console.log(`✅ Node created: ${node.id}`);

  // Create a node task
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

  // Create a node reward (optional)
  await prisma.node_rewards.create({
    data: {
      node: { connect: { id: node.id } },
      amount: 10,
      reason: 'Test reward',
      task: { connect: { id: task.id } },
    },
  });

  // Create a team
  const team = await prisma.teams.create({
    data: {
      name: 'Test Team',
      description: 'A team for testing',
      user: { connect: { id: admin.id } },
    },
  });
  console.log(`✅ Team created: ${team.id}`);

  // Add agent to team
  await prisma.team_agents.create({
    data: {
      team: { connect: { id: team.id } },
      agent: { connect: { id: agent.id } },
    },
  });

  // Create a webhook
  const webhook = await prisma.webhooks.create({
    data: {
      name: 'Test Webhook',
      url: 'https://webhook.site/example',
      events: ['agent.created'],
      isActive: true,
      user: { connect: { id: admin.id } },
    },
  });
  console.log(`✅ Webhook created: ${webhook.id}`);

  // Create appearance settings
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

  // Create audit log entry
  await prisma.audit_logs.create({
    data: {
      user: { connect: { id: admin.id } },
      action: 'TEST_RUN',
      entity: 'system',
      entityId: 'test',
    },
  });
  console.log('✅ Audit log created.');

  // Public agent? We'll make the sample agent public via an update (if needed)
  // In your schema, there might be an 'isPublic' field – we'll add one if not present.
  // But for now, we assume a separate public_agents table? Let's check.
  // If not, we'll just list it as a regular agent.
  console.log('Seeding complete.');
}

main().finally(() => prisma.$disconnect());
