// ============================================
// Project Page Orchestrator
// Manages tabs, phases, and state
// ============================================

let project = null;
let projectId = null;
let phaseData = {
  client_intelligence: null,
  solution_context: null,
  scope_analysis: null
};

// ── Initialize ──
document.addEventListener('DOMContentLoaded', async () => {
  const session = await requireAuth();
  if (!session) return;

  // Get project ID from URL
  const params = new URLSearchParams(window.location.search);
  projectId = params.get('id');

  if (!projectId) {
    window.location.href = 'dashboard.html';
    return;
  }

  // Check API key
  if (!localStorage.getItem('aim_api_key')) {
    showToast('Please add your Claude API key in Settings first', 'error');
    setTimeout(() => window.location.href = 'dashboard.html', 2000);
    return;
  }

  await loadProject();
  await loadAllPhases();
  switchTab('client-intelligence');
});

// ── Load Project ──
async function loadProject() {
  const { data, error } = await supabaseClient
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error || !data) {
    window.location.href = 'dashboard.html';
    return;
  }

  project = data;

  // Update UI
  document.title = `${data.name} — AIM`;
  document.getElementById('project-name').textContent = data.name;
  document.getElementById('project-breadcrumb').textContent = data.name;
  document.getElementById('project-client').textContent = data.client_name || '';

  const statusBadgeEl = document.getElementById('project-status-badge');
  const statusMap = {
    draft: '<span class="badge badge-draft">Draft</span>',
    researching: '<span class="badge badge-researching">Researching</span>',
    planning: '<span class="badge badge-planning">Planning</span>',
    complete: '<span class="badge badge-complete">Complete</span>'
  };
  statusBadgeEl.innerHTML = statusMap[data.status] || statusMap.draft;

  // Client URL button
  if (data.client_url) {
    const urlBtn = document.getElementById('client-url-link');
    urlBtn.href = data.client_url;
    urlBtn.style.display = 'inline-flex';
  }

  // Pre-fill Phase 1 inputs
  if (data.client_name) {
    document.getElementById('input-client-name').value = data.client_name;
  }
  if (data.client_url) {
    document.getElementById('input-client-url').value = data.client_url;
  }
}

// ── Load All Saved Phases ──
async function loadAllPhases() {
  const { data, error } = await supabaseClient
    .from('phase_outputs')
    .select('phase, output')
    .eq('project_id', projectId);

  if (error || !data) return;

  data.forEach(row => {
    phaseData[row.phase] = row.output;
  });

  // Render any existing phase outputs
  if (phaseData.client_intelligence) {
    renderPhaseOutput('client-intelligence', PHASE_CLIENT_INTELLIGENCE.render(phaseData.client_intelligence));
    updateStepStatus(1, 'done');
  }

  if (phaseData.solution_context) {
    renderPhaseOutput('solution-context', PHASE_SOLUTION_CONTEXT.render(phaseData.solution_context));
    updateStepStatus(2, 'done');
    if (project.solution_name) {
      document.getElementById('input-solution-name').value = project.solution_name;
    }
  }

  if (phaseData.scope_analysis) {
    renderPhaseOutput('scope-analysis', PHASE_SCOPE_ANALYSIS.render(phaseData.scope_analysis));
    updateStepStatus(3, 'done');
  }

  if (phaseData.implementation_plan) {
    renderPhaseOutput('implementation-plan', PHASE_IMPLEMENTATION_PLAN.render(phaseData.implementation_plan));
    updateStepStatus(4, 'done');
  }

  if (phaseData.deliverables) {
    renderPhaseOutput('deliverables', PHASE_DELIVERABLES.render(phaseData.deliverables));
    updateStepStatus(5, 'done');
  }
}

// ── Tab Navigation ──
function switchTab(tabName) {
  // Hide all panels
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  // Show target
  document.getElementById(`tab-${tabName}`).classList.add('active');

  // Update step indicators
  const stepMap = {
    'client-intelligence': 1,
    'solution-context': 2,
    'scope-analysis': 3,
    'implementation-plan': 4,
    'deliverables': 5
  };

  document.querySelectorAll('.phase-step').forEach((step, i) => {
    step.classList.remove('active');
    const stepNum = i + 1;
    if (stepNum === stepMap[tabName]) {
      step.classList.add('active');
    }
  });
}

