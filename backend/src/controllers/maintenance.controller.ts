import { Response } from 'express';
import { maintenanceService } from '../services/maintenance.service';
import { ApiResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../types';

export const listRecords = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { asset_id, technician_id } = req.query;

  const records = await maintenanceService.listRecords({
    asset_id: asset_id as string,
    technician_id: technician_id as string,
  });

  ApiResponse.success(res, { records }, 'Maintenance records listed successfully');
});
