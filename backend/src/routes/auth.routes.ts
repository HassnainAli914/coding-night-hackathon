import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';
import { authLimiter, otpLimiter } from '../middleware/rateLimiter';
import {
  signupValidation,
  loginValidation,
  phoneLoginValidation,
  verifyOtpValidation,
  resendOtpValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  refreshSessionValidation,
} from '../validators/auth.validator';

const router = Router();

// ─── Public Auth Routes ──────────────────────────

// Email signup
router.post('/signup', authLimiter, signupValidation, authController.signup);

// Email login
router.post('/login', authLimiter, loginValidation, authController.login);

// Phone OTP login (sends OTP)
router.post('/login/phone', otpLimiter, phoneLoginValidation, authController.loginWithPhone);

// Verify OTP (phone or email)
router.post('/verify-otp', authLimiter, verifyOtpValidation, authController.verifyOtp);

// Resend OTP
router.post('/resend-otp', otpLimiter, resendOtpValidation, authController.resendOtp);

// Forgot password
router.post('/forgot-password', authLimiter, forgotPasswordValidation, authController.forgotPassword);

// Reset password
router.post('/reset-password', authLimiter, resetPasswordValidation, authController.resetPassword);

// Refresh session
router.post('/refresh-session', refreshSessionValidation, authController.refreshSession);

// ─── Protected Auth Routes ───────────────────────

// Logout (requires auth)
router.post('/logout', requireAuth, authController.logout);

// Get current user (requires auth)
router.get('/user', requireAuth, authController.getUser);

export default router;