// ── Phase 1: Client Intelligence ──
async function runPhase1(regenerate = false) {
  const clientName = document.getElementById('input-client-name').value.trim();
  const clientUrl = document.getElementById('input-client-url').value.trim();

  if (!clientName) {
    showToast('Please enter a client name', 'error');
    return;
  }

  if (!regenerate && phaseData.client_intelligence) {
    // Already have data, just show it
    return;
  }

  // Show loading
  document.getElementById('form-client-intelligence').style.display = 'none';
  document.getElementById('loading-client-intelligence').style.display = 'block';
  document.getElementById('output-client-intelligence').innerHTML = '';
  document.getElementById('actions-client-intelligence').style.display = 'none';

  // Animate loading steps
  const steps = ['lstep-1', 'lstep-2', 'lstep-3', 'lstep-4', 'lstep-5'];
  let stepIndex = 0;
  const stepInterval = setInterval(() => {
    if (stepIndex > 0) {
      document.getElementById(steps[stepIndex - 1])?.classList.remove('active');
      document.getElementById(steps[stepIndex - 1])?.classList.add('done');
    }
    if (stepIndex < steps.length) {
      document.getElementById(steps[stepIndex])?.classList.add('active');
    }
    stepIndex++;
    if (stepIndex >= steps.length) clearInterval(stepInterval);
  }, 1800);

  try {
    const result = await PHASE_CLIENT_INTELLIGENCE.generate(projectId, clientName, clientUrl);
    phaseData.client_intelligence = result;

    clearInterval(stepInterval);
    document.getElementById('loading-client-intelligence').style.display = 'none';

    renderPhaseOutput('client-intelligence', PHASE_CLIENT_INTELLIGENCE.render(result));
    updateStepStatus(1, 'done');
    showToast('Client intelligence ready!', 'success');

  } catch (err) {
    clearInterval(stepInterval);
    document.getElementById('loading-client-intelligence').style.display = 'none';
    document.getElementById('form-client-intelligence').style.display = 'block';
    showToast(err.message || 'Failed to research client. Please try again.', 'error');
    console.error(err);
  }
}

// ── Phase 2: Solution Context ──
async function runPhase2(regenerate = false) {
  const solutionName = document.getElementById('input-solution-name').value.trim();
  const solutionDescription = document.getElementById('input-solution-description').value.trim();

  if (!solutionName || !solutionDescription) {
    showToast('Please fill in the solution name and description', 'error');
    return;
  }

  document.getElementById('form-solution-context').style.display = 'none';
  document.getElementById('loading-solution-context').style.display = 'block';
  document.getElementById('output-solution-context').innerHTML = '';
  document.getElementById('actions-solution-context').style.display = 'none';

  try {
    const result = await PHASE_SOLUTION_CONTEXT.generate(
      projectId, solutionName, solutionDescription, phaseData.client_intelligence
    );
    phaseData.solution_context = result;

    document.getElementById('loading-solution-context').style.display = 'none';
    renderPhaseOutput('solution-context', PHASE_SOLUTION_CONTEXT.render(result));
    updateStepStatus(2, 'done');
    showToast('Solution fit analysis ready!', 'success');

  } catch (err) {
    document.getElementById('loading-solution-context').style.display = 'none';
    document.getElementById('form-solution-context').style.display = 'block';
    showToast(err.message || 'Failed to analyze solution fit. Please try again.', 'error');
    console.error(err);
  }
}

