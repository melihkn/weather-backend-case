import express from 'express';
import dotenv from 'dotenv';
import router from './routes/weather';
import authRoutes from './routes/auth';
import adminRoutes from './routes/adminRoutes';
import redis from './lib/redis';
import setupSwagger from './swagger';



dotenv.config();
const app = express();
app.use(express.json());

// Route
app.use('/api/weather', router);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

setupSwagger(app);  

export default app;
