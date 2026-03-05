import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeTranscript(recordingId: string) {
  try {
    const recording = await (prisma as any).recording.findUnique({
      where: { id: recordingId }
    });
    if (!recording?.transcript) {
      console.log(`No transcript for recording ${recordingId}`);
      return;
    }

    // Call OpenAI to analyze the transcript
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant that analyzes meeting transcripts. Provide a concise summary and a bulleted list of action items.'
        },
        {
          role: 'user',
          content: recording.transcript
        }
      ],
      temperature: 0.5,
      max_tokens: 500
    });

    const analysis = response.choices[0].message.content;

    // Save analysis to database
// @ts-ignore
    await (prisma as any).recording.update({
      where: { id: recordingId },
      data: { analysis }
    });

    console.log(`Analysis completed for recording ${recordingId}`);
  } catch (error) {
    console.error(`Analysis failed for ${recordingId}:`, error);
  }
}





