import './testSetup';

import request from 'supertest';
import app from '../app';
import logger from '../lib/logger';
import redis from '../lib/redis';
import prisma from '../lib/prisma';

const email = `testuser@example.com`;
const password = 'test123';
const username = `testuser`;
let token: string;



beforeAll(async () => {
    if (!redis.isOpen) await redis.connect(); // ensure connection
    await prisma.user.deleteMany();
    await prisma.weatherQuery.deleteMany();
  
    // Register + login fresh user for this test file
    await request(app)
      .post('/api/auth/register')
      .send({ email, password, username });
  
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password });
  
    token = res.body.token;
});

describe('POST /api/weather', () => {
  it('should return weather data for a valid city', async () => {
    try {
      const res = await request(app)
        .post('/api/weather')
        .set('Authorization', `Bearer ${token}`)
        .send({ city: 'New York' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('data');
      logger.info('Weather test passed');
    } catch (error) {
      logger.error('Error in weather test', error);
      throw error;
    }
  });
});

describe('GET /api/weather/my-queries', () => {
  it('should return weather queries for the logged-in user', async () => {
    const res = await request(app)
      .get('/api/weather/my-queries')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('data');
    logger.info('Weather queries test passed');
  });
});

describe('GET /api/weather/all', () => {
    it('should provide error if not admin', async () => {
        try {
            const res = await request(app)
                .get('/api/weather/all')
                .set('Authorization', `Bearer ${token}`);
            
            expect(res.statusCode).toBe(403);
            expect(res.body).toHaveProperty('error');
            logger.info('USER trying to access admin route passed (user cannot access this route)');
        } catch (error) {
            logger.error('Error in weather all test', error);
            throw error;
        }
    });
});

// ADMIN ROUTE
// Register and login admin user
const adminEmail = `admin@example.com`;
const adminPassword = 'admin123';
const adminUsername = `admin`;
let adminToken: string;


describe('GET /api/weather/all', () => {
    it('should provide error if not admin', async () => {
        try {
            // Register + login fresh user for this test file
            await request(app)
                .post('/api/auth/register')
                .send({ email: adminEmail, password: adminPassword, username: adminUsername });
            
            // Update user role to ADMIN to test admin route
            await prisma.user.update({
                where: { email: adminEmail },
                data: { role: 'ADMIN' },
                });

            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({ email: adminEmail, password: adminPassword });

                adminToken = loginRes.body.token;
        
            const res = await request(app)
                .get('/api/weather/all')
                .set('Authorization', `Bearer ${adminToken}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('success');
            expect(res.body).toHaveProperty('data');
            logger.info('ADMIN trying to access admin route passed (admin can access this route)');
        }
        catch (error) {
            logger.error('Error in weather all test', error);
            throw error;
        }
    });
});

afterAll(async () => {
    if (redis.isOpen) await redis.disconnect();
    await prisma.$disconnect();
});



