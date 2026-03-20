'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import * as Icons from 'react-icons/fa';
import * as Si from 'react-icons/si';
import * as Md from 'react-icons/md';

// Map icon names to react-icons components
const iconMap: Record<string, any> = {
  slack: Icons.FaSlack,
  discord: Icons.FaDiscord,
  telegram: Icons.FaTelegram,
  msteams: Icons.FaMicrosoft,
  whatsapp: Icons.FaWhatsapp,
  trello: Icons.FaTrello,
  asana: Si.SiAsana,
  jira: Si.SiJira,
  monday: Si.SiMonday,
  clickup: Si.SiClickup,
  notion: Si.SiNotion,
  linear: Si.SiLinear,
  wrike: Si.SiWrike,
  salesforce: Icons.FaSalesforce,
  hubspot: Si.SiHubspot,
  pipedrive: Si.SiPipedrive,
  zoho: Si.SiZoho,
  copper: Si.SiCopper,
  close: Si.SiClose,
  gdrive: Icons.FaGoogleDrive,
  dropbox: Icons.FaDropbox,
  onedrive: Icons.FaMicrosoft,
  box: Icons.FaBox,
  sharepoint: Si.SiMicrosoftsharepoint,
  github: Icons.FaGithub,
  gitlab: Icons.FaGitlab,
  bitbucket: Icons.FaBitbucket,
  azuredevops: Si.SiAzuredevops,
  jiracloud: Si.SiJirasoftware,
  pagerduty: Si.SiPagerduty,
  sentry: Si.SiSentry,
  ganalytics: Icons.FaGoogle,
  mixpanel: Si.SiMixpanel,
  amplitude: Si.SiAmplitude,
  segment: Si.SiSegment,
  datadog: Si.SiDatadog,
  newrelic: Si.SiNewrelic,
  grafana: Si.SiGrafana,
  prometheus: Si.SiPrometheus,
  stripe: Icons.FaStripe,
  paypal: Icons.FaPaypal,
  square: Icons.FaSquare,
  quickbooks: Si.SiQuickbooks,
  xero: Si.SiXero,
  freshbooks: Si.SiFreshbooks,
  mailchimp: Icons.FaMailchimp,
  sendgrid: Si.SiSendgrid,
  activecampaign: Si.SiActivecampaign,
  klaviyo: Si.SiKlaviyo,
  convertkit: Si.SiConvertkit,
  aweber: Si.SiAweber,
  twitter: Icons.FaTwitter,
  linkedin: Icons.FaLinkedin,
  facebook: Icons.FaFacebook,
  instagram: Icons.FaInstagram,
  pinterest: Icons.FaPinterest,
  reddit: Icons.FaReddit,
  tiktok: Icons.FaTiktok,
  youtube: Icons.FaYoutube,
  shopify: Icons.FaShopify,
  woocommerce: Si.SiWoo,
  bigcommerce: Si.SiBigcommerce,
  magento: Si.SiMagento,
  etsy: Icons.FaEtsy,
  ebay: Icons.FaEbay,
  calendar: Icons.FaCalendar,
  sheets: Icons.FaGoogle,
  docs: Icons.FaGoogle,
  excel: Icons.FaFileExcel,
  word: Icons.FaFileWord,
  airtable: Si.SiAirtable,
  coda: Si.SiCoda,
  githubactions: Si.SiGithubactions,
  circleci: Si.SiCircleci,
  travis: Si.SiTravisci,
  jenkins: Icons.FaJenkins,
  sonarqube: Si.SiSonarqube,
  docker: Icons.FaDocker,
  k8s: Si.SiKubernetes,
  terraform: Si.SiTerraform,
  openai: Si.SiOpenai,
  anthropic: Si.SiAnthropic,
  gemini: Si.SiGoogle,
  huggingface: Si.SiHuggingface,
  cohere: Si.SiCohere,
  replicate: Si.SiReplicate,
  stability: Si.SiStabilityai,
};

export default function IntegrationsPage() {
  const { user } = useAuth();
  const [connectors, setConnectors] = useState<any[]>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConnector, setSelectedConnector] = useState<any>(null);
  const [configValues, setConfigValues] = useState<Record<string, any>>({});
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchConnectors();
    fetchIntegrations();
  }, []);

  const fetchConnectors = async () => {
    try {
      const res = await axios.get('/api/integrations/connectors');
      setConnectors(res.data);
    } catch (error) {
      console.error('Failed to fetch connectors', error);
    }
  };

  const fetchIntegrations = async () => {
    try {
      const res = await axios.get('/api/integrations');
      setIntegrations(res.data);
    } catch (error) {
      console.error('Failed to fetch integrations', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (connector: any) => {
    if (connector.authType === 'oauth2') {
      // Redirect to OAuth authorization URL
      const authUrl = connector.authConfig.authorizationUrl;
      const clientId = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID?.[connector.name] || '';
      const redirectUri = `${window.location.origin}`/integrations/oauth/callback;
      const state = Math.random().toString(36).substring(7);
      localStorage.setItem('oauth_state', state);
      const fullUrl = ``${authUrl}`?client_id=&redirect_uri=&response_type=code&state=&scope=`;
      window.location.href = fullUrl;
    } else {
      // API key based
      setSelectedConnector(connector);
      const defaults: Record<string, any> = {};
      if (connector.configSchema?.properties) {
        for (const key of Object.keys(connector.configSchema.properties)) {
          defaults[key] = '';
        }
      }
      setConfigValues(defaults);
      setShowModal(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConnector) return;
    try {
      await axios.post('/api/integrations', {
        connectorId: selectedConnector.id,
        name: selectedConnector.name,
        config: configValues
      });
      setShowModal(false);
      fetchIntegrations();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to connect');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to disconnect?')) return;
    try {
      await axios.delete(/api/integrations/);
      fetchIntegrations();
    } catch (error) {
      alert('Failed to disconnect');
    }
  };

  const filteredConnectors = connectors.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Integrations</h1>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search integrations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 w-full max-w-md rounded"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredConnectors.map(connector => {
          const existing = integrations.find(i => i.connectorId === connector.id);
          const IconComponent = iconMap[connector.icon] || Icons.FaPlug;
          return (
            <div key={connector.id} className="border rounded-lg p-4 flex flex-col bg-white shadow-sm hover:shadow-md transition">
              <div className="flex items-center mb-3">
                <div className="text-3xl mr-3 text-gray-700">
                  <IconComponent />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">{connector.name}</h2>
                  <p className="text-xs text-gray-500">{connector.description}</p>
                </div>
              </div>
              {existing ? (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-green-600">✅ Connected</span>
                  <button
                    onClick={() => handleDelete(existing.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleConnect(connector)}
                  className="mt-2 bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 w-full"
                >
                  Connect
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* API Key Modal */}
      {showModal && selectedConnector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Connect {selectedConnector.name}</h2>
            <form onSubmit={handleSubmit}>
              {selectedConnector.configSchema?.properties && Object.keys(selectedConnector.configSchema.properties).map(key => {
                const prop = selectedConnector.configSchema.properties[key];
                return (
                  <div key={key} className="mb-4">
                    <label className="block text-sm font-medium mb-1">{prop.title || key}</label>
                    <input
                      type="text"
                      value={configValues[key] || ''}
                      onChange={(e) => setConfigValues({ ...configValues, [key]: e.target.value })}
                      className="border p-2 w-full rounded"
                      required={prop.required}
                    />
                  </div>
                );
              })}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Connect</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


