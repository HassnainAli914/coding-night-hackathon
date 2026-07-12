import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './index';

// ─── Supabase Admin Client (Service Role) ────────
// Used for server-side operations: user management, profile CRUD, etc.
// This client bypasses RLS — use only on the backend.

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!adminClient) {
    adminClient = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return adminClient;
}

// ─── Supabase Anon Client ────────────────────────
// Used for verifying user JWTs and performing user-scoped operations.

let anonClient: SupabaseClient | null = null;

export function getSupabaseAnon(): SupabaseClient {
  if (!anonClient) {
    anonClient = createClient(config.supabase.url, config.supabase.anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return anonClient;
}
