import { agentAI } from './src/services/agentIntelligence';

async function test() {
  console.log('?? Testing AgentIntelligence with Ollama (mistral)...');
  try {
    const result = await agentAI.analyzeMarket('eco-friendly water bottles');
    console.log('? Market analysis:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error('? Error:', error);
  }
}

test();












