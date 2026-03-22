"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get current user's settings (public, returns default if none)
router.get('/', async (req, res) => {
    try {
        // If no user, return default settings
        const userId = req.user?.id;
        if (!userId) {
            return res.json({ primaryColor: '#6366f1', logoUrl: '', theme: 'light' });
        }
        const settings = await prisma_1.prisma.userSettings.findUnique({
            where: { userId }
        });
        res.json(settings || { primaryColor: '#6366f1', logoUrl: '', theme: 'light' });
    }
    catch (error) {
        console.error('Error fetching settings:', error);
        // Return default on error
        res.json({ primaryColor: '#6366f1', logoUrl: '', theme: 'light' });
    }
});
// Get appearance settings for current user
router.get('/appearance', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        let settings = await prisma_1.prisma.userSettings.findUnique({
            where: { userId }
        });
        if (!settings) {
            settings = { primaryColor: '#6366f1', logoUrl: '', theme: 'light' };
        }
        res.json(settings);
    }
    catch (error) {
        console.error('Error fetching appearance settings:', error);
        res.status(500).json({ error: 'Failed to fetch appearance settings' });
    }
});
exports.default = router;
