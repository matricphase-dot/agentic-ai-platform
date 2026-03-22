"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const webhookService_1 = require("../services/webhookService");
const router = express_1.default.Router();
// POST /api/test-webhook – manually trigger a test webhook
router.post('/', async (req, res) => {
    try {
        const { event, data } = req.body;
        if (!event) {
            return res.status(400).json({ error: 'event is required' });
        }
        await (0, webhookService_1.triggerWebhooks)(event, data || { test: true });
        res.json({ message: 'Webhook triggered' });
    }
    catch (error) {
        console.error('Error in test webhook:', error);
        res.status(500).json({ error: 'Failed to trigger webhook' });
    }
});
exports.default = router;
