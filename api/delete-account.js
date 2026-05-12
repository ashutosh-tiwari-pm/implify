// ============================================
// Vercel API: Delete Account
// Uses Supabase service role to delete user
// ============================================

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

    const token = authHeader.replace('Bearer ', '');

    // Verify the user's JWT using Supabase REST API
    const verifyRes = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': process.env.SUPABASE_ANON_KEY
      }
    });

    if (!verifyRes.ok) return res.status(401).json({ error: 'Invalid session' });

    const user = await verifyRes.json();
    const userId = user.id;

    // Delete the user using service role key (admin)
    const deleteRes = await fetch(`${process.env.SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    });

    if (!deleteRes.ok) {
      const err = await deleteRes.json();
      throw new Error(err.message || 'Failed to delete account');
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Delete account error:', err);
    return res.status(500).json({ error: err.message || 'Failed to delete account' });
  }
};
