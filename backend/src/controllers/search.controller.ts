import { Request, Response } from 'express';
import { SearchService } from '../services/search.service';
import { ApiResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';

const searchService = new SearchService();

export class SearchController {
  async search(req: Request, res: Response) {
    try {
      const query = req.query.q as string;
      if (!query || query.trim().length === 0) {
        ApiResponse.success(res, { assets: [], issues: [], profiles: [] }, 'Empty query');
        return;
      }

      const results = await searchService.globalSearch(query.trim());
      ApiResponse.success(res, results, 'Search successful');
    } catch (error) {
      logger.error('SearchController.search error:', error);
      ApiResponse.error(res, 'Failed to perform search', 500);
    }
  }
}
