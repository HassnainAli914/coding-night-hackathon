import { getSupabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class MaintenanceService {
  async listRecords(filters: {
    asset_id?: string;
    technician_id?: string;
  }) {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from('maintenance_records')
      .select('*, asset:assets!asset_id(id, name, code, location), technician:profiles!technician_id(id, name, email), issue:issues!issue_id(id, issue_number, title)');

    if (filters.asset_id) {
      query = query.eq('asset_id', filters.asset_id);
    }
    if (filters.technician_id) {
      query = query.eq('technician_id', filters.technician_id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      logger.error(`List maintenance records error: ${error.message}`);
      throw new AppError('Failed to load maintenance records', 500);
    }

    return data;
  }
}

export const maintenanceService = new MaintenanceService();
