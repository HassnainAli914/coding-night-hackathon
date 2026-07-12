import { getSupabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import type { CreateProfilePayload, UpdateProfilePayload, UserProfile } from '../types';

/**
 * User Service — handles profile CRUD operations against the Supabase `profiles` table.
 * Stored plain text roles (unencrypted).
 */
export class UserService {

  /**
   * Create a new user profile.
   * Called after successful authentication (signup or first phone OTP login).
   */
  async createProfile(userId: string, payload: CreateProfilePayload): Promise<UserProfile> {
    const supabase = getSupabaseAdmin();

    // Check if profile already exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (existing) {
      // Profile exists — update it instead
      return this.updateProfile(userId, payload);
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        name: payload.name,
        role: payload.role || 'client',
        phone: payload.phone || null,
        email: payload.email || null,
        avatar_url: payload.avatar_url || null,
        last_login: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error(`Create profile error: ${error.message}`);
      throw new AppError('Failed to create profile', 500);
    }

    // Also update user_metadata in Supabase Auth with the plain-text role
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        name: payload.name,
        role: payload.role || 'client',
      },
    });

    logger.info(`Profile created for user: ${userId}`);
    return data as UserProfile;
  }

  /**
   * Update an existing user profile.
   */
  async updateProfile(userId: string, payload: UpdateProfilePayload): Promise<UserProfile> {
    const supabase = getSupabaseAdmin();

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.role !== undefined) updateData.role = payload.role;
    if (payload.phone !== undefined) updateData.phone = payload.phone;
    if (payload.email !== undefined) updateData.email = payload.email;
    if (payload.avatar_url !== undefined) updateData.avatar_url = payload.avatar_url;

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      logger.error(`Update profile error: ${error.message}`);
      throw new AppError('Failed to update profile', 500);
    }

    if (!data) {
      throw new AppError('Profile not found', 404);
    }

    // Sync role and name to user_metadata
    if (payload.role || payload.name) {
      const metadataUpdate: Record<string, unknown> = {};
      if (payload.name) metadataUpdate.name = payload.name;
      if (payload.role) metadataUpdate.role = payload.role;

      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: metadataUpdate,
      });
    }

    logger.info(`Profile updated for user: ${userId}`);
    return data as UserProfile;
  }

  /**
   * Get a user's own profile.
   */
  async getProfile(userId: string): Promise<UserProfile> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new AppError('Profile not found', 404);
    }

    return data as UserProfile;
  }

  /**
   * Get a profile by user ID (public view).
   */
  async getProfileById(profileId: string): Promise<Partial<UserProfile>> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, role, avatar_url, created_at')
      .eq('id', profileId)
      .single();

    if (error || !data) {
      throw new AppError('Profile not found', 404);
    }

    return data as Partial<UserProfile>;
  }
  /**
   * List all users with technician/worker roles (for assignment dropdowns).
   */
  async listTechnicians(): Promise<Partial<UserProfile>[]> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, role, avatar_url')
      .in('role', ['technician', 'worker', 'admin'])
      .order('name', { ascending: true });

    if (error) {
      logger.error(`List technicians error: ${error.message}`);
      throw new AppError('Failed to list technicians', 500);
    }

    return (data || []) as Partial<UserProfile>[];
  }
}

// Export a singleton instance
export const userService = new UserService();
