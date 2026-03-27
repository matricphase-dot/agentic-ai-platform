"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/stats', auth_1.authenticate, async (req, res) => {
    // Return dummy stats for now
    res.json({
        agentsCount: 0,
        totalStaked: 0,
        votes: 0,
        reviews: 0,
        dataRequests: 0,
    });
});
exports.default = router;
