import { getSupabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class CategoryService {
  async listCategories() {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('asset_categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      logger.error(`List categories error: ${error.message}`);
      throw new AppError('Failed to load categories', 500);
    }
    return data;
  }

  async createCategory(payload: { name: string; description?: string; icon?: string }) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('asset_categories')
      .insert({
        name: payload.name,
        description: payload.description || null,
        icon: payload.icon || '📦',
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') throw new AppError('A category with that name already exists', 400);
      logger.error(`Create category error: ${error.message}`);
      throw new AppError('Failed to create category', 500);
    }
    return data;
  }

  async updateCategory(id: string, payload: { name?: string; description?: string; icon?: string }) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('asset_categories')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') throw new AppError('A category with that name already exists', 400);
      logger.error(`Update category error: ${error.message}`);
      throw new AppError('Failed to update category', 500);
    }
    return data;
  }

  async deleteCategory(id: string) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('asset_categories')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error(`Delete category error: ${error.message}`);
      throw new AppError('Failed to delete category', 500);
    }
    return true;
  }
}

export const categoryService = new CategoryService();
