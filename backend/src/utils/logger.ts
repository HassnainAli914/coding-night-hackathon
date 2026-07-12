import winston from 'winston';
import path from 'path';
import { config } from '../config';

const isVercel = !!process.env.VERCEL;
const logDir = path.resolve(__dirname, '../../logs');

// Custom format: timestamp + level + message
const logFormat = winston.format.printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
});

// Build transports array
const transports: winston.transport[] = [
  // Console transport — always active
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'HH:mm:ss' }),
      logFormat
    ),
  }),
];

// File transports removed to prevent read-only filesystem crashes on Vercel

export const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    logFormat
  ),
  transports,
  exitOnError: false,
});
