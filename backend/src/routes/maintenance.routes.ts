import { Router } from 'express';
import * as maintenanceController from '../controllers/maintenance.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Protected: list maintenance records
router.get('/', requireAuth, maintenanceController.listRecords);

export default router;
