const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const searchTerm = '%a%';
  const [assetsRes, issuesRes, profilesRes] = await Promise.all([
    supabase.from('assets').select('id, name, code, status').or(`name.ilike.${searchTerm},code.ilike.${searchTerm}`).limit(5),
    supabase.from('issues').select('id, title, status, priority').or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`).limit(5),
    supabase.from('profiles').select('id, name, email, role').or(`name.ilike.${searchTerm},email.ilike.${searchTerm}`).limit(5)
  ]);

  console.log("Assets error:", assetsRes.error);
  console.log("Issues error:", issuesRes.error);
  console.log("Profiles error:", profilesRes.error);
  console.log("Assets data:", assetsRes.data?.length);
  console.log("Issues data:", issuesRes.data?.length);
  console.log("Profiles data:", profilesRes.data?.length);
}

test();
