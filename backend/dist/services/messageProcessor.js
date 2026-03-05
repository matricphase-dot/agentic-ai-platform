"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueMessageForProcessing = queueMessageForProcessing;
exports.processMessage = processMessage;
const prisma_1 = require("../lib/prisma");
const ollamaService_1 = require("./ollamaService");
// In-memory queue of message IDs to process
const messageQueue = new Set();
let isProcessing = false;
/**
 * Add a message to the processing queue
 */
function queueMessageForProcessing(messageId) {
    messageQueue.add(messageId);
    console.log(`?? Message ${messageId} queued for processing. Queue size: ${messageQueue.size}`);
    // Trigger processing if not already running
    if (!isProcessing) {
        processQueue();
    }
}
/**
 * Process messages in the queue one by one
 */
async function processQueue() {
    if (isProcessing)
        return;
    isProcessing = true;
    while (messageQueue.size > 0) {
        // Get the next message ID - ensure it's a string
        const messageId = messageQueue.values().next().value;
        if (!messageId)
            break; // safety check
        messageQueue.delete(messageId);
        try {
            await processMessage(messageId);
        }
        catch (error) {
            console.error(`Error processing message ${messageId}:`, error);
        }
    }
    isProcessing = false;
}
/**
 * Process a single message
 */
async function processMessage(messageId) {
    try {
        // Fetch the message with sender and receiver
        const message = await prisma_1.prisma.message.findUnique({
            where: { id: messageId },
            include: {
                sender: true,
                receiver: true,
            },
        });
        if (!message) {
            console.log(`Message ${messageId} not found`);
            return;
        }
        const receiverAgent = message.receiver;
        if (!receiverAgent) {
            console.log(`No receiver agent for message ${messageId}`);
            return;
        }
        // Parse message content
        let userMessage;
        try {
            const content = JSON.parse(message.content);
            userMessage = content.text || message.content;
        }
        catch {
            // If not JSON, treat as plain text
            userMessage = message.content;
        }
        // Handle different agent capabilities
        if (receiverAgent.capabilities?.includes('echo')) {
            // Echo agent: just repeat the message
            const replyContent = { text: `Echo: ${userMessage}` };
            // @ts-ignore
            await prisma_1.prisma.message.create({
                data: {
                    content: JSON.stringify(replyContent),
                    senderId: receiverAgent.id,
                    receiverId: message.senderId,
                    // type field removed - not in schema
                },
            });
            console.log(`Echo agent ${receiverAgent.name} replied to message ${messageId}`);
        }
        else if (receiverAgent.capabilities?.includes('ollama')) {
            // Ollama agent: query local model
            let model = 'tinyllama'; // default
            const capabilities = receiverAgent.capabilities.split(',').map(c => c.trim());
            for (const cap of capabilities) {
                if (cap.startsWith('ollama:')) {
                    const modelPart = cap.split(':')[1];
                    if (modelPart)
                        model = modelPart; // use if valid
                    break;
                }
            }
            // Build prompt with system prompt if available
            let prompt = userMessage;
            if (receiverAgent.systemPrompt) {
                prompt = `${receiverAgent.systemPrompt}\n\nUser: ${userMessage}\nAssistant:`;
            }
            try {
                console.log(`?? Querying Ollama model ${model} for agent ${receiverAgent.name}`);
                const ollamaResponse = await (0, ollamaService_1.queryOllama)(prompt, model);
                const replyContent = { text: ollamaResponse };
                // @ts-ignore
                await prisma_1.prisma.message.create({
                    data: {
                        content: JSON.stringify(replyContent),
                        senderId: receiverAgent.id,
                        receiverId: message.senderId,
                        // type field removed
                    },
                });
                console.log(`? Ollama agent ${receiverAgent.name} responded.`);
            }
            catch (error) {
                console.error(`? Ollama query failed for agent ${receiverAgent.name}:`, error.message);
                // Send error message back to user
                const errorContent = { text: `Sorry, I encountered an error: ${error.message}` };
                // @ts-ignore
                await prisma_1.prisma.message.create({
                    data: {
                        content: JSON.stringify(errorContent),
                        senderId: receiverAgent.id,
                        receiverId: message.senderId,
                        // type field removed
                    },
                });
            }
        }
        else {
            // Unknown capability
            console.log(`Agent ${receiverAgent.name} has no recognized capability`);
            const replyContent = { text: `I don't know how to respond. My capabilities: ${receiverAgent.capabilities || 'none'}` };
            // @ts-ignore
            await prisma_1.prisma.message.create({
                data: {
                    content: JSON.stringify(replyContent),
                    senderId: receiverAgent.id,
                    receiverId: message.senderId,
                    // type field removed
                },
            });
        }
    }
    catch (error) {
        console.error(`Error processing message ${messageId}:`, error);
        throw error; // Re-throw for queue handling
    }
}
