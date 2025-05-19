import winston from 'winston';

const logger = winston.createLogger({
  level: 'info', // change to 'debug' for more verbose logs
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
      return `[${timestamp}] [${level.toUpperCase()}] ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta) : ''
      }`;
    })
  ),
  transports: [new winston.transports.Console()],
});

export default logger;
