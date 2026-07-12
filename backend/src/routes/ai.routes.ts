import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// Publicly accessible triage endpoint for issue reporting flow
router.post('/triage', optionalAuth, aiController.triageComplaint);

export default router;
