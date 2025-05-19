import { Request, Response } from 'express';
import { fetchWeather } from '../utils/openWeather';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';
import { WeatherQueryResponse, WeatherRequestDTO } from '../dto/weather_dto';
import prisma from '../lib/prisma';
import redis from '../lib/redis';
import { ApiResponse } from '../types/ApiResponse';
import logger from '../lib/logger';



export const getWeather = async (req: AuthenticatedRequest & { body: WeatherRequestDTO }, res: Response<ApiResponse<WeatherQueryResponse>>) => {
    logger.info(`Getting weather for city: ${req.body.city}`);
    const city = req.body.city as string;
    if (!city) {
        logger.error(`City is required in request body`);
        return res.status(400).json({success: false, error: 'City is required in request body' });
    }
    

    const redisKey = `weather:${city}`;


    try {
      // check if city is in redis
      const cachedData = await redis.get(redisKey);
      if (cachedData) {
        logger.info(`Cache hit! City: ${city} is present in redis cache!`);
        return res.json({success: true, data: JSON.parse(cachedData)});
      }
      logger.info(`Cache miss! City: ${city} is not present in redis cache!`);
      const data = await fetchWeather(city);
  
      //Save query to database
      await prisma.weatherQuery.create({
        data: {
          city,
          result: data, // Prisma allows storing JSON
          user: {
            connect: { id: req.user!.id }, // req.user is available via authenticateJWT
          },
        },
      });
      logger.info(`Query saved to database!`);
      await redis.set(redisKey, JSON.stringify(data), { EX: 600 }); // TTL 10 minutes
      logger.info(`Data saved to redis cache!`);
  
      res.json({ success: true, data: data });
    } catch (err: any) {
      logger.error(`Failed to fetch weather data! Error: ${err.message || err}`);
      res.status(500).json({ success: false, error: 'Failed to fetch weather data' });
    }
  };



export const getMyQueries = async (req: AuthenticatedRequest, res: Response) => {
    logger.info(`Getting all queries for user: ${req.user!.id}`);
    try {
        const queries = await prisma.weatherQuery.findMany({
            where: { userId: req.user!.id },
            orderBy: { createdAt: 'desc' },
        });
        logger.info(`Weather queries fetched successfully!`);
        res.json({ success: true, data: queries });
    } catch (err: any) {
        logger.error(`Failed to fetch weather queries! Error: ${err.message || err}`);
        res.status(500).json({ success: false, error: 'Failed to fetch weather queries' });
    }
};

export const getAllQueries = async (req: AuthenticatedRequest, res: Response) => {
    try {
        logger.info('Fetching all weather queries');
        const queries = await prisma.weatherQuery.findMany({
        orderBy: { createdAt: 'desc' },
        include: { user: true },
        });
        logger.info('Weather queries fetched successfully');
        res.json({ success: true, data: queries });
    } catch (err: any) {
        logger.error(`Failed to fetch weather queries! Error: ${err.message || err}`);
        res.status(500).json({ success: false, error: 'Failed to fetch weather queries' });
    }
};