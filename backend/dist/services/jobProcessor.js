"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueTranscription = queueTranscription;
const transcriptionService_1 = require("./transcriptionService");
const analysisService_1 = require("./analysisService");
const queue = [];
let processing = false;
function queueTranscription(recordingId) {
    queue.push(recordingId);
    if (!processing)
        processQueue();
}
async function processQueue() {
    if (queue.length === 0) {
        processing = false;
        return;
    }
    processing = true;
    const recordingId = queue.shift();
    await (0, transcriptionService_1.transcribeRecording)(recordingId);
    await (0, analysisService_1.analyzeTranscript)(recordingId);
    processQueue();
}
