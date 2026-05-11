// ============================================
// Supabase Client Configuration
// ============================================
// IMPORTANT: Replace these with your actual Supabase project credentials
// Get them from: https://supabase.com/dashboard → Project → Settings → API

const SUPABASE_URL = 'https://adsjiigutipfrnvdgrwx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-I7rBj-UJCVkwivJAnGy7g_5LsvFMvk';

// ── Initialize client only once (prevents duplicate declaration errors) ──
if (!window._supabaseClient) {
  window._supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
}

const supabaseClient = window._supabaseClient;

// ── Auth Helpers ──

async function getUser() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  return user;
}

async function getSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
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
  await supabaseClient.auth.signOut();
  window.location.href = 'index.html';
}

// ── Audit Logger ──

async function logAction(action, entityType, entityId, metadata = {}) {
  const user = await getUser();
  if (!user) return;

  await supabaseClient.from('audit_log').insert({
    user_id: user.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata
  });
}
