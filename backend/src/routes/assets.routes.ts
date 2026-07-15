import { Router } from 'express';
import * as assetsController from '../controllers/assets.controller';
import { requireAuth, requireRole, optionalAuth } from '../middleware/auth';

const router = Router();

// Publicly accessible endpoints
router.get('/code/:code', optionalAuth, assetsController.getAssetByCode);
router.get('/', optionalAuth, assetsController.listAssets);
router.get('/:id', optionalAuth, assetsController.getAssetById);

// Protected routes
router.get('/:id/history', requireAuth, assetsController.getAssetHistory);

// Admin-only management routes
router.post('/', requireAuth, requireRole(['admin']), assetsController.createAsset);
router.put('/:id', requireAuth, requireRole(['admin']), assetsController.updateAsset);
router.delete('/:id', requireAuth, requireRole(['admin']), assetsController.deleteAsset);

export default router;
