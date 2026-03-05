"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/stakes', auth_1.authenticate, (req, res) => {
    res.json([{ id: '1', amount: 100, status: 'active', agent: { id: 'a1', name: 'Agent 1' } }]);
});
router.post('/stake', auth_1.authenticate, (req, res) => {
    res.status(201).json({ id: 'new-stake', amount: req.body.amount, status: 'active' });
});
router.post('/unstake/:stakeId', auth_1.authenticate, (req, res) => {
    res.json({ id: req.params.stakeId, status: 'unstaked' });
});
router.get('/leaderboard', (req, res) => {
    res.json([{ agent: { id: 'a1', name: 'Agent 1' }, _sum: { amount: 500 } }]);
});
router.post('/claim', auth_1.authenticate, (req, res) => {
    res.status(501).json({ error: 'Reward claiming is temporarily disabled' });
});
exports.default = router;
