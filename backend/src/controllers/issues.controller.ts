import { Response } from 'express';
import { issueService } from '../services/issue.service';
import { ApiResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../types';

export const createIssue = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { asset_id, title, description, priority, category, reporter_name, reporter_email } = req.body;

  const ticket = await issueService.createIssue({
    asset_id,
    title,
    description,
    priority,
    category,
    reporter_name,
    reporter_email,
  });

  ApiResponse.created(res, { ticket }, 'Issue reported successfully');
});

export const assignIssue = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const { assigned_technician_id } = req.body;

  const ticket = await issueService.assignIssue(id, assigned_technician_id);
  ApiResponse.success(res, { ticket }, 'Technician assigned successfully');
});

export const startInspection = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  if (!req.user) {
    ApiResponse.unauthorized(res);
    return;
  }

  const ticket = await issueService.startInspection(id, req.user.id);
  ApiResponse.success(res, { ticket }, 'Inspection phase started successfully');
});

export const logMaintenance = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string; // issueId
  if (!req.user) {
    ApiResponse.unauthorized(res);
    return;
  }

  const { inspection_notes, work_performed, parts_replaced, cost, time_spent, next_service_date } = req.body;

  const record = await issueService.logMaintenance(id, req.user.id, {
    inspection_notes,
    work_performed,
    parts_replaced,
    cost: Number(cost),
    time_spent: Number(time_spent),
    next_service_date,
  });

  ApiResponse.created(res, { record }, 'Maintenance log saved and issue resolved');
});

export const listIssues = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, priority, asset_id, assigned_technician_id } = req.query;

  const issues = await issueService.listIssues({
    status: status as string,
    priority: priority as string,
    asset_id: asset_id as string,
    assigned_technician_id: assigned_technician_id as string,
  });

  ApiResponse.success(res, { issues }, 'Issues listed successfully');
});

export const updateIssue = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const ticket = await issueService.updateIssue(id, req.body);
  ApiResponse.success(res, { ticket }, 'Issue details updated successfully');
});

export const deleteIssue = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  await issueService.deleteIssue(id);
  ApiResponse.success(res, null, 'Issue deleted successfully');
});
