"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryOllama = queryOllama;
/**
 * Query Ollama with a prompt and model
 * @param prompt The input text
 * @param model The model name (default: tinyllama)
 * @param endpoint Optional custom Ollama endpoint (default: http://localhost:11434)
 * @returns The generated text response
 */
async function queryOllama(prompt, model = 'tinyllama', endpoint = 'http://localhost:11434') {
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
        const data = (await response.json());
        return data.response;
    }
    catch (error) {
        console.error('Ollama service error:', error);
        throw error;
    }
}
