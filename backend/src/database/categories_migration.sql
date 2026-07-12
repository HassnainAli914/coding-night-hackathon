-- ─── Asset Categories Table ──────────────────────────────────
-- Run this in Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS public.asset_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  icon        TEXT DEFAULT '📦',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE TRIGGER asset_categories_updated_at
  BEFORE UPDATE ON public.asset_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_asset_categories_name ON public.asset_categories(name);

-- Enable Row Level Security
ALTER TABLE public.asset_categories ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read categories
CREATE POLICY "Anyone can view categories"
  ON public.asset_categories FOR SELECT
  USING (true);

-- Only service role (backend) can write
-- (Our backend uses service role key which bypasses RLS)

-- ─── Seed Predefined Categories ──────────────────────────────
INSERT INTO public.asset_categories (name, description, icon) VALUES
  ('HVAC', 'Heating, Ventilation & Air Conditioning systems', '❄️'),
  ('Electrical', 'Electrical panels, wiring, and power systems', '⚡'),
  ('Plumbing', 'Water supply, drainage, and plumbing fixtures', '🔧'),
  ('Fire Safety', 'Fire extinguishers, sprinklers, and alarms', '🔥'),
  ('Elevators & Lifts', 'Elevators, escalators, and lifting equipment', '🛗'),
  ('Generators', 'Backup power generators and UPS systems', '🔋'),
  ('Security & CCTV', 'Cameras, access control, and alarm systems', '📷'),
  ('Lighting', 'Interior and exterior lighting systems', '💡'),
  ('Network & IT', 'Servers, routers, switches, and IT infrastructure', '🖥️'),
  ('Pumps & Motors', 'Water pumps, sump pumps, and motors', '⚙️'),
  ('Boilers', 'Steam and hot water boilers', '🌡️'),
  ('Solar Panels', 'Solar energy panels and inverters', '☀️'),
  ('Vehicles', 'Company vehicles and transport equipment', '🚗'),
  ('Tools & Equipment', 'Hand tools, power tools, and equipment', '🔨'),
  ('Furniture & Fixtures', 'Furniture, fittings, and fixtures', '🪑'),
  ('Medical Equipment', 'Medical devices and healthcare equipment', '🏥'),
  ('Kitchen Appliances', 'Refrigerators, ovens, and food service equipment', '🍳'),
  ('Water Treatment', 'Water purification and treatment systems', '💧'),
  ('Compressors', 'Air and gas compressors', '🔩'),
  ('Communication', 'Telephones, intercoms, and PA systems', '📞')
ON CONFLICT (name) DO NOTHING;
