// ============================================
// Supabase Client Configuration
// ============================================
// IMPORTANT: Replace these with your actual Supabase project credentials
// Get them from: https://supabase.com/dashboard → Project → Settings → API

const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Auth Helpers ──

async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

async function requireAuth() {
  const session = await getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  return session;
}

async function signOut() {
  await supabase.auth.signOut();
  window.location.href = 'index.html';
}

// ── Audit Logger ──

async function logAction(action, entityType, entityId, metadata = {}) {
  const user = await getUser();
  if (!user) return;
  
  await supabase.from('audit_log').insert({
    user_id: user.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata
  });
}
