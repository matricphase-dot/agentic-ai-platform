"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgenticClient = void 0;
const axios_1 = __importDefault(require("axios"));
class AgenticClient {
    constructor(options = {}) {
        const baseURL = options.baseURL || 'https://agentic-ai-platform-tajr.onrender.com/api';
        this.client = axios_1.default.create({ baseURL });
        if (options.token) {
            this.setToken(options.token);
        }
    }
    setToken(token) {
        this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    // Auth
    async login(email, password) {
        const res = await this.client.post('/auth/login', { email, password });
        this.setToken(res.data.token);
        return res.data;
    }
    async register(email, password, name) {
        const res = await this.client.post('/auth/register', { email, password, name });
        this.setToken(res.data.token);
        return res.data;
    }
    // Agents
    async getAgents() {
        return (await this.client.get('/agents')).data;
    }
    async getAgent(id) {
        return (await this.client.get(`/agents/${id}`)).data;
    }
    async createAgent(data) {
        return (await this.client.post('/agents', data)).data;
    }
    async updateAgent(id, data) {
        return (await this.client.put(`/agents/${id}`, data)).data;
    }
    async deleteAgent(id) {
        return (await this.client.delete(`/agents/${id}`)).data;
    }
    // Staking
    async getStakes() {
        return (await this.client.get('/staking')).data;
    }
    async stake(agentId, amount) {
        return (await this.client.post('/staking/stake', { agentId, amount })).data;
    }
    async unstake(stakeId) {
        return (await this.client.post(`/staking/unstake/${stakeId}`)).data;
    }
    async claimRewards(stakeId) {
        return (await this.client.post('/staking/claim', { stakeId })).data;
    }
    async getLeaderboard() {
        return (await this.client.get('/staking/leaderboard')).data;
    }
    // Governance
    async getProposals() {
        return (await this.client.get('/governance')).data;
    }
    async createProposal(data) {
        return (await this.client.post('/governance/proposals', data)).data;
    }
    async vote(proposalId, option) {
        return (await this.client.post('/governance/vote', { proposalId, option })).data;
    }
    // Integrations
    async getConnectors() {
        return (await this.client.get('/integrations/connectors')).data;
    }
    async getIntegrations() {
        return (await this.client.get('/integrations')).data;
    }
    async createIntegration(connectorId, config) {
        return (await this.client.post('/integrations', { connectorId, config })).data;
    }
    async deleteIntegration(id) {
        return (await this.client.delete(`/integrations/${id}`)).data;
    }
    // Webhooks
    async getWebhooks() {
        return (await this.client.get('/webhooks')).data;
    }
    async createWebhook(data) {
        return (await this.client.post('/webhooks', data)).data;
    }
    async updateWebhook(id, data) {
        return (await this.client.put(`/webhooks/${id}`, data)).data;
    }
    async deleteWebhook(id) {
        return (await this.client.delete(`/webhooks/${id}`)).data;
    }
    async testWebhook(id) {
        return (await this.client.post(`/webhooks/${id}/test`)).data;
    }
}
exports.AgenticClient = AgenticClient;
exports.default = AgenticClient;
