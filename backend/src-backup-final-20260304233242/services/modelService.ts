import axios from 'axios';
import { queryOllama } from './ollamaService';

// OpenAI integration (example)
async function queryOpenAI(prompt: string, model: string, apiKey: string): Promise<string> {
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: model || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.choices[0].message.content;
}

// Anthropic (Claude) integration
async function queryAnthropic(prompt: string, model: string, apiKey: string): Promise<string> {
  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: model || 'claude-3-haiku-20240307',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
    },
    {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.content[0].text;
}

// Remote Ollama (e.g., on a VPS)
async function queryRemoteOllama(prompt: string, model: string, endpoint: string): Promise<string> {
  const response = await axios.post(`${endpoint}/api/generate`, {
    model: model || 'llama2',
    prompt,
    stream: false,
  });
  return response.data.response;
}

// Main dispatcher
export async function queryModel(
  prompt: string,
  provider: string,
  model: string,
  apiConfig?: { apiKey?: string; endpoint?: string }
): Promise<string> {
  switch (provider) {
    case 'ollama-local':
      return await queryOllama(prompt, model);
    case 'ollama-remote':
      if (!apiConfig?.endpoint) throw new Error('Remote Ollama endpoint required');
      return await queryRemoteOllama(prompt, model, apiConfig.endpoint);
    case 'openai':
      if (!apiConfig?.apiKey) throw new Error('OpenAI API key required');
      return await queryOpenAI(prompt, model, apiConfig.apiKey);
    case 'anthropic':
      if (!apiConfig?.apiKey) throw new Error('Anthropic API key required');
      return await queryAnthropic(prompt, model, apiConfig.apiKey);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}





