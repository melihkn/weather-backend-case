import './testSetup';

import request from 'supertest';
import app from '../app';
import logger from '../lib/logger';
import redis from '../lib/redis';
import prisma from '../lib/prisma';



beforeAll(async () => {
  await prisma.weatherQuery.deleteMany();
  await prisma.user.deleteMany();
});

describe('POST /api/auth/register', () => {
  it('should create a new user', async () => {
    try {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: `testuser@example.com`,
          password: 'test123',
          username: `testuser`
        });

      expect(res.statusCode).toBe(201);
      logger.info('Register test passed');
    } catch (error) {
      logger.error('Error in register test', error);
      throw error;
    }
  });
});

describe('POST /api/auth/login', () => {
  it('should login a user and return token', async () => {
    try {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'testuser@example.com', password: 'test123' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(typeof res.body.token).toBe('string');
      logger.info('Login test passed');
    } catch (error) {
      logger.error('Error in login test', error);
      throw error;
    }
  });  
});

describe('POST /api/auth/login', () => {
  it('should try to login a user with incorrect credentials', async () => {
    try {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'testuser@example.com', password: 'wrongpassword' });
        
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
      logger.info('Login test with incorrect credentials passed');
    } catch (error) {
      logger.error('Error in login test with incorrect credentials', error);
      throw error;
    }
  });
});

describe('POST /api/auth/register', () => {
  it('should try to register a user with an existing email', async () => {
    try {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'testuser@example.com', password: 'test123', username: 'testuser2' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
      logger.info('Register test with existing email passed');
    } catch (error) {
      logger.error('Error in register test with existing email', error);
      throw error;
    }
  });
});

describe('POST /api/auth/register', () => {
  it('should try to register a user with an existing username', async () => {
    try {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'testuser2@example.com', password: 'test123', username: 'testuser' });
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
      logger.info('Register test with existing username passed');
    } catch (error) {
      logger.error('Error in register test with existing username', error);
      throw error;
    }
  });
});


afterAll(async () => {
  if (redis.isOpen) await redis.disconnect();
  await prisma.$disconnect();
});