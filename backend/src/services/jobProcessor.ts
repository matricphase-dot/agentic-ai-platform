import { transcribeRecording } from './transcriptionService';
import { analyzeTranscript } from './analysisService';

const queue: string[] = [];
let processing = false;

export function queueTranscription(recordingId: string) {
  queue.push(recordingId);
  if (!processing) processQueue();
}

async function processQueue() {
  if (queue.length === 0) {
    processing = false;
    return;
  }
  processing = true;
  const recordingId = queue.shift()!;
  await transcribeRecording(recordingId);
  await analyzeTranscript(recordingId);
  processQueue();
}