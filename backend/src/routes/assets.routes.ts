import { Router } from 'express';
import * as assetsController from '../controllers/assets.controller';
import { requireAuth, requireRole, optionalAuth } from '../middleware/auth';

const router = Router();

// Publicly accessible QR endpoint
router.get('/code/:code', optionalAuth, assetsController.getAssetByCode);

// Protected routes (Admin + Technician)
router.get('/', requireAuth, assetsController.listAssets);
router.get('/:id', requireAuth, assetsController.getAssetById);
router.get('/:id/history', requireAuth, assetsController.getAssetHistory);

// Admin-only management routes
router.post('/', requireAuth, requireRole(['admin']), assetsController.createAsset);
router.put('/:id', requireAuth, requireRole(['admin']), assetsController.updateAsset);
router.delete('/:id', requireAuth, requireRole(['admin']), assetsController.deleteAsset);

export default router;
