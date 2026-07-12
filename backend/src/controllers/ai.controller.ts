import { Response } from 'express';
import { aiService } from '../services/ai.service';
import { ApiResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../types';

export const triageComplaint = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { complaint, asset_context } = req.body;

  if (!complaint) {
    ApiResponse.validationError(res, [{ field: 'complaint', message: 'Complaint text is required' }]);
    return;
  }

  const triage = await aiService.triageComplaint(complaint, asset_context);
  ApiResponse.success(res, { triage }, 'AI issue triage generated successfully');
});
