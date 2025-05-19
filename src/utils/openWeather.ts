import axios from 'axios';
import logger from '../lib/logger';

export const fetchWeather = async (city: string) => {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&q=${city}`;

    const response = await axios.get(url);
    logger.info(`Weather data fetched successfully!`);
    return response.data;
  } catch (error: any) {
    logger.error(`Failed to fetch weather data: ${error.message}`);
    throw new Error(`Failed to fetch weather data: ${error.message}`);
  }
};
