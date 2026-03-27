import axios, { AxiosInstance } from 'axios';

export interface ClientOptions {
  baseURL?: string;
  token?: string;
}

export class AgenticClient {
  private client: AxiosInstance;

  constructor(options: ClientOptions = {}) {
    const baseURL = options.baseURL || 'https://agentic-ai-platform-tajr.onrender.com/api';
    this.client = axios.create({ baseURL });

    if (options.token) {
      this.setToken(options.token);
    }
  }

  setToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Auth
  async login(email: string, password: string) {
    const res = await this.client.post('/auth/login', { email, password });
    this.setToken(res.data.token);
    return res.data;
  }

  async register(email: string, password: string, name?: string) {
    const res = await this.client.post('/auth/register', { email, password, name });
    this.setToken(res.data.token);
    return res.data;
  }

  // Agents
  async getAgents() {
    return (await this.client.get('/agents')).data;
  }

  async getAgent(id: string) {
    return (await this.client.get(`/agents/${id}`)).data;
  }

  async createAgent(data: any) {
    return (await this.client.post('/agents', data)).data;
  }

  async updateAgent(id: string, data: any) {
    return (await this.client.put(`/agents/${id}`, data)).data;
  }

  async deleteAgent(id: string) {
    return (await this.client.delete(`/agents/${id}`)).data;
  }

  // Staking
  async getStakes() {
    return (await this.client.get('/staking')).data;
  }

  async stake(agentId: string, amount: number) {
    return (await this.client.post('/staking/stake', { agentId, amount })).data;
  }

  async unstake(stakeId: string) {
    return (await this.client.post(`/staking/unstake/${stakeId}`)).data;
  }

  async claimRewards(stakeId: string) {
    return (await this.client.post('/staking/claim', { stakeId })).data;
  }

  async getLeaderboard() {
    return (await this.client.get('/staking/leaderboard')).data;
  }

  // Governance
  async getProposals() {
    return (await this.client.get('/governance')).data;
  }

  async createProposal(data: any) {
    return (await this.client.post('/governance/proposals', data)).data;
  }

  async vote(proposalId: string, option: string) {
    return (await this.client.post('/governance/vote', { proposalId, option })).data;
  }

  // Integrations
  async getConnectors() {
    return (await this.client.get('/integrations/connectors')).data;
  }

  async getIntegrations() {
    return (await this.client.get('/integrations')).data;
  }

  async createIntegration(connectorId: string, config?: any) {
    return (await this.client.post('/integrations', { connectorId, config })).data;
  }

  async deleteIntegration(id: string) {
    return (await this.client.delete(`/integrations/${id}`)).data;
  }

  // Webhooks
  async getWebhooks() {
    return (await this.client.get('/webhooks')).data;
  }

  async createWebhook(data: any) {
    return (await this.client.post('/webhooks', data)).data;
  }

  async updateWebhook(id: string, data: any) {
    return (await this.client.put(`/webhooks/${id}`, data)).data;
  }

  async deleteWebhook(id: string) {
    return (await this.client.delete(`/webhooks/${id}`)).data;
  }

  async testWebhook(id: string) {
    return (await this.client.post(`/webhooks/${id}/test`)).data;
  }
}

export default AgenticClient;
