import { Response } from 'express';
import { ApiResponseBody, ApiError } from '../types';

/**
 * Standardized API response utility.
 * All API endpoints return responses through this class for consistency.
 */
export class ApiResponse {
  /**
   * Send a success response
   */
  static success<T>(res: Response, data?: T, message = 'Success', statusCode = 200): void {
    const body: ApiResponseBody<T> = {
      success: true,
      message,
      data,
    };
    res.status(statusCode).json(body);
  }

  /**
   * Send a created response (201)
   */
  static created<T>(res: Response, data?: T, message = 'Created successfully'): void {
    ApiResponse.success(res, data, message, 201);
  }

  /**
   * Send an error response
   */
  static error(
    res: Response,
    message = 'An error occurred',
    statusCode = 500,
    errors?: ApiError[]
  ): void {
    const body: ApiResponseBody = {
      success: false,
      message,
      errors,
    };
    res.status(statusCode).json(body);
  }

  /**
   * Send a validation error response (422)
   */
  static validationError(res: Response, errors: ApiError[]): void {
    // Use the first specific error as the main message so the user sees it directly
    const firstMsg = errors.length > 0 ? errors[0].message : 'Validation failed';
    ApiResponse.error(res, firstMsg, 422, errors);
  }

  /**
   * Send an unauthorized response (401)
   */
  static unauthorized(res: Response, message = 'Authentication required'): void {
    ApiResponse.error(res, message, 401);
  }

  /**
   * Send a forbidden response (403)
   */
  static forbidden(res: Response, message = 'Access denied'): void {
    ApiResponse.error(res, message, 403);
  }

  /**
   * Send a not found response (404)
   */
  static notFound(res: Response, message = 'Resource not found'): void {
    ApiResponse.error(res, message, 404);
  }

  /**
   * Send a too many requests response (429)
   */
  static tooManyRequests(res: Response, message = 'Too many requests, please try again later'): void {
    ApiResponse.error(res, message, 429);
  }
}
