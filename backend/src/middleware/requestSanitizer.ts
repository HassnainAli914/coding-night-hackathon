import { Request, Response, NextFunction } from 'express';

/**
 * Recursively sanitizes an object by trimming strings
 * and removing potentially dangerous characters.
 */
function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    // Trim whitespace
    let sanitized = value.trim();
    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');
    return sanitized;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      sanitized[key] = sanitizeValue(val);
    }
    return sanitized;
  }

  return value;
}

/**
 * Middleware that sanitizes req.body, req.query, and req.params.
 * Trims strings and removes null bytes.
 */
export const requestSanitizer = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeValue(req.query) as typeof req.query;
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeValue(req.params) as typeof req.params;
  }
  next();
};
