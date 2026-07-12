import { Response, NextFunction } from 'express';
import { getSupabaseAdmin } from '../config/supabase';
import { AuthRequest } from '../types';
import { ApiResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';

/**
 * Middleware that requires a valid Supabase JWT in the Authorization header.
 * Extracts the user and attaches it to `req.user`.
 */
export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ApiResponse.unauthorized(res, 'Missing or invalid authorization header');
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      ApiResponse.unauthorized(res, 'Token not provided');
      return;
    }

    // Verify the JWT with Supabase Admin
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      logger.warn(`Auth failed: ${error?.message || 'No user returned'}`);
      ApiResponse.unauthorized(res, 'Invalid or expired token');
      return;
    }

    // Attach user to request
    req.user = {
      id: data.user.id,
      email: data.user.email,
      phone: data.user.phone,
      role: data.user.user_metadata?.role,
      created_at: data.user.created_at,
    };

    next();
  } catch (err) {
    logger.error('Auth middleware error:', err);
    ApiResponse.unauthorized(res, 'Authentication failed');
  }
};

/**
 * Middleware to restrict access based on Database Roles.
 * Queries the profiles table (source of truth) to prevent client-side JWT bypass.
 */
export const requireRole = (allowedRoles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        ApiResponse.unauthorized(res, 'Authentication required');
        return;
      }

      // Query database profile to prevent user editing local JWT storage to bypass roles
      const supabase = getSupabaseAdmin();
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', req.user.id)
        .single();

      if (error || !profile) {
        logger.warn(`Role verification failed. Profile not found for: ${req.user.id}`);
        ApiResponse.forbidden(res, 'Access denied. Profile not found.');
        return;
      }

      // Check if user's database role is allowed
      if (!allowedRoles.includes(profile.role)) {
        logger.warn(`Forbidden access attempt. User ${req.user.id} (Role: ${profile.role}) tried to access resource requiring: ${allowedRoles.join(', ')}`);
        ApiResponse.forbidden(res, 'Access denied. Insufficient permissions.');
        return;
      }

      // Sync role back to req.user
      req.user.role = profile.role;
      next();
    } catch (err) {
      logger.error('Role authorization middleware error:', err);
      ApiResponse.forbidden(res, 'Authorization check failed');
    }
  };
};

/**
 * Optional auth middleware — does not reject unauthenticated requests,
 * but attaches user data if a valid token is present.
 */
export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase.auth.getUser(token);

        if (!error && data.user) {
          req.user = {
            id: data.user.id,
            email: data.user.email,
            phone: data.user.phone,
            role: data.user.user_metadata?.role,
            created_at: data.user.created_at,
          };
        }
      }
    }

    next();
  } catch {
    next();
  }
};
