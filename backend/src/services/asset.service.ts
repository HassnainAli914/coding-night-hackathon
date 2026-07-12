import { getSupabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class AssetService {
  async createAsset(payload: {
    name: string;
    code: string;
    category: string;
    location: string;
    condition?: string;
    status?: string;
    next_service_date?: string;
    assigned_technician_id?: string;
  }) {
    const supabase = getSupabaseAdmin();

    // Check if code is already registered
    const { data: existing } = await supabase
      .from('assets')
      .select('id')
      .eq('code', payload.code)
      .maybeSingle();

    if (existing) {
      throw new AppError('Asset code already registered. Codes must be unique.', 400);
    }

    const { data, error } = await supabase
      .from('assets')
      .insert({
        name: payload.name,
        code: payload.code,
        category: payload.category,
        location: payload.location,
        condition: payload.condition || 'Good',
        status: payload.status || 'Operational',
        next_service_date: payload.next_service_date || null,
        assigned_technician_id: payload.assigned_technician_id || null,
      })
      .select()
      .single();

    if (error) {
      logger.error(`Create asset error: ${error.message}`);
      throw new AppError('Failed to register asset', 500);
    }

    return data;
  }

  async updateAsset(id: string, payload: any) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('assets')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error(`Update asset error: ${error.message}`);
      throw new AppError('Failed to update asset details', 500);
    }

    return data;
  }

  async getAssetById(id: string) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('assets')
      .select('*, assigned_technician:profiles!assigned_technician_id(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new AppError('Asset not found', 404);
    }

    return data;
  }

  async getAssetByCode(code: string) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('assets')
      .select('*, assigned_technician:profiles!assigned_technician_id(*)')
      .eq('code', code)
      .single();

    if (error || !data) {
      throw new AppError('Asset not found', 404);
    }

    return data;
  }

  async listAssets(filters: {
    status?: string;
    condition?: string;
    category?: string;
    search?: string;
  }) {
    const supabase = getSupabaseAdmin();
    let query = supabase.from('assets').select('*, assigned_technician:profiles!assigned_technician_id(id, name, email)');

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.condition) {
      query = query.eq('condition', filters.condition);
    }
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      logger.error(`List assets error: ${error.message}`);
      throw new AppError('Failed to load assets', 500);
    }

    return data;
  }

  async deleteAsset(id: string) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('assets').delete().eq('id', id);

    if (error) {
      logger.error(`Delete asset error: ${error.message}`);
      throw new AppError('Failed to remove asset', 500);
    }

    return true;
  }

  async getAssetHistory(assetId: string) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('asset_history')
      .select('*, actor:profiles!actor_id(id, name, role)')
      .eq('asset_id', assetId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error(`Fetch asset history error: ${error.message}`);
      throw new AppError('Failed to fetch asset history', 500);
    }

    return data;
  }
}

export const assetService = new AssetService();
