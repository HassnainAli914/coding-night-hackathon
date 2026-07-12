import { body, ValidationChain } from 'express-validator';

/**
 * Pakistani phone number regex:
 * Accepts: 3XXXXXXXXX or 03XXXXXXXXX (with optional leading 0)
 * The +92 prefix is added by the service layer.
 */
const PK_PHONE_REGEX = /^0?3[0-9]{9}$/;

// ─── Signup Validation ───────────────────────────

export const signupValidation: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),

  body('name')
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .trim(),

  body('phone')
    .optional()
    .matches(PK_PHONE_REGEX)
    .withMessage('Please enter a valid Pakistani phone number (3XX XXXXXXX)'),

  body('role')
    .optional()
    .isIn(['admin', 'worker', 'client', 'student', 'teacher'])
    .withMessage('Invalid role selected'),
];

// ─── Email Login Validation ──────────────────────

export const loginValidation: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// ─── Phone Login Validation ──────────────────────

export const phoneLoginValidation: ValidationChain[] = [
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(PK_PHONE_REGEX)
    .withMessage('Please enter a valid Pakistani phone number (3XX XXXXXXX)'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// ─── OTP Verification Validation ─────────────────

export const verifyOtpValidation: ValidationChain[] = [
  body('token')
    .notEmpty()
    .withMessage('OTP code is required')
    .isLength({ min: 4, max: 6 })
    .withMessage('OTP must be 4-6 digits'),

  body('type')
    .isIn(['sms', 'email', 'phone_change', 'email_change'])
    .withMessage('Invalid OTP type'),

  body('phone')
    .optional()
    .matches(PK_PHONE_REGEX)
    .withMessage('Please enter a valid Pakistani phone number'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email address'),
];

// ─── Resend OTP Validation ───────────────────────

export const resendOtpValidation: ValidationChain[] = [
  body('type')
    .isIn(['sms', 'email'])
    .withMessage('Type must be either "sms" or "email"'),

  body('phone')
    .optional()
    .matches(PK_PHONE_REGEX)
    .withMessage('Please enter a valid Pakistani phone number'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email address'),
];

// ─── Forgot Password Validation ──────────────────

export const forgotPasswordValidation: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
];

// ─── Reset Password Validation ───────────────────

export const resetPasswordValidation: ValidationChain[] = [
  body('access_token')
    .notEmpty()
    .withMessage('Access token is required'),

  body('new_password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];

// ─── Refresh Session Validation ──────────────────

export const refreshSessionValidation: ValidationChain[] = [
  body('refresh_token')
    .notEmpty()
    .withMessage('Refresh token is required'),
];
