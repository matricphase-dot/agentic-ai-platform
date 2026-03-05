"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeTranscript = analyzeTranscript;
const client_1 = require("@prisma/client");
const openai_1 = __importDefault(require("openai"));
const prisma = new client_1.PrismaClient();
const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
async function analyzeTranscript(recordingId) {
    try {
        const recording = await prisma.recording.findUnique({
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
        await prisma.recording.update({
            where: { id: recordingId },
            data: { analysis }
        });
        console.log(`Analysis completed for recording ${recordingId}`);
    }
    catch (error) {
        console.error(`Analysis failed for ${recordingId}:`, error);
    }
}
