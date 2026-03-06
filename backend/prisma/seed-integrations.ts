import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const connectors = [
const connectors = [
  // Communication
  { name: 'Slack', description: 'Team messaging', icon: 'slack', authType: 'oauth2', authConfig: { authorizationUrl: 'https://slack.com/oauth/v2/authorize', tokenUrl: 'https://slack.com/api/oauth.v2.access', scopes: ['chat:write','channels:history'] }, configSchema: { properties: { channel: { type: 'string' } } }, isEnabled: true },
  { name: 'Discord', description: 'Voice and text chat', icon: 'discord', authType: 'oauth2', authConfig: { authorizationUrl: 'https://discord.com/api/oauth2/authorize', tokenUrl: 'https://discord.com/api/oauth2/token', scopes: ['bot','messages.read'] }, configSchema: { properties: { guildId: { type: 'string' }, channelId: { type: 'string' } } }, isEnabled: true },
  { name: 'Telegram', description: 'Messaging app', icon: 'telegram', authType: 'apikey', authConfig: {}, configSchema: { properties: { botToken: { type: 'string', title: 'Bot Token' }, chatId: { type: 'string', title: 'Chat ID' } } }, isEnabled: true },
  { name: 'Microsoft Teams', description: 'Team collaboration', icon: 'msteams', authType: 'oauth2', authConfig: { authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize', tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token', scopes: ['https://graph.microsoft.com/ChannelMessage.Send'] }, configSchema: { properties: { teamId: { type: 'string' }, channelId: { type: 'string' } } }, isEnabled: true },
  { name: 'WhatsApp Business', description: 'Business messaging', icon: 'whatsapp', authType: 'apikey', authConfig: {}, configSchema: { properties: { accessToken: { type: 'string' }, phoneNumberId: { type: 'string' } } }, isEnabled: true },

  // Project Management
  { name: 'Trello', description: 'Kanban boards', icon: 'trello', authType: 'apikey', authConfig: {}, configSchema: { properties: { apiKey: { type: 'string' }, token: { type: 'string' }, boardId: { type: 'string' } } }, isEnabled: true },
  { name: 'Asana', description: 'Task management', icon: 'asana', authType: 'oauth2', authConfig: { authorizationUrl: 'https://app.asana.com/-/oauth_authorize', tokenUrl: 'https://app.asana.com/-/oauth_token', scopes: ['default'] }, configSchema: { properties: { projectId: { type: 'string' } } }, isEnabled: true },
  { name: 'Jira', description: 'Issue tracking', icon: 'jira', authType: 'oauth2', authConfig: { authorizationUrl: 'https://auth.atlassian.com/authorize', tokenUrl: 'https://auth.atlassian.com/oauth/token', scopes: ['read:jira-work','write:jira-work'] }, configSchema: { properties: { siteUrl: { type: 'string' }, projectKey: { type: 'string' } } }, isEnabled: true },
  { name: 'Monday.com', description: 'Work operating system', icon: 'monday', authType: 'apikey', authConfig: {}, configSchema: { properties: { apiToken: { type: 'string' }, boardId: { type: 'string' } } }, isEnabled: true },
  { name: 'ClickUp', description: 'Productivity platform', icon: 'clickup', authType: 'apikey', authConfig: {}, configSchema: { properties: { apiToken: { type: 'string' }, listId: { type: 'string' } } }, isEnabled: true },
  { name: 'Notion', description: 'All-in-one workspace', icon: 'notion', authType: 'oauth2', authConfig: { authorizationUrl: 'https://api.notion.com/v1/oauth/authorize', tokenUrl: 'https://api.notion.com/v1/oauth/token', scopes: [] }, configSchema: { properties: { databaseId: { type: 'string' } } }, isEnabled: true },
  { name: 'Linear', description: 'Issue tracking', icon: 'linear', authType: 'oauth2', authConfig: { authorizationUrl: 'https://linear.app/oauth/authorize', tokenUrl: 'https://api.linear.app/oauth/token', scopes: ['read','write'] }, configSchema: { properties: { teamId: { type: 'string' } } }, isEnabled: true },
  { name: 'Wrike', description: 'Work management', icon: 'wrike', authType: 'oauth2', authConfig: { authorizationUrl: 'https://www.wrike.com/oauth/authorize', tokenUrl: 'https://www.wrike.com/oauth/token', scopes: ['default'] }, configSchema: { properties: { folderId: { type: 'string' } } }, isEnabled: true },

  // CRM & Sales
  { name: 'Salesforce', description: 'CRM', icon: 'salesforce', authType: 'oauth2', authConfig: { authorizationUrl: 'https://login.salesforce.com/services/oauth2/authorize', tokenUrl: 'https://login.salesforce.com/services/oauth2/token', scopes: ['api','refresh_token'] }, configSchema: { properties: { instanceUrl: { type: 'string' }, object: { type: 'string' } } }, isEnabled: true },
  { name: 'HubSpot', description: 'CRM platform', icon: 'hubspot', authType: 'oauth2', authConfig: { authorizationUrl: 'https://app.hubspot.com/oauth/authorize', tokenUrl: 'https://api.hubapi.com/oauth/v1/token', scopes: ['crm.objects.contacts.read'] }, configSchema: { properties: { pipelineId: { type: 'string' } } }, isEnabled: true },
  { name: 'Pipedrive', description: 'Sales CRM', icon: 'pipedrive', authType: 'apikey', authConfig: {}, configSchema: { properties: { apiToken: { type: 'string' }, companyDomain: { type: 'string' } } }, isEnabled: true },
  { name: 'Zoho CRM', description: 'CRM software', icon: 'zoho', authType: 'oauth2', authConfig: { authorizationUrl: 'https://accounts.zoho.com/oauth/v2/auth', tokenUrl: 'https://accounts.zoho.com/oauth/v2/token', scopes: ['ZohoCRM.modules.ALL'] }, configSchema: { properties: { module: { type: 'string' } } }, isEnabled: true },
  { name: 'Copper', description: 'CRM for Google Workspace', icon: 'copper', authType: 'apikey', authConfig: {}, configSchema: { properties: { apiKey: { type: 'string' }, email: { type: 'string' } } }, isEnabled: true },
  { name: 'Close', description: 'Sales communication', icon: 'close', authType: 'apikey', authConfig: {}, configSchema: { properties: { apiKey: { type: 'string' }, organizationId: { type: 'string' } } }, isEnabled: true },

  // File Storage & Sync
  { name: 'Google Drive', description: 'Cloud storage', icon: 'gdrive', authType: 'oauth2', authConfig: { authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth', tokenUrl: 'https://oauth2.googleapis.com/token', scopes: ['https://www.googleapis.com/auth/drive.file'] }, configSchema: { properties: { folderId: { type: 'string' } } }, isEnabled: true },
  { name: 'Dropbox', description: 'File hosting', icon: 'dropbox', authType: 'oauth2', authConfig: { authorizationUrl: 'https://www.dropbox.com/oauth2/authorize', tokenUrl: 'https://api.dropboxapi.com/oauth2/token', scopes: ['files.content.write'] }, configSchema: { properties: { path: { type: 'string' } } }, isEnabled: true },
  { name: 'OneDrive', description: 'Microsoft cloud storage', icon: 'onedrive', authType: 'oauth2', authConfig: { authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize', tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token', scopes: ['Files.ReadWrite'] }, configSchema: { properties: { folderId: { type: 'string' } } }, isEnabled: true },
  { name: 'Box', description: 'Content management', icon: 'box', authType: 'oauth2', authConfig: { authorizationUrl: 'https://account.box.com/api/oauth2/authorize', tokenUrl: 'https://api.box.com/oauth2/token', scopes: ['manage_webhooks'] }, configSchema: { properties: { folderId: { type: 'string' } } }, isEnabled: true },
  { name: 'SharePoint', description: 'Microsoft intranet', icon: 'sharepoint', authType: 'oauth2', authConfig: { authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize', tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token', scopes: ['Sites.ReadWrite.All'] }, configSchema: { properties: { siteUrl: { type: 'string' }, listId: { type: 'string' } } }, isEnabled: true },

  // Code & Development
  { name: 'GitHub', description: 'Code hosting', icon: 'github', authType: 'oauth2', authConfig: { authorizationUrl: 'https://github.com/login/oauth/authorize', tokenUrl: 'https://github.com/login/oauth/access_token', scopes: ['repo'] }, configSchema: { properties: { repository: { type: 'string' } } }, isEnabled: true },
  { name: 'GitLab', description: 'DevOps platform', icon: 'gitlab', authType: 'oauth2', authConfig: { authorizationUrl: 'https://gitlab.com/oauth/authorize', tokenUrl: 'https://gitlab.com/oauth/token', scopes: ['api'] }, configSchema: { properties: { projectId: { type: 'string' } } }, isEnabled: true },
  { name: 'Bitbucket', description: 'Git repository', icon: 'bitbucket', authType: 'oauth2', authConfig: { authorizationUrl: 'https://bitbucket.org/site/oauth2/authorize', tokenUrl: 'https://bitbucket.org/site/oauth2/access_token', scopes: ['repository'] }, configSchema: { properties: { repoSlug: { type: 'string' }, workspace: { type: 'string' } } }, isEnabled: true },
  { name: 'Azure DevOps', description: 'Microsoft dev services', icon: 'azuredevops', authType: 'oauth2', authConfig: { authorizationUrl: 'https://app.vssps.visualstudio.com/oauth2/authorize', tokenUrl: 'https://app.vssps.visualstudio.com/oauth2/token', scopes: ['vso.work'] }, configSchema: { properties: { organization: { type: 'string' }, project: { type: 'string' } } }, isEnabled: true },
  { name: 'Jira (Cloud)', description: 'Issue tracking', icon: 'jiracloud', authType: 'oauth2', authConfig: { authorizationUrl: 'https://auth.atlassian.com/authorize', tokenUrl: 'https://auth.atlassian.com/oauth/token', scopes: ['read:jira-work','write:jira-work'] }, configSchema: { properties: { siteUrl: { type: 'string' }, projectKey: { type: 'string' } } }, isEnabled: true },
  { name: 'Linear', description: 'Issue tracking', icon: 'linear', authType: 'oauth2', authConfig: { authorizationUrl: 'https://linear.app/oauth/authorize', tokenUrl: 'https://api.linear.app/oauth/token', scopes: ['read','write'] }, configSchema: { properties: { teamId: { type: 'string' } } }, isEnabled: true },
  { name: 'PagerDuty', description: 'Incident management', icon: 'pagerduty', authType: 'apikey', authConfig: {}, configSchema: { properties: { apiToken: { type: 'string' }, serviceId: { type: 'string' } } }, isEnabled: true },
  { name: 'Sentry', description: 'Error tracking', icon: 'sentry', authType: 'apikey', authConfig: {}, configSchema: { properties: { authToken: { type: 'string' }, organization: { type: 'string' }, project: { type: 'string' } } }, isEnabled: true },

  // Analytics & Monitoring
  { name: 'Google Analytics', description: 'Web analytics', icon: 'ganalytics', authType: 'oauth2', authConfig: { authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth', tokenUrl: 'https://oauth2.googleapis.com/token', scopes: ['https://www.googleapis.com/auth/analytics.readonly'] }, configSchema: { properties: { viewId: { type: 'string' } } }, isEnabled: true },
  { name: 'Mixpanel', description: 'Product analytics', icon: 'mixpanel', authType: 'apikey', authConfig: {}, configSchema: { properties: { projectToken: { type: 'string' }, apiSecret: { type: 'string' } } }, isEnabled: true },
  { name: 'Amplitude', description: 'Event tracking', icon: 'amplitude', authType: 'apikey', authConfig: {}, configSchema: { properties: { apiKey: { type: 'string' }, secretKey: { type: 'string' } } }, isEnabled: true },
  { name: 'Segment', description: 'Customer data platform', icon: 'segment', authType: 'apikey', authConfig: {}, configSchema: { properties: { writeKey: { type: 'string' } } }, isEnabled: true },
  { name: 'Datadog', description: 'Monitoring', icon: 'datadog', authType: 'apikey', authConfig: {}, configSchema: { properties: { apiKey: { type: 'string' }, applicationKey: { type: 'string' } } }, isEnabled: true },
  { name: 'New Relic', description: 'Observability', icon: 'newrelic', authType: 'apikey', authConfig: {}, configSchema: { properties: { apiKey: { type: 'string' }, accountId: { type: 'string' } } }, isEnabled: true },
  { name: 'Grafana', description: 'Dashboarding', icon: 'grafana', authType: 'apikey', authConfig: {}, configSchema: { properties: { apiKey: { type: 'string' }, url: { type: 'string' } } }, isEnabled: true },
  { name: 'Prometheus', description: 'Monitoring', icon: 'prometheus', authType: 'none', authConfig: {}, configSchema: { properties: { url: { type: 'string' } } }, isEnabled: true },

  // Payments & Finance
  { name: 'Stripe', description: 'Payment processing', icon: 'stripe', authType: 'apikey', authConfig: {}, configSchema: { properties: { apiKey: { type: 'string' }, webhookSecret: { type: 'string' } } }, isEnabled: true },
  { name: 'PayPal', description: 'Online payments', icon: 'paypal', authType: 'oauth2', authConfig: { authorizationUrl: 'https://www.paypal.com/signin/authorize', tokenUrl: 'https://api.paypal.com/v1/oauth2/token', scopes: ['https://uri.paypal.com/services/payments/payment'] }, configSchema: { properties: { clientId: { type: 'string' }, secret: { type: 'string' } } }, isEnabled: true },
  { name: 'Square', description: 'Payment solutions', icon: 'square', authType: 'oauth2', authConfig: { authorizationUrl: 'https://connect.squareup.com/oauth2/authorize', tokenUrl: 'https://connect.squareup.com/oauth2/token', scopes: ['MERCHANT_PROFILE_READ'] }, configSchema: { properties: { locationId: { type: 'string' } } }, isEnabled: true },
  { name: 'QuickBooks', description: 'Accounting', icon: 'quickbooks', authType: 'oauth2', authConfig: { authorizationUrl: 'https://appcenter.intuit.com/connect/oauth2', tokenUrl: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', scopes: ['com.intuit.quickbooks.accounting'] }, configSchema: { properties: { companyId: { type: 'string' } } }, isEnabled: true },
  { name: 'Xero', description: 'Accounting', icon: 'xero', authType: 'oauth2', authConfig: { authorizationUrl: 'https://login.xero.com/identity/connect/authorize', tokenUrl: 'https://identity.xero.com/connect/token', scopes: ['accounting.transactions'] }, configSchema: { properties: { tenantId: { type: 'string' } } }, isEnabled: true },
  { name: 'Freshbooks', description: 'Invoicing', icon: 'freshbooks', authType: 'oauth2', authConfig: { authorizationUrl: 'https://auth.freshbooks.com/oauth/authorize', tokenUrl: 'https://api.freshbooks.com/auth/oauth/token', scopes: [] }, configSchema: { properties: { accountId: { type: 'string' } } }, isEnabled: true },

  // Marketing
  { name: 'Mailchimp', description: 'Email marketing', icon: 'mailchimp', authType: 'apikey', authConfig: {}, configSchema: { properties: { apiKey: { type: 'string' }, serverPrefix: { type: 'string' }, listId: { type: 'string' } } }, isEnabled: true },
  { name: 'SendGrid', description: 'Email delivery', icon: 'sendgrid', authType: 'apikey', authConfig: {}, configSchema: { properties: { apiKey: { type: 'string' }, templateId: { type: 'string' } } }, isEnabled: true },
  { name: 'HubSpot Marketing', description: 'Marketing hub', icon: 'hubspot', authType: 'oauth2', authConfig: { authorizationUrl: 'https://app.hubspot.com/oauth/authorize', tokenUrl: 'https://api.hubapi.com/oauth/v1/token', scopes: ['content'] }, configSchema: { properties: { campaignId: { type: 'string' } } }, isEnabled: true },
  { name: 'ActiveCampaign', description: 'Marketing automation', icon: 'activecampaign', authType: 'apikey', authConfig: {}, configSchema: { properties: { apiKey: { type: 'string' }, accountName: { type: 'string' } } }, isEnabled: true },
  { name: 'Klaviyo', description: 'Email marketing', icon: 'klaviyo', authType: 'apikey', authConfig: {}, configSchema: { properties: { apiKey: { type: 'string' }, listId: { type: 'string' } } }, isEnabled: true },
  { name: 'ConvertKit', description: 'Creator marketing', icon: 'convertkit', authType: 'apikey', authConfig: {}, configSchema: { properties: { apiSecret: { type: 'string' }, formId: { type: 'string' } } }, isEnabled: true },
  { name: 'AWeber', description: 'Email marketing', icon: 'aweber', authType: 'oauth2', authConfig: { authorizationUrl: 'https://auth.aweber.com/oauth2/authorize', tokenUrl: 'https://auth.aweber.com/oauth2/token', scopes: ['account.read'] }, configSchema: { properties: { listId: { type: 'string' } } }, isEnabled: true },

  // Social Media
  { name: 'Twitter', description: 'Social network', icon: 'twitter', authType: 'oauth2', authConfig: { authorizationUrl: 'https://twitter.com/i/oauth2/authorize', tokenUrl: 'https://api.twitter.com/2/oauth2/token', scopes: ['tweet.read','tweet.write'] }, configSchema: { properties: { userId: { type: 'string' } } }, isEnabled: true },
  { name: 'LinkedIn', description: 'Professional network', icon: 'linkedin', authType: 'oauth2', authConfig: { authorizationUrl: 'https://www.linkedin.com/oauth/v2/authorization', tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken', scopes: ['w_member_social'] }, configSchema: { properties: { organizationId: { type: 'string' } } }, isEnabled: true },
  { name: 'Facebook', description: 'Social media', icon: 'facebook', authType: 'oauth2', authConfig: { authorizationUrl: 'https://www.facebook.com/v12.0/dialog/oauth', tokenUrl: 'https://graph.facebook.com/v12.0/oauth/access_token', scopes: ['pages_manage_posts'] }, configSchema: { properties: { pageId: { type: 'string' } } }, isEnabled: true },
  { name: 'Instagram', description: 'Photo sharing', icon: 'instagram', authType: 'oauth2', authConfig: { authorizationUrl: 'https://api.instagram.com/oauth/authorize', tokenUrl: 'https://api.instagram.com/oauth/access_token', scopes: ['instagram_basic'] }, configSchema: { properties: { userId: { type: 'string' } } }, isEnabled: true },
  { name: 'Pinterest', description: 'Visual discovery', icon: 'pinterest', authType: 'oauth2', authConfig: { authorizationUrl: 'https://www.pinterest.com/oauth/', tokenUrl: 'https://api.pinterest.com/v5/oauth/token', scopes: ['boards:read'] }, configSchema: { properties: { boardId: { type: 'string' } } }, isEnabled: true },
  { name: 'Reddit', description: 'Social news', icon: 'reddit', authType: 'oauth2', authConfig: { authorizationUrl: 'https://www.reddit.com/api/v1/authorize', tokenUrl: 'https://www.reddit.com/api/v1/access_token', scopes: ['submit'] }, configSchema: { properties: { subreddit: { type: 'string' } } }, isEnabled: true },
  { name: 'TikTok', description: 'Short video', icon: 'tiktok', authType: 'oauth2', authConfig: { authorizationUrl: 'https://www.tiktok.com/auth/authorize', tokenUrl: 'https://open-api.tiktok.com/oauth/access_token', scopes: ['user.info.basic','video.upload'] }, configSchema: { properties: { openId: { type: 'string' } } }, isEnabled: true },
  { name: 'YouTube', description: 'Video platform', icon: 'youtube', authType: 'oauth2', authConfig: { authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth', tokenUrl: 'https://oauth2.googleapis.com/token', scopes: ['https://www.googleapis.com/auth/youtube.upload'] }, configSchema: { properties: { channelId: { type: 'string' } } }, isEnabled: true },

  // E‑commerce
  { name: 'Shopify', description: 'E‑commerce platform', icon: 'shopify', authType: 'oauth2', authConfig: { authorizationUrl: 'https://{shop}.myshopify.com/admin/oauth/authorize', tokenUrl: 'https://{shop}.myshopify.com/admin/oauth/access_token', scopes: ['read_products','write_products'] }, configSchema: { properties: { shopDomain: { type: 'string' }, productId: { type: 'string' } } }, isEnabled: true },
  { name: 'WooCommerce', description: 'WordPress e‑commerce', icon: 'woocommerce', authType: 'apikey', authConfig: {}, configSchema: { properties: { consumerKey: { type: 'string' }, consumerSecret: { type: 'string' }, storeUrl: { type: 'string' } } }, isEnabled: true },
  { name: 'BigCommerce', description: 'E‑commerce', icon: 'bigcommerce', authType: 'oauth2', authConfig: { authorizationUrl: 'https://login.bigcommerce.com/oauth2/authorize', tokenUrl: 'https://login.bigcommerce.com/oauth2/token', scopes: ['store_v2_products'] }, configSchema: { properties: { storeHash: { type: 'string' } } }, isEnabled: true },
  { name: 'Magento', description: 'E‑commerce', icon: 'magento', authType: 'oauth2', authConfig: { authorizationUrl: 'https://{host}/oauth/authorize', tokenUrl: 'https://{host}/oauth/token', scopes: ['default'] }, configSchema: { properties: { baseUrl: { type: 'string' } } }, isEnabled: true },
  { name: 'Etsy', description: 'Handmade marketplace', icon: 'etsy', authType: 'oauth2', authConfig: { authorizationUrl: 'https://www.etsy.com/oauth/connect', tokenUrl: 'https://api.etsy.com/v3/public/oauth/token', scopes: ['listings_r','listings_w'] }, configSchema: { properties: { shopId: { type: 'string' } } }, isEnabled: true },
  { name: 'eBay', description: 'Auction marketplace', icon: 'ebay', authType: 'oauth2', authConfig: { authorizationUrl: 'https://auth.ebay.com/oauth2/authorize', tokenUrl: 'https://api.ebay.com/identity/v1/oauth2/token', scopes: ['https://api.ebay.com/oauth/api_scope'] }, configSchema: { properties: { marketplaceId: { type: 'string' } } }, isEnabled: true },

  // Productivity & Office
  { name: 'Google Calendar', description: 'Calendar', icon: 'calendar', authType: 'oauth2', authConfig: { authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth', tokenUrl: 'https://oauth2.googleapis.com/token', scopes: ['https://www.googleapis.com/auth/calendar'] }, configSchema: { properties: { calendarId: { type: 'string' } } }, isEnabled: true },
  { name: 'Google Sheets', description: 'Spreadsheets', icon: 'sheets', authType: 'oauth2', authConfig: { authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth', tokenUrl: 'https://oauth2.googleapis.com/token', scopes: ['https://www.googleapis.com/auth/spreadsheets'] }, configSchema: { properties: { spreadsheetId: { type: 'string' }, range: { type: 'string' } } }, isEnabled: true },
  { name: 'Google Docs', description: 'Documents', icon: 'docs', authType: 'oauth2', authConfig: { authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth', tokenUrl: 'https://oauth2.googleapis.com/token', scopes: ['https://www.googleapis.com/auth/documents'] }, configSchema: { properties: { documentId: { type: 'string' } } }, isEnabled: true },
  { name: 'Microsoft Excel', description: 'Spreadsheets', icon: 'excel', authType: 'oauth2', authConfig: { authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize', tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token', scopes: ['Files.ReadWrite'] }, configSchema: { properties: { fileId: { type: 'string' } } }, isEnabled: true },
  { name: 'Microsoft Word', description: 'Word processor', icon: 'word', authType: 'oauth2', authConfig: { authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize', tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token', scopes: ['Files.ReadWrite'] }, configSchema: { properties: { fileId: { type: 'string' } } }, isEnabled: true },
  { name: 'Notion', description: 'Workspace', icon: 'notion', authType: 'oauth2', authConfig: { authorizationUrl: 'https://api.notion.com/v1/oauth/authorize', tokenUrl: 'https://api.notion.com/v1/oauth/token', scopes: [] }, configSchema: { properties: { databaseId: { type: 'string' } } }, isEnabled: true },
  { name: 'Airtable', description: 'Spreadsheet‑database', icon: 'airtable', authType: 'apikey', authConfig: {}, configSchema: { properties: { apiKey: { type: 'string' }, baseId: { type: 'string' }, tableId: { type: 'string' } } }, isEnabled: true },
  { name: 'Coda', description: 'Document collaboration', icon: 'coda', authType: 'apikey', authConfig: {}, configSchema: { properties: { apiToken: { type: 'string' }, docId: { type: 'string' } } }, isEnabled: true },

  // Developer Tools
  { name: 'GitHub Actions', description: 'CI/CD', icon: 'githubactions', authType: 'oauth2', authConfig: { authorizationUrl: 'https://github.com/login/oauth/authorize', tokenUrl: 'https://github.com/login/oauth/access_token', scopes: ['repo'] }, configSchema: { properties: { repository: { type: 'string' }, workflowId: { type: 'string' } } }, isEnabled: true },
  { name: 'CircleCI', description: 'CI/CD', icon: 'circleci', authType: 'apikey', authConfig: {}, configSchema: { properties: { apiToken: { type: 'string' }, projectSlug: { type: 'string' } } }, isEnabled: true },
  { name: 'Travis CI', description: 'CI', icon: 'travis', authType: 'apikey', authConfig: {}, configSchema: { properties: { apiToken: { type: 'string' }, repo: { type: 'string' } } }, isEnabled: true },
  { name: 'Jenkins', description: 'Automation server', icon: 'jenkins', authType: 'apikey', authConfig: {}, configSchema: { properties: { url: { type: 'string' }, user: { type: 'string' }, token: { type: 'string' } } }, isEnabled: true },
  { name: 'SonarQube', description: 'Code quality', icon: 'sonarqube', authType: 'apikey', authConfig: {}, configSchema: { properties: { url: { type: 'string' }, token: { type: 'string' }, projectKey: { type: 'string' } } }, isEnabled: true },
  { name: 'Docker Hub', description: 'Container registry', icon: 'docker', authType: 'apikey', authConfig: {}, configSchema: { properties: { username: { type: 'string' }, password: { type: 'string' }, repository: { type: 'string' } } }, isEnabled: true },
  { name: 'Kubernetes', description: 'Container orchestration', icon: 'k8s', authType: 'apikey', authConfig: {}, configSchema: { properties: { server: { type: 'string' }, token: { type: 'string' }, namespace: { type: 'string' } } }, isEnabled: true },
  { name: 'Terraform', description: 'Infrastructure as code', icon: 'terraform', authType: 'apikey', authConfig: {}, configSchema: { properties: { token: { type: 'string' }, organization: { type: 'string' }, workspace: { type: 'string' } } }, isEnabled: true },

  // AI & Machine Learning
  { name: 'OpenAI', description: 'GPT models', icon: 'openai', authType: 'apikey', authConfig: {}, configSchema: { properties: { apiKey: { type: 'string' }, model: { type: 'string' } } }, isEnabled: true },
  { name: 'Anthropic Claude', description: 'AI assistant', icon: 'anthropic', authType: 'apikey', authConfig: {}, configSchema: { properties: { apiKey: { type: 'string' } } }, isEnabled: true },
  { name: 'Google Gemini', description: 'AI model', icon: 'gemini', authType: 'apikey', authConfig: {}, configSchema: { properties: { apiKey: { type: 'string' } } }, isEnabled: true },
  { name: 'Hugging Face', description: 'Models hub', icon: 'huggingface', authType: 'apikey', authConfig: {}, configSchema: { properties: { apiToken: { type: 'string' } } }, isEnabled: true },
  { name: 'Cohere', description: 'NLP models', icon: 'cohere', authType: 'apikey', authConfig: {}, configSchema: { properties: { apiKey: { type: 'string' } } }, isEnabled: true },
  { name: 'Replicate', description: 'Run models', icon: 'replicate', authType: 'apikey', authConfig: {}, configSchema: { properties: { apiToken: { type: 'string' } } }, isEnabled: true },
  { name: 'Stability AI', description: 'Image generation', icon: 'stability', authType: 'apikey', authConfig: {}, configSchema: { properties: { apiKey: { type: 'string' } } }, isEnabled: true },
];
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


