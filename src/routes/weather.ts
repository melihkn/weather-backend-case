import { Router } from 'express';
import { getWeather, getMyQueries, getAllQueries } from '../controllers/weatherController';
import { authenticateJWT } from '../middlewares/auth';
import { authorizeRole } from '../middlewares/authorize';

const router = Router();

// POST /api/weather
router.post('/', authenticateJWT as any, authorizeRole('USER') as any, getWeather as any);

// GET /api/weather/my-queries → only logged-in user
router.get('/my-queries', authenticateJWT as any, authorizeRole('USER') as any, getMyQueries as any);

// GET /api/weather/all → admin only
router.get('/all', authenticateJWT as any, authorizeRole('ADMIN') as any, getAllQueries);


export default router;