import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Admin-only analytics
router.get('/summary', requireAuth, analyticsController.getSummary);

export default router;
