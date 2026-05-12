// ============================================
// Profile Settings — JavaScript
// ============================================

let currentUser = null;
let profile = null;

// ── Initialize ──
document.addEventListener('DOMContentLoaded', async () => {
  const session = await requireAuth();
  if (!session) return;

  currentUser = session.user;

  await Promise.all([
    loadProfile(),
    loadAccountStats()
  ]);

  loadApiSettings();
  renderSidebarUser();
});

// ── Load Profile ──
async function loadProfile() {
  // Try to get existing profile
  const { data, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', currentUser.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error loading profile:', error);
  }

  // If no profile, create one
  if (!data) {
    const { data: newProfile } = await supabaseClient
      .from('profiles')
      .insert({ id: currentUser.id })
      .select()
      .single();
    profile = newProfile;
  } else {
    profile = data;
  }

  // Populate form
  if (profile) {
    document.getElementById('full-name').value = profile.full_name || '';
    document.getElementById('job-title').value = profile.job_title || '';
    document.getElementById('organisation').value = profile.organisation || '';
    document.getElementById('phone').value = profile.phone || '';
    document.getElementById('timezone').value = profile.timezone || 'Asia/Kolkata';
  }

  document.getElementById('account-email').value = currentUser.email;

  renderAvatar(profile?.avatar_url, profile?.full_name || currentUser.email);
}

