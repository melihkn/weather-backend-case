import {
    getAllUsers,
    updateUserRole,
    createUserByAdmin,
    deleteUserByAdmin,
  } from '../controllers/adminController';
import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth';
import { authorizeRole } from '../middlewares/authorize';

const router = Router();

router.get('/users', authenticateJWT as any, authorizeRole('ADMIN') as any, getAllUsers as any);
router.patch('/users/role', authenticateJWT as any, authorizeRole('ADMIN') as any, updateUserRole as any);


  
router.post('/users', authenticateJWT as any, authorizeRole('ADMIN') as any, createUserByAdmin as any);
router.delete('/users', authenticateJWT as any, authorizeRole('ADMIN') as any, deleteUserByAdmin as any);

export default router;