// ── Phase 3: Scope Analysis ──
async function runPhase3(regenerate = false) {
  const sowText = document.getElementById('input-sow').value.trim();

  if (!sowText || sowText.length < 50) {
    showToast('Please paste your SOW or contract text (at least 50 characters)', 'error');
    return;
  }

  document.getElementById('form-scope-analysis').style.display = 'none';
  document.getElementById('loading-scope-analysis').style.display = 'block';
  document.getElementById('output-scope-analysis').innerHTML = '';
  document.getElementById('actions-scope-analysis').style.display = 'none';

  try {
    const result = await PHASE_SCOPE_ANALYSIS.generate(
      projectId, sowText, phaseData.client_intelligence, phaseData.solution_context
    );
    phaseData.scope_analysis = result;

    document.getElementById('loading-scope-analysis').style.display = 'none';
    renderPhaseOutput('scope-analysis', PHASE_SCOPE_ANALYSIS.render(result));
    updateStepStatus(3, 'done');
    showToast('Scope analysis ready!', 'success');

  } catch (err) {
    document.getElementById('loading-scope-analysis').style.display = 'none';
    document.getElementById('form-scope-analysis').style.display = 'block';
    showToast(err.message || 'Failed to analyze scope. Please try again.', 'error');
    console.error(err);
  }
}

// ── Phase 5: Deliverables ──
async function runPhase5(regenerate = false) {
  if (!regenerate && phaseData.deliverables) return;

  document.getElementById('form-deliverables').style.display = 'none';
  document.getElementById('loading-deliverables').style.display = 'block';
  document.getElementById('output-deliverables').innerHTML = '';
  document.getElementById('actions-deliverables').style.display = 'none';

  try {
    const result = await PHASE_DELIVERABLES.generate(
      projectId,
      phaseData.client_intelligence,
      phaseData.solution_context,
      phaseData.scope_analysis,
      phaseData.implementation_plan
    );
    phaseData.deliverables = result;

    document.getElementById('loading-deliverables').style.display = 'none';
    renderPhaseOutput('deliverables', PHASE_DELIVERABLES.render(result));
    updateStepStatus(5, 'done');
    showToast('Deliverables ready!', 'success');
  } catch (err) {
    document.getElementById('loading-deliverables').style.display = 'none';
    document.getElementById('form-deliverables').style.display = 'block';
    showToast(err.message || 'Failed to generate deliverables. Please try again.', 'error');
    console.error(err);
  }
}
async function runPhase4(regenerate = false) {
  if (!regenerate && phaseData.implementation_plan) return;

  document.getElementById('form-implementation-plan').style.display = 'none';
  document.getElementById('loading-implementation-plan').style.display = 'block';
  document.getElementById('output-implementation-plan').innerHTML = '';
  document.getElementById('actions-implementation-plan').style.display = 'none';

  try {
    const result = await PHASE_IMPLEMENTATION_PLAN.generate(
      projectId,
      phaseData.client_intelligence,
      phaseData.solution_context,
      phaseData.scope_analysis
    );
    phaseData.implementation_plan = result;

    document.getElementById('loading-implementation-plan').style.display = 'none';
    renderPhaseOutput('implementation-plan', PHASE_IMPLEMENTATION_PLAN.render(result));
    updateStepStatus(4, 'done');
    showToast('Implementation plan ready!', 'success');
  } catch (err) {
    document.getElementById('loading-implementation-plan').style.display = 'none';
    document.getElementById('form-implementation-plan').style.display = 'block';
    showToast(err.message || 'Failed to generate plan. Please try again.', 'error');
    console.error(err);
  }
}

// ── Phase 4 placeholder ──
function goToPhase4() {
  switchTab('implementation-plan');
}

// ── Render Output ──
function renderPhaseOutput(phase, html) {
  const outputEl = document.getElementById(`output-${phase}`);
  outputEl.innerHTML = html;

  const formEl = document.getElementById(`form-${phase}`);
  if (formEl) formEl.style.display = 'none';

  const actionsEl = document.getElementById(`actions-${phase}`);
  if (actionsEl) actionsEl.style.display = 'flex';
}

// ── Update Step Status ──
function updateStepStatus(stepNum, status) {
  const stepEl = document.getElementById(`step-${stepNum}`);
  if (!stepEl) return;
  stepEl.classList.remove('active', 'done', 'phase-step-locked');
  stepEl.classList.add(status);
}

// ── Toast ──
function showToast(message, type = '') {
  const toast = document.createElement('div');
  toast.className = `toast ${type ? 'toast-' + type : ''}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}