// ── Load Account Stats ──
async function loadAccountStats() {
  const { data: projects } = await supabaseClient
    .from('projects')
    .select('id, status')
    .eq('user_id', currentUser.id);

  const total = projects?.length || 0;
  const complete = projects?.filter(p => p.status === 'complete').length || 0;

  document.getElementById('stat-projects').textContent = total;
  document.getElementById('stat-plans').textContent = complete;

  const createdAt = new Date(currentUser.created_at);
  document.getElementById('stat-member-since').textContent = createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

// ── Render Avatar ──
function renderAvatar(avatarUrl, name, containerId = 'profile-avatar') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (avatarUrl) {
    container.innerHTML = `<img src="${avatarUrl}" alt="Avatar" class="avatar-img">`;
  } else {
    const initials = (name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    container.innerHTML = `<div class="avatar-placeholder">${initials}</div>`;
  }
}

// ── Render Sidebar ──
function renderSidebarUser() {
  const name = profile?.full_name || currentUser.email.split('@')[0];
  const email = currentUser.email;

  document.getElementById('sidebar-name').textContent = name;
  document.getElementById('sidebar-email').textContent = email;

  renderAvatar(profile?.avatar_url, name, 'sidebar-avatar');
}

// ── Upload Avatar ──
async function uploadAvatar(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    showToast('Image must be under 2MB', 'error');
    return;
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${currentUser.id}/avatar.${fileExt}`;

  try {
    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseClient.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabaseClient.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Update profile
    await supabaseClient
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', currentUser.id);

    profile.avatar_url = publicUrl;
    renderAvatar(publicUrl, profile.full_name);
    renderSidebarUser();
    showToast('Profile photo updated!', 'success');
  } catch (err) {
    showToast('Failed to upload photo: ' + err.message, 'error');
  }
}

// ── Remove Avatar ──
async function removeAvatar() {
  try {
    await supabaseClient
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', currentUser.id);

    profile.avatar_url = null;
    renderAvatar(null, profile.full_name);
    renderSidebarUser();
    showToast('Profile photo removed', 'success');
  } catch (err) {
    showToast('Failed to remove photo', 'error');
  }
}

// ── Save Profile ──
async function saveProfile(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-save-profile');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Saving...';

  try {
    const updates = {
      full_name: document.getElementById('full-name').value.trim(),
      job_title: document.getElementById('job-title').value.trim(),
      organisation: document.getElementById('organisation').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      timezone: document.getElementById('timezone').value,
    };

    const { error } = await supabaseClient
      .from('profiles')
      .upsert({ id: currentUser.id, ...updates });

    if (error) throw error;

    profile = { ...profile, ...updates };
    renderSidebarUser();

    const banner = document.getElementById('profile-banner');
    banner.classList.add('show');
    setTimeout(() => banner.classList.remove('show'), 3000);

    showToast('Profile saved!', 'success');
  } catch (err) {
    showToast('Failed to save profile: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Profile';
  }
}

// ── Change Password ──
async function changePassword(e) {
  e.preventDefault();
  const newPass = document.getElementById('new-password').value;
  const confirmPass = document.getElementById('confirm-password').value;
  const errorEl = document.getElementById('password-error');
  const btn = document.getElementById('btn-change-password');

  errorEl.style.display = 'none';

  if (newPass !== confirmPass) {
    errorEl.textContent = 'Passwords do not match.';
    errorEl.style.display = 'block';
    return;
  }

  if (newPass.length < 8) {
    errorEl.textContent = 'Password must be at least 8 characters.';
    errorEl.style.display = 'block';
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Updating...';

  try {
    const { error } = await supabaseClient.auth.updateUser({ password: newPass });
    if (error) throw error;

    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    document.getElementById('strength-fill').style.width = '0%';
    document.getElementById('strength-label').textContent = 'Enter a password';

    const banner = document.getElementById('password-banner');
    banner.classList.add('show');
    setTimeout(() => banner.classList.remove('show'), 3000);

    showToast('Password updated!', 'success');
  } catch (err) {
    errorEl.textContent = err.message || 'Failed to update password.';
    errorEl.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Update Password';
  }
}

// ── Password Strength ──
function checkPasswordStrength(password) {
  const fill = document.getElementById('strength-fill');
  const label = document.getElementById('strength-label');

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { pct: '20%', color: '#DC2626', text: 'Very weak' },
    { pct: '40%', color: '#D97706', text: 'Weak' },
    { pct: '60%', color: '#F59E0B', text: 'Fair' },
    { pct: '80%', color: '#10B981', text: 'Strong' },
    { pct: '100%', color: '#059669', text: 'Very strong' },
  ];

  const level = levels[Math.max(0, score - 1)] || levels[0];
  fill.style.width = level.pct;
  fill.style.background = level.color;
  label.textContent = password ? level.text : 'Enter a password';
}

// ── API Settings ──
function loadApiSettings() {
  const key = localStorage.getItem('aim_api_key') || '';
  const model = localStorage.getItem('aim_model') || 'claude-haiku-4-5-20251001';

  document.getElementById('api-key-input').value = key;
  document.getElementById('model-select').value = model;

  updateApiStatus(key);
}

function updateApiStatus(key) {
  const statusEl = document.getElementById('api-status');
  if (key && key.startsWith('sk-ant-')) {
    statusEl.innerHTML = `<div class="consideration-item opportunity text-small">✅ Claude API key is configured and ready.</div>`;
  } else if (key) {
    statusEl.innerHTML = `<div class="consideration-item risk text-small">⚠️ API key format looks incorrect. Should start with sk-ant-</div>`;
  } else {
    statusEl.innerHTML = `<div class="consideration-item risk text-small">❌ No API key set. Add your Claude API key to use AI features.</div>`;
  }
}

function saveApiSettings(e) {
  e.preventDefault();
  const key = document.getElementById('api-key-input').value.trim();
  const model = document.getElementById('model-select').value;

  if (key) localStorage.setItem('aim_api_key', key);
  else localStorage.removeItem('aim_api_key');
  localStorage.setItem('aim_model', model);

  updateApiStatus(key);

  const banner = document.getElementById('api-banner');
  banner.classList.add('show');
  setTimeout(() => banner.classList.remove('show'), 3000);

  showToast('API settings saved!', 'success');
}

function clearApiKey() {
  localStorage.removeItem('aim_api_key');
  document.getElementById('api-key-input').value = '';
  updateApiStatus('');
  showToast('API key cleared', 'success');
}

function toggleApiKeyVisibility() {
  const input = document.getElementById('api-key-input');
  const btn = document.getElementById('btn-toggle-key');
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈 Hide';
  } else {
    input.type = 'password';
    btn.textContent = '👁️ Show';
  }
}

// ── Delete Account ──
function showDeleteConfirm() {
  document.getElementById('delete-confirm').classList.add('show');
  document.getElementById('delete-confirm-input').focus();
}

function hideDeleteConfirm() {
  document.getElementById('delete-confirm').classList.remove('show');
  document.getElementById('delete-confirm-input').value = '';
  document.getElementById('btn-confirm-delete').disabled = true;
}

function checkDeleteConfirm(value) {
  document.getElementById('btn-confirm-delete').disabled = value !== 'DELETE';
}

async function deleteAccount() {
  const btn = document.getElementById('btn-confirm-delete');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Deleting...';

  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    const token = session?.access_token;

    const response = await fetch('/api/delete-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || 'Failed to delete account');

    // Clear local storage
    localStorage.removeItem('aim_api_key');
    localStorage.removeItem('aim_model');

    // Sign out
    await supabaseClient.auth.signOut();

    // Redirect to landing
    showToast('Account deleted. Redirecting...', 'success');
    setTimeout(() => window.location.href = 'index.html', 2000);

  } catch (err) {
    showToast(err.message || 'Failed to delete account', 'error');
    btn.disabled = false;
    btn.textContent = 'Yes, Delete My Account';
  }
}

// ── Section Navigation ──
function showSection(sectionId, navItem) {
  // Hide all sections
  document.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.settings-nav-item').forEach(n => n.classList.remove('active'));

  // Show target
  document.getElementById(`section-${sectionId}`).classList.add('active');
  navItem.classList.add('active');
}

// ── Toast ──
function showToast(message, type = '') {
  const toast = document.createElement('div');
  toast.className = `toast ${type ? 'toast-' + type : ''}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}
