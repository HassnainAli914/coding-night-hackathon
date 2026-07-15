import { Response } from 'express';
import { aiService } from '../services/ai.service';
import { ApiResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../types';

export const triageComplaint = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { complaint, asset_context, title, description } = req.body;

  // Support both direct complaint text and the {title, description} shape sent by the public issue form
  const complaintText = complaint || (description ? `${title ? title + ': ' : ''}${description}` : null);

  if (!complaintText) {
    ApiResponse.validationError(res, [{ field: 'complaint', message: 'Complaint text is required' }]);
    return;
  }

  const triage = await aiService.triageComplaint(complaintText, asset_context);

  // Map to the shape the public issue form expects
  const analysis = {
    title: triage.title,
    category: triage.category,
    priority: triage.priority,
    description: description || complaint,
    possible_solution: [triage.initial_checks, triage.warning].filter(Boolean).join(' '),
  };

  ApiResponse.success(res, { triage, analysis }, 'AI issue triage generated successfully');
});
