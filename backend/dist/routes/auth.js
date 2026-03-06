"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        // Check if user exists
        const existingUser = await prisma_1.prisma.users.findUnique({
            where: { email }
        });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        // Hash password
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Create user
        const user = await prisma_1.prisma.users.create({
            data: {
                email,
                passwordHash: hashedPassword,
                name,
                role: 'user'
            }
        });
        // Generate token
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        // Return user without password
        const { passwordHash, ...userWithoutPassword } = user;
        res.json({ token, user: userWithoutPassword });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Registration failed' });
    }
});
// Login
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user
        const user = await prisma_1.prisma.users.findUnique({
            where: { email }
        });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Check password
        const valid = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Generate token
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        // Return user without password
        const { passwordHash, ...userWithoutPassword } = user;
        res.json({ token, user: userWithoutPassword });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
});
// Get current user
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        const user = await prisma_1.prisma.users.findUnique({
            where: { id: decoded.id }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { passwordHash, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword });
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});
// Alias for /login to match frontend
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user
        const user = await prisma_1.prisma.users.findUnique({
            where: { email }
        });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Check password
        const valid = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Generate token
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        // Return user without password
        const { passwordHash, ...userWithoutPassword } = user;
        res.json({ token, user: userWithoutPassword });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
});
exports.default = router;
