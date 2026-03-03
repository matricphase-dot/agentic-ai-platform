interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

/**
 * Query Ollama with a prompt and model
 * @param prompt The input text
 * @param model The model name (default: tinyllama)
 * @param endpoint Optional custom Ollama endpoint (default: http://localhost:11434)
 * @returns The generated text response
 */
export async function queryOllama(
  prompt: string,
  model: string = 'tinyllama',
  endpoint: string = 'http://localhost:11434'
): Promise<string> {
  try {
    const url = `${endpoint}/api/generate`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as OllamaGenerateResponse;
    return data.response;
  } catch (error) {
    console.error('Ollama service error:', error);
    throw error;
  }
}
