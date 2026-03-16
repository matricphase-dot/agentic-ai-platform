import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const connectors = [
  {
    name: 'Slack',
    description: 'Send messages and listen to events from Slack',
    icon: 'slack',
    authType: 'oauth2',
    authConfig: {
      authorizationUrl: 'https://slack.com/oauth/v2/authorize',
      tokenUrl: 'https://slack.com/api/oauth.v2.access',
      scopes: ['chat:write', 'channels:history', 'channels:read'],
    },
    configSchema: {
      type: 'object',
      properties: {
        channel: { type: 'string', title: 'Default Channel' },
      },
    },
    isEnabled: true,
  },
  {
    name: 'Discord',
    description: 'Post messages and monitor Discord channels',
    icon: 'discord',
    authType: 'oauth2',
    authConfig: {
      authorizationUrl: 'https://discord.com/api/oauth2/authorize',
      tokenUrl: 'https://discord.com/api/oauth2/token',
      scopes: ['bot', 'messages.read'],
    },
    configSchema: {
      type: 'object',
      properties: {
        guildId: { type: 'string', title: 'Guild ID' },
        channelId: { type: 'string', title: 'Default Channel' },
      },
    },
    isEnabled: true,
  },
  {
    name: 'GitHub',
    description: 'Access repositories, issues, and pull requests',
    icon: 'github',
    authType: 'oauth2',
    authConfig: {
      authorizationUrl: 'https://github.com/login/oauth/authorize',
      tokenUrl: 'https://github.com/login/oauth/access_token',
      scopes: ['repo', 'read:user'],
    },
    configSchema: {
      type: 'object',
      properties: {
        defaultRepo: { type: 'string', title: 'Default Repository' },
      },
    },
    isEnabled: true,
  },
  {
    name: 'Gmail',
    description: 'Read and send emails via Gmail',
    icon: 'gmail',
    authType: 'oauth2',
    authConfig: {
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: ['https://www.googleapis.com/auth/gmail.modify'],
    },
    configSchema: {},
    isEnabled: true,
  },
  {
    name: 'Google Calendar',
    description: 'Manage calendar events',
    icon: 'calendar',
    authType: 'oauth2',
    authConfig: {
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: ['https://www.googleapis.com/auth/calendar'],
    },
    configSchema: {},
    isEnabled: true,
  },
];

async function main() {
  for (const conn of connectors) {
    await (prisma as any).connector.upsert({
      where: { name: conn.name },
      update: {},
      create: conn,
    });
  }
  console.log('✅ Connectors seeded');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

