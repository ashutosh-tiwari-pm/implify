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

// ── DEMO DATA ──
const DEMO_PROJECT = {
  id: 'demo',
  client_name: 'TechFlow Solutions',
  client_url: 'https://techflowsolutions.com',
  product_name: 'Salesforce Sales Cloud',
  created_at: new Date().toISOString(),
  status: 'active'
};

const IS_DEMO = new URLSearchParams(location.search).get('demo') === 'true';

// ── Initialize ──
document.addEventListener('DOMContentLoaded', async () => {
  if (IS_DEMO) {
    initDemoMode();
    return;
  }

  const session = await requireAuth();
  if (!session) return;

  const params = new URLSearchParams(window.location.search);
  projectId = params.get('id');

  if (!projectId) {
    window.location.href = 'dashboard.html';
    return;
  }

  if (!localStorage.getItem('aim_api_key')) {
    showToast('Please add your Claude API key in Settings first', 'error');
    setTimeout(() => window.location.href = 'dashboard.html', 2000);
    return;
  }

  await loadProject();
  await loadAllPhases();
  switchTab('client-intelligence');
});

async function initDemoMode() {
  // Inject demo banner
  const banner = document.createElement('div');
  banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:linear-gradient(90deg,#1E40AF,#4338CA);color:#fff;padding:10px 24px;display:flex;align-items:center;justify-content:space-between;font-size:.875rem;font-family:system-ui,sans-serif';
  banner.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px">
      <span style="background:rgba(255,255,255,.2);padding:2px 10px;border-radius:99px;font-size:.75rem;font-weight:700;letter-spacing:.05em">DEMO</span>
      <span style="opacity:.9">Live demo — TechFlow Solutions · Salesforce Sales Cloud · $485K implementation</span>
    </div>
    <a href="login.html?mode=signup" style="background:#fff;color:#1E40AF;padding:6px 16px;border-radius:7px;font-weight:700;text-decoration:none;font-size:.8125rem">Create free account →</a>`;
  document.body.prepend(banner);
  document.body.style.paddingTop = '44px';

  // Set demo project data
  project = DEMO_PROJECT;
  projectId = 'demo';

  // Set fake API key for demo
  const existingKey = localStorage.getItem('aim_api_key');

  // Populate UI
  const clientEl = document.getElementById('project-client');
  if (clientEl) clientEl.textContent = DEMO_PROJECT.client_name;
  const inputEl = document.getElementById('input-client-name');
  if (inputEl) inputEl.value = DEMO_PROJECT.client_name;
  const urlEl = document.getElementById('input-client-url');
  if (urlEl) urlEl.value = DEMO_PROJECT.client_url;

  switchTab('client-intelligence');

  // If no API key, prompt for one with helpful message
  if (!existingKey) {
    setTimeout(() => {
      const key = prompt('To see AI-generated results, enter your Claude API key:\n(Free at console.anthropic.com — takes 2 min)\n\nOr press Cancel to browse the demo UI without running AI.');
      if (key && key.startsWith('sk-')) {
        localStorage.setItem('aim_api_key', key);
        showToast('API key saved — click any phase to generate results', 'success');
      }
    }, 800);
  }
}

// ── Load Project ──
async function loadProject() {
  if (IS_DEMO) {
    project = DEMO_PROJECT;
    const clientEl = document.getElementById('project-client');
    if (clientEl) clientEl.textContent = project.client_name;
    return;
  }

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

// ── Download Kickoff Deck (PPTX) — Client-side generation ──
async function downloadKickoffDeck() {
  const btn = document.getElementById('btn-download-deck');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Generating deck...';

  try {
    // Load pptxgenjs from CDN if not already loaded
    if (!window.PptxGenJS) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    const ci = phaseData.client_intelligence;
    const sc = phaseData.solution_context;
    const sa = phaseData.scope_analysis;
    const ip = phaseData.implementation_plan;

    const C = {
      navy: '1B2D5B', blue: '2563EB', light: 'CADCFC',
      white: 'FFFFFF', gray: 'F8FAFC', text: '1E293B',
      muted: '64748B', success: '059669', warning: 'D97706', danger: 'DC2626',
    };
    const phaseColors = ['2563EB', '7C3AED', '059669', 'D97706', 'DC2626', '0891B2'];
    const makeShadow = () => ({ type: 'outer', blur: 8, offset: 3, angle: 135, color: '000000', opacity: 0.12 });

    const pres = new window.PptxGenJS();
    pres.layout = 'LAYOUT_16x9';
    pres.author = sc?.solution_name || 'Vendor';
    pres.title = `${ci?.company_name || 'Client'} — Implementation Kickoff`;

    function sectionTitle(slide, title, subtitle) {
      slide.addShape('rect', { x: 0, y: 0, w: 0.08, h: 5.625, fill: { color: C.blue } });
      slide.addText(title, { x: 0.4, y: 0.3, w: 9.2, h: 0.65, fontSize: 26, bold: true, color: C.navy, fontFace: 'Calibri', margin: 0 });
      if (subtitle) slide.addText(subtitle, { x: 0.4, y: 0.92, w: 9.2, h: 0.35, fontSize: 12, color: C.muted, fontFace: 'Calibri', margin: 0 });
    }

    function addNavBar(slide, current) {
      const sects = ['Client', 'Solution', 'Scope', 'Phases', 'Timeline', 'Team', 'Risks', 'Next'];
      slide.addShape('rect', { x: 0, y: 5.25, w: 10, h: 0.375, fill: { color: C.navy } });
      sects.forEach((s, i) => {
        slide.addText(s, { x: 0.2 + i * 1.22, y: 5.27, w: 1.15, h: 0.33, fontSize: 6.5,
          color: s === current ? C.light : 'FFFFFF', bold: s === current, align: 'center', fontFace: 'Calibri', margin: 0 });
      });
    }

    // ── SLIDE 1: TITLE ──
    const s1 = pres.addSlide();
    s1.background = { color: C.navy };
    s1.addShape('rect', { x: 0, y: 0, w: 3.8, h: 5.625, fill: { color: C.blue } });
    s1.addShape('oval', { x: -0.8, y: 4.0, w: 3.0, h: 3.0, fill: { color: C.light, transparency: 80 }, line: { color: C.light, transparency: 80 } });
    s1.addText(sc?.solution_name || 'Implementation', { x: 0.2, y: 0.4, w: 3.4, h: 0.45, fontSize: 13, color: C.white, bold: true, fontFace: 'Calibri', align: 'center', margin: 0 });
    s1.addText('for', { x: 0.2, y: 0.9, w: 3.4, h: 0.3, fontSize: 11, color: C.light, fontFace: 'Calibri', align: 'center', margin: 0 });
    s1.addText(ci?.company_name || 'Client', { x: 0.2, y: 1.25, w: 3.4, h: 0.5, fontSize: 16, color: C.white, bold: true, fontFace: 'Calibri', align: 'center', margin: 0 });
    s1.addText('Implementation\nKickoff', { x: 4.1, y: 1.2, w: 5.5, h: 1.8, fontSize: 40, bold: true, color: C.white, fontFace: 'Calibri', margin: 0 });
    s1.addShape('rect', { x: 4.1, y: 3.1, w: 5.4, h: 0.03, fill: { color: C.light, transparency: 50 } });
    s1.addText(`${sa?.timeline?.contract_start || 'Q2 2026'}  ·  ${ci?.overview?.headquarters || 'Global'}`, { x: 4.1, y: 3.25, w: 5.4, h: 0.3, fontSize: 12, color: C.light, fontFace: 'Calibri', margin: 0 });
    s1.addText('CONFIDENTIAL', { x: 4.1, y: 5.1, w: 5.4, h: 0.3, fontSize: 8, color: C.light, fontFace: 'Calibri', align: 'right', margin: 0 });

    // ── SLIDE 2: CLIENT OVERVIEW ──
    const s2 = pres.addSlide();
    s2.background = { color: C.gray };
    sectionTitle(s2, `About ${ci?.company_name || 'Client'}`, 'Our understanding of your business');
    addNavBar(s2, 'Client');
    s2.addShape('rect', { x: 0.4, y: 1.45, w: 5.2, h: 3.6, fill: { color: C.white }, shadow: makeShadow() });
    s2.addText(ci?.overview?.description || '', { x: 0.6, y: 1.6, w: 4.9, h: 0.9, fontSize: 10, color: C.text, fontFace: 'Calibri' });
    s2.addShape('rect', { x: 0.6, y: 2.55, w: 4.8, h: 0.02, fill: { color: C.light } });
    [['Industry', ci?.market_position?.industry], ['HQ', ci?.overview?.headquarters], ['Size', ci?.overview?.size], ['Market', ci?.market_position?.market_segment], ['Compliance', (ci?.regulatory_environment?.compliance_complexity || '') + ' Complexity']].forEach(([l, v], i) => {
      s2.addText(l + ':', { x: 0.6, y: 2.65 + i * 0.46, w: 1.6, h: 0.38, fontSize: 9, color: C.muted, bold: true, fontFace: 'Calibri', margin: 0 });
      s2.addText(v || '—', { x: 2.2, y: 2.65 + i * 0.46, w: 3.2, h: 0.38, fontSize: 9, color: C.text, fontFace: 'Calibri', margin: 0 });
    });
    s2.addShape('rect', { x: 5.9, y: 1.45, w: 3.7, h: 3.6, fill: { color: C.navy } });
    s2.addText('Key Implementation Signals', { x: 6.1, y: 1.6, w: 3.3, h: 0.35, fontSize: 10, bold: true, color: C.white, fontFace: 'Calibri', margin: 0 });
    [`Digital Maturity: ${ci?.technology_signals?.digital_maturity || '—'}`, `Complexity: ${ci?.implementation_considerations?.complexity || '—'}`, ...(ci?.implementation_considerations?.key_opportunities || []).slice(0, 2), ...(ci?.implementation_considerations?.key_risks || []).slice(0, 1)].slice(0, 5).forEach((sig, i) => {
      s2.addText('→  ' + sig, { x: 6.1, y: 2.1 + i * 0.55, w: 3.3, h: 0.45, fontSize: 9, color: C.light, fontFace: 'Calibri', margin: 0 });
    });

    // ── SLIDE 3: SOLUTION FIT ──
    const s3 = pres.addSlide();
    s3.background = { color: C.gray };
    sectionTitle(s3, 'Solution Overview', `${sc?.solution_name || 'Solution'} — built for your needs`);
    addNavBar(s3, 'Solution');
    s3.addShape('rect', { x: 0.4, y: 1.45, w: 2.3, h: 3.6, fill: { color: C.navy } });
    s3.addText(sc?.fit_assessment?.fit_score || '8', { x: 0.4, y: 2.0, w: 2.3, h: 1.0, fontSize: 52, bold: true, color: C.white, align: 'center', fontFace: 'Calibri', margin: 0 });
    s3.addText('/10  Fit Score', { x: 0.4, y: 3.1, w: 2.3, h: 0.3, fontSize: 10, color: C.light, align: 'center', fontFace: 'Calibri', margin: 0 });
    s3.addText(sc?.fit_assessment?.overall_fit || 'Strong', { x: 0.4, y: 3.5, w: 2.3, h: 0.35, fontSize: 14, bold: true, color: C.light, align: 'center', fontFace: 'Calibri', margin: 0 });
    s3.addText('Key Value Drivers', { x: 3.0, y: 1.45, w: 6.6, h: 0.3, fontSize: 11, bold: true, color: C.navy, fontFace: 'Calibri', margin: 0 });
    (sc?.fit_assessment?.key_value_drivers || []).slice(0, 3).forEach((d, i) => {
      s3.addShape('rect', { x: 3.0, y: 1.85 + i * 0.8, w: 6.6, h: 0.68, fill: { color: C.white }, shadow: makeShadow() });
      s3.addShape('rect', { x: 3.0, y: 1.85 + i * 0.8, w: 0.06, h: 0.68, fill: { color: C.blue } });
      s3.addText(d, { x: 3.15, y: 1.9 + i * 0.8, w: 6.3, h: 0.55, fontSize: 10, color: C.text, fontFace: 'Calibri' });
    });

    // ── SLIDE 4: SCOPE ──
    const s4 = pres.addSlide();
    s4.background = { color: C.gray };
    sectionTitle(s4, 'Project Scope', sa?.project_overview?.summary || 'What we are delivering together');
    addNavBar(s4, 'Scope');
    s4.addShape('rect', { x: 0.4, y: 1.45, w: 4.4, h: 3.6, fill: { color: C.white }, shadow: makeShadow() });
    s4.addText('✅  In Scope', { x: 0.6, y: 1.6, w: 4.0, h: 0.3, fontSize: 11, bold: true, color: C.success, fontFace: 'Calibri', margin: 0 });
    (sa?.scope?.in_scope || []).slice(0, 7).forEach((item, i) => s4.addText('•  ' + item, { x: 0.6, y: 2.0 + i * 0.42, w: 4.0, h: 0.38, fontSize: 9, color: C.text, fontFace: 'Calibri', margin: 0 }));
    s4.addShape('rect', { x: 5.2, y: 1.45, w: 4.4, h: 3.6, fill: { color: C.white }, shadow: makeShadow() });
    s4.addText('❌  Out of Scope', { x: 5.4, y: 1.6, w: 4.0, h: 0.3, fontSize: 11, bold: true, color: C.danger, fontFace: 'Calibri', margin: 0 });
    (sa?.scope?.out_of_scope || []).slice(0, 7).forEach((item, i) => s4.addText('•  ' + item, { x: 5.4, y: 2.0 + i * 0.42, w: 4.0, h: 0.38, fontSize: 9, color: C.text, fontFace: 'Calibri', margin: 0 }));

    // ── SLIDE 5: PHASES ──
    const s5 = pres.addSlide();
    s5.background = { color: C.gray };
    sectionTitle(s5, 'Implementation Approach', `${ip?.project_summary?.methodology || 'Phased'} · ${ip?.project_summary?.total_duration || '12 weeks'}`);
    addNavBar(s5, 'Phases');
    const phases = (ip?.phases || []).slice(0, 5);
    const phW = phases.length > 0 ? (9.2 / phases.length) - 0.1 : 1.8;
    phases.forEach((phase, i) => {
      const x = 0.4 + i * (phW + 0.1);
      const col = phaseColors[i % phaseColors.length];
      s5.addShape('rect', { x, y: 1.45, w: phW, h: 0.5, fill: { color: col } });
      s5.addText(`Phase ${phase.phase_number}`, { x, y: 1.47, w: phW, h: 0.24, fontSize: 8, color: C.white, align: 'center', fontFace: 'Calibri', bold: true, margin: 0 });
      s5.addText(phase.duration || '', { x, y: 1.72, w: phW, h: 0.22, fontSize: 7.5, color: C.white, align: 'center', fontFace: 'Calibri', margin: 0 });
      s5.addShape('rect', { x, y: 1.95, w: phW, h: 3.1, fill: { color: C.white }, shadow: makeShadow() });
      s5.addText(phase.name, { x: x + 0.08, y: 2.05, w: phW - 0.16, h: 0.38, fontSize: 9, bold: true, color: col, fontFace: 'Calibri', margin: 0 });
      (phase.objectives || []).slice(0, 2).forEach((o, j) => s5.addText('› ' + o, { x: x + 0.08, y: 2.55 + j * 0.45, w: phW - 0.16, h: 0.4, fontSize: 8, color: C.text, fontFace: 'Calibri', margin: 0 }));
      (phase.deliverables || []).slice(0, 1).forEach(d => {
        s5.addShape('rect', { x: x + 0.08, y: 4.5, w: phW - 0.16, h: 0.38, fill: { color: col, transparency: 90 } });
        s5.addText('📄 ' + d, { x: x + 0.08, y: 4.5, w: phW - 0.16, h: 0.38, fontSize: 7.5, color: col, fontFace: 'Calibri', margin: 0 });
      });
    });

    // ── SLIDE 6: TIMELINE ──
    const s6 = pres.addSlide();
    s6.background = { color: C.gray };
    sectionTitle(s6, 'Project Timeline', `Go-Live: ${sa?.timeline?.go_live_date || 'TBD'}`);
    addNavBar(s6, 'Timeline');
    const totalWeeks = parseInt(ip?.project_summary?.total_duration) || 12;
    const trackW = 9.2;
    s6.addShape('rect', { x: 0.4, y: 1.75, w: trackW, h: 0.45, fill: { color: 'E2E8F0' } });
    phases.forEach((phase, i) => {
      const col = phaseColors[i % phaseColors.length];
      const barW = (1 / phases.length) * trackW - 0.05;
      s6.addShape('rect', { x: 0.4 + (i / phases.length) * trackW, y: 1.75, w: barW, h: 0.45, fill: { color: col } });
      s6.addText(phase.name?.split(' ')[0] || '', { x: 0.4 + (i / phases.length) * trackW, y: 1.75, w: barW, h: 0.45, fontSize: 7.5, bold: true, color: C.white, align: 'center', valign: 'middle', fontFace: 'Calibri', margin: 0 });
    });
    [{ name: 'Kickoff', week: 1, color: C.blue }, { name: 'Design Approved', week: Math.round(totalWeeks * 0.3), color: C.warning }, { name: 'UAT Complete', week: Math.round(totalWeeks * 0.8), color: '7C3AED' }, { name: '🎯 Go-Live', week: totalWeeks, color: C.success }].forEach((m, i) => {
      const x = 0.4 + i * 2.35;
      s6.addShape('oval', { x: x + 0.85, y: 2.3, w: 0.3, h: 0.3, fill: { color: m.color } });
      s6.addShape('rect', { x: x + 0.88, y: 2.6, w: 0.03, h: 0.3, fill: { color: m.color } });
      s6.addShape('rect', { x, y: 3.0, w: 2.2, h: 0.85, fill: { color: C.white }, shadow: makeShadow() });
      s6.addShape('rect', { x, y: 3.0, w: 2.2, h: 0.04, fill: { color: m.color } });
      s6.addText(`Week ${m.week}`, { x, y: 3.1, w: 2.2, h: 0.25, fontSize: 9, bold: true, color: m.color, align: 'center', fontFace: 'Calibri', margin: 0 });
      s6.addText(m.name, { x, y: 3.4, w: 2.2, h: 0.4, fontSize: 9, color: C.text, align: 'center', fontFace: 'Calibri', margin: 0 });
    });
    s6.addShape('rect', { x: 0.4, y: 4.2, w: 9.2, h: 0.75, fill: { color: C.success, transparency: 90 }, line: { color: C.success, width: 1 } });
    s6.addText(`🎯  Go-Live: ${sa?.timeline?.go_live_date || 'TBD'}   ·   Total: ${sa?.timeline?.total_duration || '12 weeks'}   ·   ${ip?.project_summary?.team_size || ''}`, { x: 0.4, y: 4.2, w: 9.2, h: 0.75, fontSize: 12, bold: true, color: C.success, align: 'center', valign: 'middle', fontFace: 'Calibri', margin: 0 });

    // ── SLIDE 7: TEAM ──
    const s7 = pres.addSlide();
    s7.background = { color: C.gray };
    sectionTitle(s7, 'Our Teams', 'Combined expertise driving your implementation');
    addNavBar(s7, 'Team');
    [[ci?.company_name || 'Client', C.navy, ip?.resource_plan?.client_team, 0.4], [sc?.solution_name || 'Vendor', C.blue, ip?.resource_plan?.vendor_team, 5.2]].forEach(([name, col, team, x]) => {
      s7.addShape('rect', { x, y: 1.45, w: 4.4, h: 3.6, fill: { color: C.white }, shadow: makeShadow() });
      s7.addShape('rect', { x, y: 1.45, w: 4.4, h: 0.42, fill: { color: col } });
      s7.addText(`${name} Team`, { x: x + 0.15, y: 1.52, w: 4.1, h: 0.3, fontSize: 11, bold: true, color: C.white, fontFace: 'Calibri', margin: 0 });
      (team || []).slice(0, 4).forEach((r, i) => {
        s7.addShape('rect', { x: x + 0.15, y: 1.97 + i * 0.73, w: 4.1, h: 0.62, fill: { color: C.gray } });
        s7.addText(r.role, { x: x + 0.25, y: 2.02 + i * 0.73, w: 4.0, h: 0.24, fontSize: 9.5, bold: true, color: col, fontFace: 'Calibri', margin: 0 });
        s7.addText((r.time_commitment || '') + ' · ' + (r.phases_involved || 'All'), { x: x + 0.25, y: 2.27 + i * 0.73, w: 4.0, h: 0.26, fontSize: 8, color: C.muted, fontFace: 'Calibri', margin: 0 });
      });
    });

    // ── SLIDE 8: RISKS ──
    const s8 = pres.addSlide();
    s8.background = { color: C.gray };
    sectionTitle(s8, 'Key Risks & Mitigations', 'Identified and planned for from day one');
    addNavBar(s8, 'Risks');
    const riskCols = { High: C.danger, Medium: C.warning, Low: C.success };
    (ip?.risk_register || []).slice(0, 4).forEach((risk, i) => {
      const col = riskCols[risk.risk_score] || C.muted;
      const x = (i % 2) === 0 ? 0.4 : 5.2;
      const y = i < 2 ? 1.45 : 3.2;
      s8.addShape('rect', { x, y, w: 4.4, h: 1.6, fill: { color: C.white }, shadow: makeShadow() });
      s8.addShape('rect', { x, y, w: 0.08, h: 1.6, fill: { color: col } });
      s8.addShape('rect', { x: x + 0.2, y: y + 0.1, w: 0.75, h: 0.28, fill: { color: col, transparency: 85 } });
      s8.addText(risk.risk_score, { x: x + 0.2, y: y + 0.1, w: 0.75, h: 0.28, fontSize: 8, bold: true, color: col, align: 'center', fontFace: 'Calibri', margin: 0 });
      s8.addText(risk.risk, { x: x + 1.05, y: y + 0.1, w: 3.2, h: 0.28, fontSize: 9, bold: true, color: C.text, fontFace: 'Calibri', margin: 0 });
      s8.addText('Mitigation: ' + (risk.mitigation || ''), { x: x + 0.2, y: y + 0.5, w: 4.0, h: 0.45, fontSize: 8.5, color: C.muted, fontFace: 'Calibri' });
      s8.addText('Contingency: ' + (risk.contingency || ''), { x: x + 0.2, y: y + 1.0, w: 4.0, h: 0.45, fontSize: 8, color: C.text, fontFace: 'Calibri', italics: true });
    });

    // ── SLIDE 9: NEXT STEPS ──
    const s9 = pres.addSlide();
    s9.background = { color: C.navy };
    s9.addShape('oval', { x: 7.0, y: 3.0, w: 4.5, h: 4.5, fill: { color: C.blue, transparency: 80 }, line: { color: C.blue, transparency: 80 } });
    s9.addShape('oval', { x: -1.2, y: -1.2, w: 3.5, h: 3.5, fill: { color: C.light, transparency: 85 }, line: { color: C.light, transparency: 85 } });
    s9.addText('Next Steps', { x: 0.6, y: 0.4, w: 8, h: 0.75, fontSize: 36, bold: true, color: C.white, fontFace: 'Calibri', margin: 0 });
    s9.addShape('rect', { x: 0.6, y: 1.25, w: 5.8, h: 0.03, fill: { color: C.light, transparency: 50 } });
    [{ who: 'Client', action: 'Confirm named contacts: Project Manager, Technical Lead, Security Lead' }, { who: 'Client', action: sa?.client_responsibilities?.[0] || 'Share network diagrams and system access details' }, { who: 'Vendor', action: 'Issue signed project charter and RACI matrix for review' }, { who: 'Both', action: 'Agree on weekly sync cadence, tool, and attendees' }].forEach((step, i) => {
      const col = step.who === 'Client' ? C.light : step.who === 'Vendor' ? '93C5FD' : 'A7F3D0';
      s9.addShape('rect', { x: 0.6, y: 1.45 + i * 0.85, w: 0.55, h: 0.55, fill: { color: col, transparency: 70 } });
      s9.addText(String(i + 1), { x: 0.6, y: 1.45 + i * 0.85, w: 0.55, h: 0.55, fontSize: 18, bold: true, color: C.white, align: 'center', valign: 'middle', fontFace: 'Calibri', margin: 0 });
      s9.addText(step.who, { x: 1.3, y: 1.45 + i * 0.85, w: 0.9, h: 0.25, fontSize: 8, color: col, bold: true, fontFace: 'Calibri', margin: 0 });
      s9.addText(step.action, { x: 1.3, y: 1.7 + i * 0.85, w: 7.5, h: 0.3, fontSize: 10, color: C.white, fontFace: 'Calibri', margin: 0 });
    });
    s9.addText('Thank you — let\'s build something great together.', { x: 0.6, y: 5.05, w: 8.5, h: 0.35, fontSize: 11, color: C.light, fontFace: 'Calibri', italics: true, margin: 0 });

    // ── Download ──
    const fileName = `${project?.client_name || 'Client'}_Implementation_Kickoff.pptx`;
    await pres.writeFile({ fileName });

    showToast('Kickoff deck downloaded!', 'success');
  } catch (err) {
    showToast(err.message || 'Failed to generate deck', 'error');
    console.error(err);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '⬇️ Download Kickoff Deck (.pptx)';
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
