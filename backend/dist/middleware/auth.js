"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log('? Auth: No token provided');
            return res.status(401).json({ error: 'No token provided' });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            console.log('? Auth: Invalid token format');
            return res.status(401).json({ error: 'Invalid token format' });
        }
        const secret = process.env.JWT_SECRET || 'default-secret-change-me';
        console.log('?? Auth using secret:', secret);
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, secret);
            console.log('? Auth: Token verified, decoded:', decoded);
        }
        catch (err) {
            console.log('? Auth: JWT verification failed:', err.message);
            return res.status(401).json({ error: 'Invalid token' });
        }
        // Use 'id' field from token (matches login route)
        const user = await prisma_1.prisma.users.findUnique({
            where: { id: decoded.id },
        });
        if (!user) {
            console.log('? Auth: User not found for id:', decoded.id);
            return res.status(401).json({ error: 'User not found' });
        }
        req.user = user;
        console.log('? Auth: User authenticated:', user.email);
        next();
    }
    catch (error) {
        console.error('? Auth: Unexpected error:', error);
        return res.status(401).json({ error: 'Invalid token' });
    }
}
