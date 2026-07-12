import { getSupabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class IssueService {
  async createIssue(payload: {
    asset_id: string;
    title: string;
    description: string;
    priority: string;
    category: string;
    reporter_name?: string;
    reporter_email?: string;
  }) {
    const supabase = getSupabaseAdmin();

    // Generate unique issue number: e.g. TICKET-173648
    const issueNum = `TICKET-${Math.floor(100000 + Math.random() * 900000)}`;

    const { data, error } = await supabase
      .from('issues')
      .insert({
        issue_number: issueNum,
        asset_id: payload.asset_id,
        title: payload.title,
        description: payload.description,
        priority: payload.priority || 'Medium',
        category: payload.category,
        reporter_name: payload.reporter_name || 'Anonymous',
        reporter_email: payload.reporter_email || null,
        status: 'Reported',
      })
      .select()
      .single();

    if (error) {
      logger.error(`Create issue error: ${error.message}`);
      throw new AppError('Failed to record issue ticket', 500);
    }

    return data;
  }

  async assignIssue(id: string, technicianId: string) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('issues')
      .update({
        assigned_technician_id: technicianId,
        status: 'Assigned',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error(`Assign issue error: ${error.message}`);
      throw new AppError('Failed to assign technician', 500);
    }

    // Log history
    await supabase.from('asset_history').insert({
      asset_id: data.asset_id,
      action: 'TECHNICIAN_ASSIGNED',
      details: `Issue assigned to technician (ID: ${technicianId})`,
      issue_id: id,
    });

    return data;
  }

  async startInspection(id: string, technicianId: string) {
    const supabase = getSupabaseAdmin();

    // Fetch the ticket first to verify it's assigned to this technician
    const { data: ticket, error: fetchErr } = await supabase
      .from('issues')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !ticket) {
      throw new AppError('Issue ticket not found', 404);
    }

    if (ticket.assigned_technician_id !== technicianId) {
      throw new AppError('Unauthorized. You can only start inspections on tickets assigned to you.', 403);
    }

    const { data, error } = await supabase
      .from('issues')
      .update({ status: 'Inspection Started' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error(`Start inspection error: ${error.message}`);
      throw new AppError('Failed to transition to inspection', 500);
    }

    // Update asset status
    await supabase
      .from('assets')
      .update({ status: 'Under Inspection' })
      .eq('id', ticket.asset_id);

    // Log history
    await supabase.from('asset_history').insert({
      asset_id: ticket.asset_id,
      actor_id: technicianId,
      action: 'INSPECTION_STARTED',
      details: 'Technician has started structural inspection',
      issue_id: id,
    });

    return data;
  }

  async logMaintenance(
    issueId: string,
    technicianId: string,
    payload: {
      inspection_notes: string;
      work_performed: string;
      parts_replaced?: string;
      cost: number;
      time_spent: number;
      next_service_date?: string;
    }
  ) {
    const supabase = getSupabaseAdmin();

    if (payload.cost < 0) {
      throw new AppError('Maintenance cost cannot be negative.', 400);
    }

    // Fetch ticket to verify technician
    const { data: ticket, error: ticketErr } = await supabase
      .from('issues')
      .select('*')
      .eq('id', issueId)
      .single();

    if (ticketErr || !ticket) {
      throw new AppError('Issue ticket not found', 404);
    }

    if (ticket.assigned_technician_id !== technicianId) {
      throw new AppError('Unauthorized. You can only resolve issues assigned to you.', 403);
    }

    // Create the maintenance record
    const { data: record, error: recordErr } = await supabase
      .from('maintenance_records')
      .insert({
        issue_id: issueId,
        asset_id: ticket.asset_id,
        technician_id: technicianId,
        inspection_notes: payload.inspection_notes,
        work_performed: payload.work_performed,
        parts_replaced: payload.parts_replaced || null,
        cost: payload.cost,
        time_spent: payload.time_spent,
      })
      .select()
      .single();

    if (recordErr) {
      logger.error(`Log maintenance error: ${recordErr.message}`);
      throw new AppError('Failed to record maintenance details', 500);
    }

    // Transition ticket to resolved
    await supabase
      .from('issues')
      .update({ status: 'Resolved' })
      .eq('id', issueId);

    // Transition asset back to operational and update service dates
    const assetUpdatePayload: any = {
      status: 'Operational',
      last_service_date: new Date().toISOString(),
    };

    if (payload.next_service_date) {
      const nextDate = new Date(payload.next_service_date);
      const today = new Date();
      if (nextDate < today) {
        throw new AppError('Next service date cannot be in the past.', 400);
      }
      assetUpdatePayload.next_service_date = payload.next_service_date;
    }

    await supabase
      .from('assets')
      .update(assetUpdatePayload)
      .eq('id', ticket.asset_id);

    // Log history
    await supabase.from('asset_history').insert({
      asset_id: ticket.asset_id,
      actor_id: technicianId,
      action: 'MAINTENANCE_COMPLETED',
      details: `Repair completed successfully. Cost: $${payload.cost}. Work: ${payload.work_performed}`,
      issue_id: issueId,
    });

    return record;
  }

  async listIssues(filters: {
    status?: string;
    priority?: string;
    asset_id?: string;
    assigned_technician_id?: string;
  }) {
    const supabase = getSupabaseAdmin();
    let query = supabase.from('issues').select('*, asset:assets(id, name, code), technician:profiles!assigned_technician_id(id, name, email)');

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters.asset_id) {
      query = query.eq('asset_id', filters.asset_id);
    }
    if (filters.assigned_technician_id) {
      query = query.eq('assigned_technician_id', filters.assigned_technician_id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      logger.error(`List issues error: ${error.message}`);
      throw new AppError('Failed to load issues', 500);
    }

    return data;
  }

  async updateIssue(id: string, payload: any) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('issues')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error(`Update issue error: ${error.message}`);
      throw new AppError('Failed to update issue details', 500);
    }

    return data;
  }

  async deleteIssue(id: string) {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('issues')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error(`Delete issue error: ${error.message}`);
      throw new AppError('Failed to remove issue ticket', 500);
    }

    return true;
  }
}

export const issueService = new IssueService();
