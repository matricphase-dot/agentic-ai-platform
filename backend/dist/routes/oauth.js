"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// OAuth endpoints – placeholder to fix build
router.get('/authorize', auth_1.authenticate, (req, res) => {
    res.json({ message: 'OAuth authorize endpoint' });
});
router.post('/token', auth_1.authenticate, (req, res) => {
    res.json({ message: 'OAuth token endpoint' });
});
exports.default = router;
