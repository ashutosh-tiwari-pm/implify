// ============================================
// Dashboard Logic
// ============================================

let currentUser = null;

// ── Initialize ──
document.addEventListener('DOMContentLoaded', async () => {
  const session = await requireAuth();
  if (!session) return;
  
  currentUser = session.user;
  
  // Update UI with user info
  document.getElementById('user-display').textContent = currentUser.email;
  document.getElementById('user-email').textContent = currentUser.email;
  
  // Set greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  document.getElementById('greeting').textContent = `${greeting} 👋`;
  
  // Check API key
  checkApiKey();
  
  // Load projects
  await loadProjects();
  
  // Load settings into modal
  loadSettings();
});

// ── API Key Check ──
function checkApiKey() {
  const apiKey = localStorage.getItem('aim_api_key');
  const banner = document.getElementById('api-key-banner');
  if (apiKey) {
    banner.classList.add('hidden');
  } else {
    banner.classList.remove('hidden');
  }
}

// ── Load Projects ──
async function loadProjects() {
  const { data: projects, error } = await supabaseClient
    .from('projects')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error loading projects:', error);
    return;
  }

  // Update stats
  document.getElementById('stat-total').textContent = projects.length;
  document.getElementById('stat-active').textContent = projects.filter(p => 
    p.status === 'researching' || p.status === 'planning'
  ).length;
  document.getElementById('stat-complete').textContent = projects.filter(p => 
    p.status === 'complete'
  ).length;

  // Render projects grid
  const grid = document.getElementById('projects-grid');
  
  if (projects.length === 0) {
    grid.innerHTML = `
      <div class="card new-project-card" onclick="openNewProject()" role="button" tabindex="0">
        <div class="new-project-icon">+</div>
        <h4>Create Your First Project</h4>
        <p class="text-secondary text-small">Start by entering a client name and website</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = projects.map(project => renderProjectCard(project)).join('') + `
    <div class="card new-project-card" onclick="openNewProject()" role="button" tabindex="0">
      <div class="new-project-icon">+</div>
      <h4>New Implementation</h4>
      <p class="text-secondary text-small">Add another project</p>
    </div>
  `;
}

function renderProjectCard(project) {
  const statusBadge = {
    draft: '<span class="badge badge-draft">Draft</span>',
    researching: '<span class="badge badge-researching">Researching</span>',
    planning: '<span class="badge badge-planning">Planning</span>',
    complete: '<span class="badge badge-complete">Complete</span>'
  };

  const date = new Date(project.updated_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  return `
    <div class="card card-hover project-card" onclick="openProject('${project.id}')">
      <div class="project-card-top">
        <div>
          <h4>${escapeHtml(project.name)}</h4>
          <div class="project-client">${escapeHtml(project.client_name || 'No client specified')}</div>
        </div>
        ${statusBadge[project.status] || statusBadge.draft}
      </div>
      ${project.client_url ? `<div class="text-small text-muted">${escapeHtml(project.client_url)}</div>` : ''}
      <div class="project-meta">
        <span>Updated ${date}</span>
        <span>·</span>
        <span>${getPhaseLabel(project.status)}</span>
      </div>
    </div>
  `;
}

function getPhaseLabel(status) {
  const labels = {
    draft: 'Not started',
    researching: 'Client research in progress',
    planning: 'Plan being generated',
    complete: 'Plan ready'
  };
  return labels[status] || 'Unknown';
}

// ── Create Project ──
async function createProject(e) {
  e.preventDefault();
  
  const btn = document.getElementById('btn-create');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Creating...';

  const name = document.getElementById('project-name').value.trim();
  const clientName = document.getElementById('client-name').value.trim();
  const clientUrl = document.getElementById('client-url').value.trim();

  try {
    const { data, error } = await supabaseClient
      .from('projects')
      .insert({
        user_id: currentUser.id,
        name,
        client_name: clientName,
        client_url: clientUrl || null,
        status: 'draft'
      })
      .select()
      .single();

    if (error) throw error;

    // Log the action
    await logAction('create_project', 'project', data.id, { name, client_name: clientName });

    // Navigate to project page
    window.location.href = `project.html?id=${data.id}`;
  } catch (err) {
    console.error('Error creating project:', err);
    alert('Failed to create project. Please try again.');
    btn.disabled = false;
    btn.textContent = 'Create & Start Research →';
  }
}

// ── Open Project ──
function openProject(id) {
  window.location.href = `project.html?id=${id}`;
}

// ── Settings ──
function openSettings() {
  loadSettings();
  document.getElementById('modal-settings').classList.add('open');
}

function loadSettings() {
  const apiKey = localStorage.getItem('aim_api_key') || '';
  const model = localStorage.getItem('aim_model') || 'claude-haiku-4-5-20251001';
  
  document.getElementById('api-key').value = apiKey;
  document.getElementById('ai-model').value = model;
}

function saveSettings(e) {
  e.preventDefault();
  
  const apiKey = document.getElementById('api-key').value.trim();
  const model = document.getElementById('ai-model').value;
  
  if (apiKey) {
    localStorage.setItem('aim_api_key', apiKey);
  } else {
    localStorage.removeItem('aim_api_key');
  }
  localStorage.setItem('aim_model', model);
  
  closeModal('modal-settings');
  checkApiKey();
  
  showToast('Settings saved successfully');
}

// ── Modal Helpers ──
function openNewProject() {
  document.getElementById('form-new-project').reset();
  document.getElementById('modal-new-project').classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('open');
    }
  });
});

// Close modals on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  }
});

// ── Utilities ──
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showToast(message, type = '') {
  const toast = document.createElement('div');
  toast.className = `toast ${type ? 'toast-' + type : ''}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
