import { Response } from 'express';
import { assetService } from '../services/asset.service';
import { ApiResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../types';

export const createAsset = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, code, category, location, condition, status, next_service_date, assigned_technician_id } = req.body;

  const asset = await assetService.createAsset({
    name,
    code,
    category,
    location,
    condition,
    status,
    next_service_date,
    assigned_technician_id,
  });

  ApiResponse.created(res, { asset }, 'Asset registered successfully');
});

export const updateAsset = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const asset = await assetService.updateAsset(id, req.body);
  ApiResponse.success(res, { asset }, 'Asset details updated successfully');
});

export const getAssetById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const asset = await assetService.getAssetById(id);
  ApiResponse.success(res, { asset }, 'Asset retrieved successfully');
});

export const getAssetByCode = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const code = req.params.code as string;
  const asset = await assetService.getAssetByCode(code);
  ApiResponse.success(res, { asset }, 'Asset resolved by code successfully');
});

export const listAssets = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, condition, category, search } = req.query;
  const assets = await assetService.listAssets({
    status: status as string,
    condition: condition as string,
    category: category as string,
    search: search as string,
  });
  ApiResponse.success(res, { assets }, 'Assets listed successfully');
});

export const deleteAsset = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  await assetService.deleteAsset(id);
  ApiResponse.success(res, null, 'Asset deleted successfully');
});

export const getAssetHistory = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const history = await assetService.getAssetHistory(id);
  ApiResponse.success(res, { history }, 'Asset history timeline retrieved successfully');
});
