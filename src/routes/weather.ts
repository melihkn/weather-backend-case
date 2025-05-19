import { Router } from 'express';
import { getWeather, getMyQueries, getAllQueries } from '../controllers/weatherController';
import { authenticateJWT } from '../middlewares/auth';
import { authorizeRole } from '../middlewares/authorize';

const router = Router();

/**
 * @swagger
 * /api/weather:
 *   description: Get weather by city
 *   post:
 *     summary: Get weather by city
 *     tags: [Weather]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               city:
 *                 type: string
 *                 example: "Istanbul"
 *     responses:
 *       200:
 *         description: Weather info returned
 *       400:
 *         description: Missing city name
 *       401:
 *         description: Missing token
 *       403:
 *         description: Forbidden
 */
router.post('/', authenticateJWT as any, authorizeRole('USER') as any, getWeather as any);

// GET /api/weather/my-queries → only logged-in user
/**
 * @swagger
 * /api/weather/my-queries:
 *   get:
 *     summary: Get all queries for logged-in user
 *     description: Get all queries for logged-in user
 *     tags: [Weather]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Weather queries returned
 *       401:
 *         description: Missing token
 *       403:
 *         description: Forbidden
 */

router.get('/my-queries', authenticateJWT as any, authorizeRole('USER') as any, getMyQueries as any);

// GET /api/weather/all → admin only
/**
 * @swagger
 * /api/weather/all:
 *   get:
 *     summary: Get all queries for all users
 *     tags: [Weather]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Weather queries returned
 *       401:
 *         description: Missing token
 *       403:
 *         description: Forbidden
 */
router.get('/all', authenticateJWT as any, authorizeRole('ADMIN') as any, getAllQueries);


export default router;