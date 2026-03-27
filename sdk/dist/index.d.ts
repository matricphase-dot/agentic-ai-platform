export interface ClientOptions {
    baseURL?: string;
    token?: string;
}
export declare class AgenticClient {
    private client;
    constructor(options?: ClientOptions);
    setToken(token: string): void;
    login(email: string, password: string): Promise<any>;
    register(email: string, password: string, name?: string): Promise<any>;
    getAgents(): Promise<any>;
    getAgent(id: string): Promise<any>;
    createAgent(data: any): Promise<any>;
    updateAgent(id: string, data: any): Promise<any>;
    deleteAgent(id: string): Promise<any>;
    getStakes(): Promise<any>;
    stake(agentId: string, amount: number): Promise<any>;
    unstake(stakeId: string): Promise<any>;
    claimRewards(stakeId: string): Promise<any>;
    getLeaderboard(): Promise<any>;
    getProposals(): Promise<any>;
    createProposal(data: any): Promise<any>;
    vote(proposalId: string, option: string): Promise<any>;
    getConnectors(): Promise<any>;
    getIntegrations(): Promise<any>;
    createIntegration(connectorId: string, config?: any): Promise<any>;
    deleteIntegration(id: string): Promise<any>;
    getWebhooks(): Promise<any>;
    createWebhook(data: any): Promise<any>;
    updateWebhook(id: string, data: any): Promise<any>;
    deleteWebhook(id: string): Promise<any>;
    testWebhook(id: string): Promise<any>;
}
export default AgenticClient;
