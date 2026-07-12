import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import assetsRoutes from './assets.routes';
import issuesRoutes from './issues.routes';
import aiRoutes from './ai.routes';
import categoriesRoutes from './categories.routes';
import analyticsRoutes from './analytics.routes';
import maintenanceRoutes from './maintenance.routes';

const router = Router();

// ─── Mount Route Modules ─────────────────────────

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/assets', assetsRoutes);
router.use('/issues', issuesRoutes);
router.use('/ai', aiRoutes);
router.use('/categories', categoriesRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/maintenance', maintenanceRoutes);

export default router;
