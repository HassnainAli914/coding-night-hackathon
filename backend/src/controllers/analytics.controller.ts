import { Response } from 'express';
import { analyticsService } from '../services/analytics.service';
import { ApiResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../types';

export const getSummary = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const summary = await analyticsService.getSummary();
  ApiResponse.success(res, { summary }, 'Analytics summary retrieved successfully');
});
