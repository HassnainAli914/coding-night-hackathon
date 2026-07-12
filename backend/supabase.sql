-- ═══════════════════════════════════════════════════════════
-- MaintainIQ & ServiceWala — Supabase Database Migration
-- Run this SQL in Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ─── Profiles Table (User Roles) ─────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT,
  phone           TEXT,
  name            TEXT NOT NULL,
  role            TEXT NOT NULL,
  default_role    TEXT,
  secondary_role  TEXT,
  avatar_url      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login      TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_role  ON public.profiles(role);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Setup basic policies (Drop first if exists to prevent duplicate errors)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ─── Assets Table ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.assets (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                   TEXT NOT NULL,
  code                   TEXT NOT NULL UNIQUE,
  category               TEXT NOT NULL,
  location               TEXT NOT NULL,
  condition              TEXT NOT NULL DEFAULT 'Good' CHECK (condition IN ('New', 'Good', 'Fair', 'Poor', 'Bad')),
  status                 TEXT NOT NULL DEFAULT 'Operational' CHECK (status IN ('Operational', 'Issue Reported', 'Under Inspection', 'Under Maintenance', 'Out of Service', 'Retired')),
  last_service_date      TIMESTAMPTZ,
  next_service_date      TIMESTAMPTZ,
  assigned_technician_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assets_code ON public.assets(code);
CREATE INDEX IF NOT EXISTS idx_assets_status ON public.assets(status);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Assets are viewable by authenticated users and public qr codes" ON public.assets;
CREATE POLICY "Assets are viewable by authenticated users and public qr codes" ON public.assets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage assets" ON public.assets;
CREATE POLICY "Admins can manage assets" ON public.assets FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- ─── Issues Table (Tickets) ──────────────────────────────

CREATE TABLE IF NOT EXISTS public.issues (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_number           TEXT NOT NULL UNIQUE,
  asset_id               UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  title                  TEXT NOT NULL,
  description            TEXT NOT NULL,
  priority               TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  category               TEXT NOT NULL,
  status                 TEXT NOT NULL DEFAULT 'Reported' CHECK (status IN ('Reported', 'Assigned', 'Inspection Started', 'Maintenance In Progress', 'Waiting for Parts', 'Resolved', 'Closed', 'Reopened')),
  reporter_name          TEXT NOT NULL DEFAULT 'Anonymous',
  reporter_email         TEXT,
  assigned_technician_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_issues_asset ON public.issues(asset_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON public.issues(status);

ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Issues can be viewed by anyone" ON public.issues;
CREATE POLICY "Issues can be viewed by anyone" ON public.issues FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can report an issue" ON public.issues;
CREATE POLICY "Anyone can report an issue" ON public.issues FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage issues" ON public.issues;
CREATE POLICY "Admins can manage issues" ON public.issues FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Technicians can update assigned issues" ON public.issues;
CREATE POLICY "Technicians can update assigned issues" ON public.issues FOR UPDATE USING (
  auth.uid() = assigned_technician_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- ─── Maintenance Records Table ───────────────────────────

CREATE TABLE IF NOT EXISTS public.maintenance_records (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id           UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  asset_id           UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  technician_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  inspection_notes   TEXT NOT NULL,
  work_performed     TEXT,
  parts_replaced     TEXT,
  cost               DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (cost >= 0),
  time_spent         INTEGER NOT NULL DEFAULT 0, -- in minutes
  evidence_url       TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Maintenance records viewable by everyone" ON public.maintenance_records;
CREATE POLICY "Maintenance records viewable by everyone" ON public.maintenance_records FOR SELECT USING (true);

DROP POLICY IF EXISTS "Technicians can insert records" ON public.maintenance_records;
CREATE POLICY "Technicians can insert records" ON public.maintenance_records FOR INSERT WITH CHECK (auth.uid() = technician_id);

-- ─── Asset History Table (Audit Log) ────────────────────

CREATE TABLE IF NOT EXISTS public.asset_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id    UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  actor_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  details     TEXT NOT NULL,
  issue_id    UUID REFERENCES public.issues(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.asset_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Asset history viewable by everyone" ON public.asset_history;
CREATE POLICY "Asset history viewable by everyone" ON public.asset_history FOR SELECT USING (true);

DROP POLICY IF EXISTS "Triggers and admins can write history" ON public.asset_history;
CREATE POLICY "Triggers and admins can write history" ON public.asset_history FOR INSERT WITH CHECK (true);

-- ─── Automated Profile Trigger ───────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  selected_role TEXT;
  sec_role TEXT;
BEGIN
  selected_role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
  IF selected_role = 'worker' THEN
    sec_role := 'client';
  ELSE
    sec_role := 'worker';
  END IF;

  INSERT INTO public.profiles (id, email, phone, name, role, default_role, secondary_role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    selected_role,
    selected_role,
    sec_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ─── Auto-History Tracking Triggers ─────────────────────

-- Trigger function for asset updates
CREATE OR REPLACE FUNCTION public.log_asset_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.asset_history (asset_id, action, details)
    VALUES (
      NEW.id,
      'STATUS_CHANGED',
      'Asset status updated from ' || OLD.status || ' to ' || NEW.status
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_asset_updated
  AFTER UPDATE ON public.assets
  FOR EACH ROW
  EXECUTE FUNCTION public.log_asset_changes();

-- Trigger function for new issue reports
CREATE OR REPLACE FUNCTION public.log_new_issue()
RETURNS TRIGGER AS $$
BEGIN
  -- Log history
  INSERT INTO public.asset_history (asset_id, action, details, issue_id)
  VALUES (
    NEW.asset_id,
    'ISSUE_REPORTED',
    'New issue reported: ' || NEW.title || ' (Priority: ' || NEW.priority || ')',
    NEW.id
  );
  
  -- Automatically update asset status
  UPDATE public.assets
  SET status = 'Issue Reported', updated_at = now()
  WHERE id = NEW.asset_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_issue_created
  AFTER INSERT ON public.issues
  FOR EACH ROW
  EXECUTE FUNCTION public.log_new_issue();
