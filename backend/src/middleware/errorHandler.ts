import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Custom application error with HTTP status code.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware.
 * Catches all errors and returns a standardized JSON response.
 */
export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Determine status code
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const isOperational = err instanceof AppError ? err.isOperational : false;

  // Log the error
  if (statusCode >= 500 || !isOperational) {
    logger.error(`Unhandled Error: ${err.message}`, { stack: err.stack });
  } else {
    logger.warn(`App Error [${statusCode}]: ${err.message}`);
  }

  // Send response — never leak stack traces in production/Vercel
  const isDev = process.env.NODE_ENV === 'development' && !process.env.VERCEL;

  res.status(statusCode).json({
    success: false,
    message: isOperational ? err.message : 'Internal server error',
    ...(isDev && {
      stack: err.stack,
      raw: err.message,
    }),
  });
};

/**
 * 404 Not Found handler — catches unmatched routes.
 */
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};
