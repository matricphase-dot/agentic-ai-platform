"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
// Import route modules
const auth_1 = __importDefault(require("./routes/auth"));
const agents_1 = __importDefault(require("./routes/agents"));
const messages_1 = __importDefault(require("./routes/messages"));
const documents_1 = __importDefault(require("./routes/documents"));
const recordings_1 = __importDefault(require("./routes/recordings"));
const aiq_1 = __importDefault(require("./routes/aiq"));
const templates_1 = __importDefault(require("./routes/templates"));
const staking_1 = __importDefault(require("./routes/staking"));
const governance_1 = __importDefault(require("./routes/governance"));
const nodes_1 = __importDefault(require("./routes/nodes"));
const teams_1 = __importDefault(require("./routes/teams"));
const agent_versions_1 = __importDefault(require("./routes/agent-versions"));
const test_1 = __importDefault(require("./routes/test"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const invite_1 = __importDefault(require("./routes/invite"));
const webhooks_1 = __importDefault(require("./routes/webhooks"));
const reviews_1 = __importDefault(require("./routes/reviews"));
const audit_logs_1 = __importDefault(require("./routes/audit-logs"));
const chat_1 = __importDefault(require("./routes/chat")); // new
const auth_2 = require("./middleware/auth");
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 5001;
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json());
// Public routes
app.use('/api/auth', auth_1.default);
app.use('/api/test', test_1.default);
// Protected routes (require authentication)
app.use('/api/agents', auth_2.authenticate, agents_1.default);
app.use('/api/messages', auth_2.authenticate, messages_1.default);
app.use('/api/documents', auth_2.authenticate, documents_1.default);
app.use('/api/recordings', auth_2.authenticate, recordings_1.default);
app.use('/api/aiq', auth_2.authenticate, aiq_1.default);
app.use('/api/templates', auth_2.authenticate, templates_1.default);
app.use('/api/staking', auth_2.authenticate, staking_1.default);
app.use('/api/governance', auth_2.authenticate, governance_1.default);
app.use('/api/nodes', auth_2.authenticate, nodes_1.default);
app.use('/api/teams', auth_2.authenticate, teams_1.default);
app.use('/api/agent-versions', auth_2.authenticate, agent_versions_1.default);
app.use('/api/dashboard', auth_2.authenticate, dashboard_1.default);
app.use('/api/invite', auth_2.authenticate, invite_1.default);
app.use('/api/webhooks', auth_2.authenticate, webhooks_1.default);
app.use('/api/reviews', auth_2.authenticate, reviews_1.default);
app.use('/api/reviews', auth_2.authenticate, reviews_1.default);
app.use('/api/audit-logs', auth_2.authenticate, audit_logs_1.default);
// New chat routes
app.use('/api/agents', auth_2.authenticate, chat_1.default); // This will handle /api/agents/:agentId/chat
// Basic health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
