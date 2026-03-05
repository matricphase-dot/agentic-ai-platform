import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434/api/generate';

export class ConnectorAI {
  async generateConnectorFromSpec(apiName: string, description: string): Promise<any> {
    const prompt = `Generate a connector configuration for "${apiName}". Description: ${description}.
Return JSON with:
- name: string
- description: string
- authType: "apikey" or "oauth"
- baseUrl: string (e.g., https://api.example.com/v1)
- endpoints: array of objects with method, path, description

Only JSON.`;

    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2:3b',
        prompt,
        stream: false,
        temperature: 0.5,
        format: 'json',
      }),
    });
    const data = await response.json() as any;
    try {
      return JSON.parse(data.response);
    } catch {
      return { error: 'Invalid JSON', raw: data.response };
    }
  }
}

export const connectorAI = new ConnectorAI();









