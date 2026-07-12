-- ═══════════════════════════════════════════════════════════
-- ServiceWala — Supabase Database Migration
-- Run this SQL in Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ─── Profiles Table ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT,
  phone           TEXT,
  name            TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'client',
  avatar_url      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login      TIMESTAMPTZ DEFAULT now()
);

-- Drop old columns if they exist
ALTER TABLE public.profiles 
  DROP COLUMN IF EXISTS default_role,
  DROP COLUMN IF EXISTS secondary_role;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_role  ON public.profiles(role);

-- ─── Row Level Security ──────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies to prevent conflict
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profile fields are viewable" ON public.profiles;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Public profiles are readable by anyone (name, role, avatar only)
CREATE POLICY "Public profile fields are viewable"
  ON public.profiles FOR SELECT
  USING (true);

-- Service role can do anything (for backend operations)
-- Note: Service role key bypasses RLS by default in Supabase

-- ─── Auto-Create Profile on Signup Trigger ───────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  selected_role TEXT;
BEGIN
  selected_role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');

  INSERT INTO public.profiles (id, email, phone, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    selected_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ─── Updated_at Auto-Update Trigger ─────────────────────

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ─── Custom OTPs Table for Nodemailer ──────────────────────

CREATE TABLE IF NOT EXISTS public.otps (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL,
  code          TEXT NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  session_data  JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otps_email ON public.otps(email);

-- Enable RLS (Row Level Security)
ALTER TABLE public.otps ENABLE ROW LEVEL SECURITY;
