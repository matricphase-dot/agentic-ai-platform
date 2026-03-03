import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateConnector(apiName: string, docsUrl: string) {
  try {
    const { data } = await axios.get(docsUrl);
    const $ = cheerio.load(data);
    const text = $('body').text();

    const generatedCode = await callLLMToGenerateConnector(apiName, text);

    await prisma.integration_templates.upsert({
      where: { apiName },
      update: { generatedCode, apiDocsUrl: docsUrl },
      create: {
        apiName,
        apiDocsUrl: docsUrl,
        generatedCode
      }
    });

    const filePath = path.join(__dirname, '../integrations', `${apiName}.ts`);
    fs.writeFileSync(filePath, generatedCode);

    return generatedCode;
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(`Failed to generate connector for ${apiName}:`, error);
    throw error;
  }
}

async function callLLMToGenerateConnector(apiName: string, docsText: string): Promise<string> {
  const prompt = `Generate a TypeScript connector for the API "${apiName}" using the following documentation:\n\n${docsText.slice(0, 3000)}...\n\nThe connector should export functions for the main endpoints.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
  });

  return response.choices?.[0]?.message?.content || '';
}




