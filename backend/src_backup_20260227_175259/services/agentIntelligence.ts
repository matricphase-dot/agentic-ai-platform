import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';

export class AgentIntelligence {
  private model: string;

  constructor(model: string = process.env.OLLAMA_MODEL || 'llama3.2:3b'){
    this.model = model;
  }

  /**
   * Call Ollama with a prompt, returns raw text response
   */
  private async callOllama(prompt: string, system?: string): Promise<string> {
    const fullPrompt = system 
      ? `System: ${system}\n\nUser: ${prompt}`
      : prompt;

    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt: fullPrompt,
        stream: false,
        temperature: 0.7,
        format: 'json', // Request JSON output
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    const data = await response.json() as any;
    return data.response;
  }

  /**
   * Market research analysis
   */
  async analyzeMarket(niche: string): Promise<any> {
    const prompt = `Analyze the market for "${niche}". 
Return a JSON object with these exact keys:
- marketSize: string (e.g., "$5B annual")
- growthRate: string (e.g., "15% CAGR")
- competitors: array of objects with name and weakness
- targetCustomer: object with demographics and psychographics
- pricingStrategy: string
- marketingChannels: array of strings
- monthlyRevenuePotential: object with low, medium, high (numbers in USD)

Only output JSON. No other text.`;

    const system = 'You are a senior market analyst. Always output valid JSON.';
    const response = await this.callOllama(prompt, system);
    
    try {
      return JSON.parse(response);
    } catch (e) {
      console.error('Failed to parse Ollama response:', response);
      return { error: 'Invalid JSON response', raw: response };
    }
  }

  /**
   * Generate marketing copy
   */
  async generateMarketingCopy(product: string, audience: string): Promise<any> {
    const prompt = `Create marketing materials for "${product}" targeting ${audience}.
Return JSON with:
- facebookHeadline: string (max 40 chars)
- facebookText: string (max 125 chars)
- instagramCaption: string (with emojis)
- emailSubject: string (max 60 chars)
- emailPreview: string
- landingPageHeadline: string
- landingPageSubheadline: string

Only JSON.`;

    const system = 'You are a creative copywriter. Output only JSON.';
    const response = await this.callOllama(prompt, system);
    
    try {
      return JSON.parse(response);
    } catch (e) {
      return { error: 'Invalid JSON', raw: response };
    }
  }

  /**
   * Contract negotiation advisor
   */
  async negotiateContract(terms: string, ourPosition: string): Promise<any> {
    const prompt = `Proposed contract terms: "${terms}"
Our desired position: "${ourPosition}"

Return JSON with:
- counterOffers: array of 3 objects (name, description)
- redFlags: array of strings
- fallbackPositions: array of strings
- recommendedDeal: object (final terms)

Only JSON.`;

    const system = 'You are an expert contract negotiator. Output only JSON.';
    const response = await this.callOllama(prompt, system);
    
    try {
      return JSON.parse(response);
    } catch (e) {
      return { error: 'Invalid JSON', raw: response };
    }
  }

  /**
   * General task executor
   */
  async executeTask(taskType: string, parameters: any): Promise<any> {
    switch (taskType) {
      case 'MARKET_RESEARCH':
        return this.analyzeMarket(parameters.niche);
      case 'MARKETING_COPY':
        return this.generateMarketingCopy(parameters.product, parameters.audience);
      case 'CONTRACT_NEGOTIATION':
        return this.negotiateContract(parameters.terms, parameters.position);
      case 'BUSINESS_PLAN':
        return this.generateBusinessPlan(parameters.idea, parameters.industry);
      default:
        throw new Error(`Unknown task type: ${taskType}`);
    }
  }

  /**
   * Generate a full business plan (for autonomous launcher)
   */
  async generateBusinessPlan(idea: string, industry: string): Promise<any> {
    const prompt = `Create a business plan for "${idea}" in the ${industry} industry.
Include:
- executiveSummary: string
- problemStatement: string
- solution: string
- targetMarket: string
- revenueModel: string
- marketingStrategy: string
- financialProjections: object (year1, year2, year3 revenue)
- risks: array of strings

Return JSON only.`;

    const system = 'You are a business strategist. Output only valid JSON.';
    const response = await this.callOllama(prompt, system);
    
    try {
      return JSON.parse(response);
    } catch (e) {
      return { error: 'Invalid JSON', raw: response };
    }
  }
}

// Singleton export
export const agentAI = new AgentIntelligence();



