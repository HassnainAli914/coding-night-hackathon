import { Response } from 'express';
import { categoryService } from '../services/category.service';
import { ApiResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../types';

export const listCategories = asyncHandler(async (_req: AuthRequest, res: Response): Promise<void> => {
  const categories = await categoryService.listCategories();
  ApiResponse.success(res, { categories }, 'Categories retrieved successfully');
});

export const createCategory = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, description, icon } = req.body;
  if (!name?.trim()) {
    ApiResponse.validationError(res, [{ field: 'name', message: 'Category name is required' }]);
    return;
  }
  const category = await categoryService.createCategory({ name: name.trim(), description, icon });
  ApiResponse.created(res, { category }, 'Category created successfully');
});

export const updateCategory = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const { name, description, icon } = req.body;
  const category = await categoryService.updateCategory(id, { name, description, icon });
  ApiResponse.success(res, { category }, 'Category updated successfully');
});

export const deleteCategory = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  await categoryService.deleteCategory(id);
  ApiResponse.success(res, null, 'Category deleted successfully');
});
