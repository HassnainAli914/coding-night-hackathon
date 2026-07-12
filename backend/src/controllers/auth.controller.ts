import { Response } from 'express';
import { validationResult } from 'express-validator';
import { authService } from '../services/auth.service';
import { ApiResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../types';

/**
 * Auth Controller — handles HTTP request/response for all auth endpoints.
 * Delegates business logic to AuthService.
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

// ─── POST /api/auth/signup ───────────────────────

export const signup = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (handleValidationErrors(req, res)) return;

  const { email, password, name, phone, role } = req.body;

  const data = await authService.signUpWithEmail({
    email,
    password,
    name,
    phone,
    role,
  });

  if ((data as any).requiresOtp) {
    ApiResponse.created(res, {
      requiresOtp: true,
      email: (data as any).email,
    }, (data as any).message);
  } else {
    ApiResponse.created(res, {
      user: (data as any).user,
      session: (data as any).session,
    }, 'Account created successfully!');
  }
});

// ─── POST /api/auth/login ────────────────────────

export const login = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (handleValidationErrors(req, res)) return;

  const { email, password } = req.body;

  const data = await authService.signInWithEmail({ email, password });

  if (data.requiresOtp) {
    ApiResponse.success(res, {
      requiresOtp: true,
      email: data.email,
    }, data.message);
  } else {
    ApiResponse.success(res, {
      user: (data as any).user,
      session: (data as any).session,
    }, 'Logged in successfully');
  }
});

// ─── POST /api/auth/login/phone ──────────────────

export const loginWithPhone = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (handleValidationErrors(req, res)) return;

  const { phone, password } = req.body;

  const result = await authService.signInWithPhone({ phone, password });

  ApiResponse.success(res, result, 'OTP sent to your phone number');
});

// ─── POST /api/auth/verify-otp ───────────────────

export const verifyOtp = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (handleValidationErrors(req, res)) return;

  const { token, type, phone, email } = req.body;

  const data = await authService.verifyOtp({ token, type, phone, email });

  ApiResponse.success(res, {
    user: data.user,
    session: data.session,
  }, 'OTP verified successfully');
});

// ─── POST /api/auth/resend-otp ───────────────────

export const resendOtp = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (handleValidationErrors(req, res)) return;

  const { type, phone, email } = req.body;

  const result = await authService.resendOtp({ type, phone, email });

  ApiResponse.success(res, result, 'OTP resent successfully');
});

// ─── POST /api/auth/forgot-password ──────────────

export const forgotPassword = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (handleValidationErrors(req, res)) return;

  const { email } = req.body;

  const result = await authService.forgotPassword(email);

  ApiResponse.success(res, result, 'Password reset email sent');
});

// ─── POST /api/auth/reset-password ───────────────

export const resetPassword = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (handleValidationErrors(req, res)) return;

  const { access_token, new_password } = req.body;

  const result = await authService.resetPassword({ access_token, new_password });

  ApiResponse.success(res, result, 'Password updated successfully');
});

// ─── POST /api/auth/refresh-session ──────────────

export const refreshSession = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (handleValidationErrors(req, res)) return;

  const { refresh_token } = req.body;

  const data = await authService.refreshSession(refresh_token);

  ApiResponse.success(res, {
    session: data.session,
    user: data.user,
  }, 'Session refreshed');
});

// ─── POST /api/auth/logout ───────────────────────

export const logout = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    ApiResponse.unauthorized(res);
    return;
  }

  const result = await authService.signOut(req.user.id);

  ApiResponse.success(res, result, 'Signed out successfully');
});

// ─── GET /api/auth/user ──────────────────────────

export const getUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    ApiResponse.unauthorized(res);
    return;
  }

  const user = await authService.getUser(req.user.id);

  ApiResponse.success(res, { user }, 'User retrieved successfully');
});
