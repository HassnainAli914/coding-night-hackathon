import { Response } from 'express';
import { validationResult } from 'express-validator';
import { userService } from '../services/user.service';
import { ApiResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../types';

/**
 * User Controller — handles HTTP request/response for profile endpoints.
 */

// ─── Helper: Extract Validation Errors ───────────

function handleValidationErrors(req: AuthRequest, res: Response): boolean {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    ApiResponse.validationError(
      res,
      errors.array().map((e) => ({
        field: 'param' in e ? (e as any).param : undefined,
        message: e.msg,
      }))
    );
    return true;
  }
  return false;
}

// ─── POST /api/users/profile ─────────────────────

export const createProfile = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (handleValidationErrors(req, res)) return;

  if (!req.user) {
    ApiResponse.unauthorized(res);
    return;
  }

  const { name, role, phone, email, avatar_url } = req.body;

  const profile = await userService.createProfile(req.user.id, {
    name,
    role,
    phone,
    email,
    avatar_url,
  });

  ApiResponse.created(res, { profile }, 'Profile created successfully');
});

// ─── PUT /api/users/profile ──────────────────────

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (handleValidationErrors(req, res)) return;

  if (!req.user) {
    ApiResponse.unauthorized(res);
    return;
  }

  const { name, role, phone, email, avatar_url } = req.body;

  const profile = await userService.updateProfile(req.user.id, {
    name,
    role,
    phone,
    email,
    avatar_url,
  });

  ApiResponse.success(res, { profile }, 'Profile updated successfully');
});

// ─── GET /api/users/profile ──────────────────────

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    ApiResponse.unauthorized(res);
    return;
  }

  const profile = await userService.getProfile(req.user.id);

  ApiResponse.success(res, { profile }, 'Profile retrieved successfully');
});

// ─── GET /api/users/profile/:id ──────────────────

export const getProfileById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;

  const profile = await userService.getProfileById(id);

  ApiResponse.success(res, { profile }, 'Profile retrieved successfully');
});

// ─── GET /api/users/technicians ──────────────────

export const listTechnicians = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const technicians = await userService.listTechnicians();

  ApiResponse.success(res, { technicians }, 'Technicians listed successfully');
});
