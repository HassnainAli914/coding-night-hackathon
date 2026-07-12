import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { requireAuth, optionalAuth } from '../middleware/auth';
import {
  createProfileValidation,
  updateProfileValidation,
} from '../validators/user.validator';

const router = Router();

// ─── Protected User Routes ──────────────────────

// Create profile
router.post('/profile', requireAuth, createProfileValidation, userController.createProfile);

// Update profile
router.put('/profile', requireAuth, updateProfileValidation, userController.updateProfile);

// Get own profile
router.get('/profile', requireAuth, userController.getProfile);

// Get profile by ID (semi-public — optional auth)
router.get('/profile/:id', optionalAuth, userController.getProfileById);

// List technicians (for assignment dropdowns)
router.get('/technicians', requireAuth, userController.listTechnicians);

export default router;
