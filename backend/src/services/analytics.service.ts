import { getSupabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class AnalyticsService {
  async getSummary() {
    const supabase = getSupabaseAdmin();

    // ─── Total Assets + Status Breakdown ─────────────────
    const { data: assets, error: assetsErr } = await supabase
      .from('assets')
      .select('id, status, condition');

    if (assetsErr) {
      logger.error(`Analytics assets error: ${assetsErr.message}`);
      throw new AppError('Failed to fetch asset analytics', 500);
    }

    const totalAssets = assets?.length || 0;
    const assetStatusBreakdown: Record<string, number> = {};
    const assetConditionBreakdown: Record<string, number> = {};
    (assets || []).forEach((a: any) => {
      assetStatusBreakdown[a.status] = (assetStatusBreakdown[a.status] || 0) + 1;
      assetConditionBreakdown[a.condition] = (assetConditionBreakdown[a.condition] || 0) + 1;
    });

    // ─── Issues Stats ────────────────────────────────────
    const { data: issues, error: issuesErr } = await supabase
      .from('issues')
      .select('id, status, priority, assigned_technician_id, created_at');

    if (issuesErr) {
      logger.error(`Analytics issues error: ${issuesErr.message}`);
      throw new AppError('Failed to fetch issue analytics', 500);
    }

    const totalIssues = issues?.length || 0;
    const issueStatusBreakdown: Record<string, number> = {};
    const issuePriorityBreakdown: Record<string, number> = {};
    let unassignedIssues = 0;
    let openIssues = 0;

    (issues || []).forEach((i: any) => {
      issueStatusBreakdown[i.status] = (issueStatusBreakdown[i.status] || 0) + 1;
      issuePriorityBreakdown[i.priority] = (issuePriorityBreakdown[i.priority] || 0) + 1;

      if (!i.assigned_technician_id && i.status !== 'Resolved' && i.status !== 'Closed') {
        unassignedIssues++;
      }
      if (i.status !== 'Resolved' && i.status !== 'Closed') {
        openIssues++;
      }
    });

    // ─── Maintenance Cost Total ──────────────────────────
    const { data: maintenance, error: maintErr } = await supabase
      .from('maintenance_records')
      .select('cost, time_spent');

    if (maintErr) {
      logger.error(`Analytics maintenance error: ${maintErr.message}`);
      throw new AppError('Failed to fetch maintenance analytics', 500);
    }

    let totalMaintenanceCost = 0;
    let totalTimeSpent = 0;
    (maintenance || []).forEach((m: any) => {
      totalMaintenanceCost += Number(m.cost) || 0;
      totalTimeSpent += Number(m.time_spent) || 0;
    });

    // ─── Recent Activity ────────────────────────────────
    const { data: recentActivity, error: activityErr } = await supabase
      .from('asset_history')
      .select('*, actor:profiles!actor_id(id, name, role), asset:assets!asset_id(id, name, code)')
      .order('created_at', { ascending: false })
      .limit(15);

    if (activityErr) {
      logger.error(`Analytics activity error: ${activityErr.message}`);
    }

    return {
      totalAssets,
      assetStatusBreakdown,
      assetConditionBreakdown,
      totalIssues,
      openIssues,
      unassignedIssues,
      issueStatusBreakdown,
      issuePriorityBreakdown,
      totalMaintenanceCost,
      totalTimeSpent,
      totalMaintenanceRecords: maintenance?.length || 0,
      recentActivity: recentActivity || [],
    };
  }
}

export const analyticsService = new AnalyticsService();
