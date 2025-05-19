import './testSetup';
import request from 'supertest';
import app from '../app';
import prisma from '../lib/prisma';
import redis from '../lib/redis';
import logger from '../lib/logger';
let adminToken = '';
let userToken = '';
let newUserId = 0;

const adminEmail = `admin_${Date.now()}@example.com`;
const userEmail = `user_${Date.now()}@example.com`;

beforeAll(async () => {
  await prisma.weatherQuery.deleteMany();
  await prisma.user.deleteMany();
  if (!redis.isOpen) await redis.connect();

  // Create admin
  await request(app)
    .post('/api/auth/register')
    .send({ email: adminEmail, password: 'admin123', username: 'admin' });

  // Promote to admin
  await prisma.user.update({
    where: { email: adminEmail },
    data: { role: 'ADMIN' },
  });

  const loginResAdmin = await request(app)
    .post('/api/auth/login')
    .send({ email: adminEmail, password: 'admin123' });

  adminToken = loginResAdmin.body.token;

  // Create normal user
  await request(app)
    .post('/api/auth/register')
    .send({ email: userEmail, password: 'user123', username: 'user' });

  const loginResUser = await request(app)
    .post('/api/auth/login')
    .send({ email: userEmail, password: 'user123' });

  userToken = loginResUser.body.token;
});


describe('GET /api/admin/users', () => {
    it('should return all users for admin', async () => {
        logger.info('Testing GET /api/admin/users for admin');
        try {
            const res = await request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${adminToken}`);
  
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body.data.users)).toBe(true);
            logger.info('GET /api/admin/users for admin passed');
        } catch (error) {
            logger.error('Error in GET /api/admin/users for admin', error);
            throw error;
        }
    });
  
    it('should reject access for normal user', async () => {
        try {
            const res = await request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${userToken}`);
  
            expect(res.statusCode).toBe(403);
            logger.info('GET /api/admin/users for normal user passed');
        } catch (error) {
            logger.error('Error in GET /api/admin/users for normal user', error);
            throw error;
        }
    });
});

describe('POST /api/admin/users', () => {
    it('should allow admin to create a new user', async () => {
        logger.info('Testing POST /api/admin/users for admin');
        try {
            const res = await request(app)
                .post('/api/admin/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                email: 'newuser@example.com',
                password: 'newpass',
                username: 'newuser',
                });
        
            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.user).toHaveProperty('id');
            newUserId = res.body.data.user.id;
            logger.info('POST /api/admin/users for admin passed');
        } catch (error) {
            logger.error('Error in POST /api/admin/users for admin', error);
            throw error;
        }
      
    });
  
    it('should reject creation by non-admin', async () => {
        try {
        const res = await request(app)
            .post('/api/admin/users')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
            email: 'hacker@example.com',
            password: 'hack',
            username: 'hacker',
            });
    
        expect(res.statusCode).toBe(403);
        logger.info('POST /api/admin/users for non-admin passed');
        } catch (error) {
        logger.error('Error in POST /api/admin/users for non-admin', error);
        throw error;
        }
    });
});

describe('PATCH /api/admin/users/role', () => {
    it('should allow admin to promote user to ADMIN', async () => {
        logger.info('Testing PATCH /api/admin/users/role for admin');
        try {
            const res = await request(app)
                .patch(`/api/admin/users/role`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ id: newUserId, role: 'ADMIN' });
        
            expect(res.statusCode).toBe(200);
            logger.info('PATCH /api/admin/users/role for admin passed');
        } catch (error) {
            logger.error('Error in PATCH /api/admin/users/role for admin', error);
            throw error;
        }
    });
  
    it('should reject role change by normal user', async () => {
        logger.info('Testing PATCH /api/admin/users/role for normal user');
        try {
            const res = await request(app)
                .patch(`/api/admin/users/role`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ id: newUserId, role: 'USER' });
        
            expect(res.statusCode).toBe(403);
            logger.info('PATCH /api/admin/users/role for normal user passed');
        } catch (error) {
            logger.error('Error in PATCH /api/admin/users/role for normal user', error);
            throw error;
        }
    });
  });


  describe('DELETE /api/admin/users', () => {
    it('should allow admin to delete a user', async () => {
        logger.info('Testing DELETE /api/admin/users for admin');
      try {
        const res = await request(app)
          .delete(`/api/admin/users/`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ id: newUserId });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.message).toBe('User deleted successfully');
        logger.info('DELETE /api/admin/users for admin passed');
      } catch (error) {
        logger.error('Error in DELETE /api/admin/users for admin', error);
        throw error;
      }
    });
  
    it('should reject delete by normal user', async () => {
        logger.info('Testing DELETE /api/admin/users for normal user');
        try {
            const res = await request(app)
                .delete(`/api/admin/users/`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ id: newUserId });
        
            expect(res.statusCode).toBe(403);
            logger.info('DELETE /api/admin/users for normal user passed');
        } catch (error) {
            logger.error('Error in DELETE /api/admin/users for normal user', error);
            throw error;
        }
    });
  });
  



  

afterAll(async () => {
  if (redis.isOpen) await redis.disconnect();
  await prisma.$disconnect();
});
