"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// All AIQ stats endpoints are protected
router.use(auth_1.authenticate);
// GET /api/aiq/agents/stats
router.get('/agents/stats', (req, res) => {
    // TODO: Replace with real DB queries
    res.json({
        total: 12,
        active: 8
    });
});
// GET /api/aiq/staking/stats
router.get('/staking/stats', (req, res) => {
    res.json({
        totalStaked: 12500,
        rewards: 342
    });
});
// GET /api/aiq/proposals/stats
router.get('/proposals/stats', (req, res) => {
    res.json({
        active: 3,
        total: 27
    });
});
// GET /api/aiq/marketplace/stats
router.get('/marketplace/stats', (req, res) => {
    res.json({
        listings: 45,
        downloads: 128
    });
});
// Optional: combined dashboard endpoint
router.get('/dashboard', (req, res) => {
    res.json({
        agents: { total: 12, active: 8 },
        staking: { totalStaked: 12500, rewards: 342 },
        proposals: { active: 3, total: 27 },
        marketplace: { listings: 45, downloads: 128 }
    });
});
exports.default = router;
