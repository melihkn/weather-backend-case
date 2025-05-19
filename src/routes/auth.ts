import { Router } from 'express';
import { login, register, createUser } from '../controllers/authController';
import authenticateJWT from '../middlewares/auth';
import { authorizeRole } from '../middlewares/authorize';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';

const router = Router();

router.post('/login', async (req, res) => {
  await login(req, res);
});
router.post('/register', async (req, res) => {
    await register(req, res);
})

router.post('/create-user', authenticateJWT as any, authorizeRole('ADMIN') as any, async (req: AuthenticatedRequest, res) => {
    await createUser(req, res);
})

export default router;