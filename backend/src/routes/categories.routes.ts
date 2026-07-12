import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller';

const router = Router();

// GET /api/categories — any authenticated user can fetch categories
router.get('/', requireAuth, listCategories);

// POST /api/categories — admin only
router.post('/', requireAuth, requireRole(['admin']), createCategory);

// PUT /api/categories/:id — admin only
router.put('/:id', requireAuth, requireRole(['admin']), updateCategory);

// DELETE /api/categories/:id — admin only
router.delete('/:id', requireAuth, requireRole(['admin']), deleteCategory);

export default router;
