import rateLimit from 'express-rate-limit';
import { config } from '../config';

/**
 * General rate limiter for all API routes.
 */
export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for auth endpoints (signup, login, OTP).
 * More restrictive to prevent brute-force attacks.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Very strict limiter for OTP endpoints to prevent abuse.
 */
export const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // 5 OTP requests per 5 minutes
  message: {
    success: false,
    message: 'Too many OTP requests. Please wait before requesting another code.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
