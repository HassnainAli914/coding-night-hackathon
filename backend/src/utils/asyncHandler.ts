import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async route handler to automatically catch rejected promises
 * and forward them to the Express error handler.
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
