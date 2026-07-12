import { body, ValidationChain } from 'express-validator';

// ─── Create Profile Validation ───────────────────

export const createProfileValidation: ValidationChain[] = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .trim(),

  body('role')
    .isIn(['client', 'worker'])
    .withMessage('Role must be either "client" or "worker"'),

  body('phone')
    .optional()
    .matches(/^3[0-9]{9}$/)
    .withMessage('Please enter a valid Pakistani phone number (3XX XXXXXXX)'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('avatar_url')
    .optional()
    .isURL()
    .withMessage('Avatar URL must be a valid URL'),
];

// ─── Update Profile Validation ───────────────────

export const updateProfileValidation: ValidationChain[] = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .trim(),

  body('role')
    .optional()
    .isIn(['client', 'worker'])
    .withMessage('Role must be either "client" or "worker"'),

  body('phone')
    .optional()
    .matches(/^3[0-9]{9}$/)
    .withMessage('Please enter a valid Pakistani phone number (3XX XXXXXXX)'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('avatar_url')
    .optional()
    .isURL()
    .withMessage('Avatar URL must be a valid URL'),
];
