import { Router } from 'express';
import { login, register } from '../controllers/authController';
import authenticateJWT from '../middlewares/auth';
import { authorizeRole } from '../middlewares/authorize';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   description: Login to the application
 *   post:
 *     summary: Login to the application
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "test@test.com"
 *               password:
 *                 type: string
 *                 example: "password"
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
 *                   description: The JWT token for the user
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzE2MjM5MjIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) => {
  await login(req, res);
});

/**
 * @swagger
 * /api/auth/register:
 *   description: Register a new user
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "test@test.com"
 *               password:
 *                 type: string
 *                 example: "password"
 *               username:
 *                 type: string
 *                 example: "test"
 *     responses:
 *       200:
 *         description: Register successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Success message
 *                   example: "User registered successfully"
 *       400:
 *         description: User already exists
 *       500:
 *         description: Internal server error
 */
router.post('/register', async (req, res) => {
    await register(req, res);
})

export default router;