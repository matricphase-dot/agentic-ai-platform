"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerWebhooks = triggerWebhooks;
const axios_1 = __importDefault(require("axios"));
const prisma_1 = require("../lib/prisma");
async function triggerWebhooks(event, data) {
    try {
        // Fetch all active webhooks (we'll filter events in JS since SQLite JSON filtering is limited)
        const webhooks = await prisma_1.prisma.webhook.findMany({
            where: { isActive: true },
        });
        // Filter those that include the event
        const matching = webhooks.filter(wh => {
            const events = wh.events; // assume it's stored as JSON array
            return Array.isArray(events) && events.includes(event);
        });
        const payload = {
            event,
            timestamp: new Date().toISOString(),
            data,
        };
        matching.forEach(webhook => {
            const headers = { 'Content-Type': 'application/json' };
            if (webhook.secret) {
                headers['X-Webhook-Secret'] = webhook.secret;
            }
            axios_1.default.post(webhook.url, payload, { headers })
                .then(() => console.log(`Webhook sent to ${webhook.url}`))
                .catch(err => console.error(`Webhook failed for ${webhook.url}:`, err.message));
        });
    }
    catch (error) {
        console.error('Error triggering webhooks:', error);
    }
}
