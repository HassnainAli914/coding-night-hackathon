import { getSupabaseAdmin } from '../config/supabase';
import { logger } from '../utils/logger';

export class SearchService {
  async globalSearch(query: string) {
    const supabase = getSupabaseAdmin();
    const searchTerm = `%${query}%`;
    
    try {
      const [assetsRes, issuesRes, profilesRes] = await Promise.all([
        supabase
          .from('assets')
          .select('id, name, code, status')
          .or(`name.ilike.${searchTerm},code.ilike.${searchTerm}`)
          .limit(5),
        supabase
          .from('issues')
          .select('id, title, status, priority')
          .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .limit(5),
        supabase
          .from('profiles')
          .select('id, name, email, role')
          .or(`name.ilike.${searchTerm},email.ilike.${searchTerm}`)
          .limit(5)
      ]);

      return {
        assets: assetsRes.data || [],
        issues: issuesRes.data || [],
        profiles: profilesRes.data || []
      };
    } catch (error) {
      logger.error('SearchService error:', error);
      throw error;
    }
  }
}
