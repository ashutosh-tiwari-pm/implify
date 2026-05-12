// ============================================
// Phase 5: Deliverables
// Kickoff Deck, Timeline, Go-Live Checklist,
// Status Report Template
// ============================================

const PHASE_DELIVERABLES = {

  SYSTEM_PROMPT_KICKOFF: `You are a senior implementation consultant. Generate a kickoff presentation outline.
Return ONLY valid JSON, no markdown. Max 8 slides, 3 bullet points per slide.

{
  "title": "presentation title",
  "subtitle": "subtitle",
  "presenter": "vendor name",
  "client": "client name",
  "date": "date",
  "slides": [
    {
      "slide_number": 1,
      "title": "slide title",
      "type": "title/agenda/content/team/timeline/next-steps",
      "bullets": ["point 1", "point 2", "point 3"],
      "speaker_notes": "brief note for presenter"
    }
  ]
}`,

  SYSTEM_PROMPT_TIMELINE: `You are a senior implementation consultant. Generate a project timeline.
Return ONLY valid JSON, no markdown. Max 6 phases, max 3 milestones per phase.

{
  "timeline_title": "string",
  "start_date": "string",
  "end_date": "string",
  "total_weeks": number,
  "phases": [
    {
      "phase": "Phase name",
      "start_week": 1,
      "end_week": 2,
      "color": "#2563EB",
      "milestones": [
        {
          "name": "milestone name",
          "week": 1,
          "owner": "Client/Vendor",
          "type": "deliverable/decision/go-live"
        }
      ]
    }
  ]
}`,

  SYSTEM_PROMPT_GOLIVE: `You are a senior implementation consultant. Generate a go-live readiness checklist.
Return ONLY valid JSON, no markdown. Max 5 categories, max 4 items per category.

{
  "checklist_title": "string",
  "categories": [
    {
      "name": "category name",
      "icon": "emoji",
      "owner": "Client/Vendor/Both",
      "items": [
        {
          "item": "checklist item",
          "priority": "Critical/High/Medium",
          "owner": "Client/Vendor",
          "evidence_required": "what proof is needed"
        }
      ]
    }
  ]
}`,

  SYSTEM_PROMPT_STATUS: `You are a senior implementation consultant. Generate a weekly status report template.
Return ONLY valid JSON, no markdown.

{
  "template_title": "string",
  "sections": [
    {
      "section": "section name",
      "fields": [
        {
          "label": "field label",
          "placeholder": "example content or instruction",
          "type": "text/rag/percentage/date"
        }
      ]
    }
  ],
  "rag_definitions": {
    "green": "On track definition",
    "amber": "At risk definition",
    "red": "Off track definition"
  }
}`,

  async generate(projectId, clientIntelligence, solutionContext, scopeAnalysis, implementationPlan) {
    const context = `
Client: ${clientIntelligence?.company_name || 'Client'}
Solution: ${solutionContext?.solution_name || 'Solution'}
Duration: ${scopeAnalysis?.timeline?.total_duration || '12 weeks'}
Go-live: ${scopeAnalysis?.timeline?.go_live_date || 'TBD'}
Phases: ${implementationPlan?.phases?.map(p => p.name).join(', ') || 'TBD'}`;

    const phaseContext = implementationPlan?.phases?.map(p =>
      `Phase ${p.phase_number}: ${p.name} (${p.duration})`
    ).join('\n') || '';

    // 4 parallel calls
    const [kickoffResult, timelineResult, goLiveResult, statusResult] = await Promise.all([

      AI_CLIENT.callJSON(this.SYSTEM_PROMPT_KICKOFF,
        `Generate kickoff deck for:\n${context}\n\nPhases:\n${phaseContext}`, 3000),

      AI_CLIENT.callJSON(this.SYSTEM_PROMPT_TIMELINE,
        `Generate timeline for:\n${context}\n\nPhases:\n${phaseContext}`, 2000),

      AI_CLIENT.callJSON(this.SYSTEM_PROMPT_GOLIVE,
        `Generate go-live checklist for:\n${context}`, 2000),

      AI_CLIENT.callJSON(this.SYSTEM_PROMPT_STATUS,
        `Generate status report template for:\n${context}`, 2000)
    ]);

    const result = {
      kickoff_deck: kickoffResult,
      timeline: timelineResult,
      golive_checklist: goLiveResult,
      status_template: statusResult
    };

    await this.save(projectId, result);
    return result;
  },

  async save(projectId, data) {
    const { error } = await supabaseClient
      .from('phase_outputs')
      .upsert({
        project_id: projectId,
        phase: 'deliverables',
        output: data,
        updated_at: new Date().toISOString()
      }, { onConflict: 'project_id,phase' });

    if (error) throw error;

    await supabaseClient
      .from('projects')
      .update({ status: 'complete', updated_at: new Date().toISOString() })
      .eq('id', projectId);
  },

  async load(projectId) {
    const { data, error } = await supabaseClient
      .from('phase_outputs')
      .select('output')
      .eq('project_id', projectId)
      .eq('phase', 'deliverables')
      .single();

    if (error) return null;
    return data?.output || null;
  },

  render(data) {
    const phaseColors = [
      '#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0891B2'
    ];

    const slideTypeIcon = {
      'title': '🎯', 'agenda': '📋', 'content': '📄',
      'team': '👥', 'timeline': '📅', 'next-steps': '🚀'
    };

    const priorityColor = {
      'Critical': { bg: 'var(--color-danger-light)', text: 'var(--color-danger)' },
      'High': { bg: 'var(--color-warning-light)', text: 'var(--color-warning)' },
      'Medium': { bg: 'var(--color-success-light)', text: 'var(--color-success)' }
    };

    const ragColor = { green: '#059669', amber: '#D97706', red: '#DC2626' };

    // Calculate timeline visual
    const totalWeeks = data.timeline?.total_weeks || 12;

    return `
      <div class="phase-output page-enter">

        <!-- Hero -->
        <div class="output-hero">
          <div class="output-hero-left">
            <h3>Project Deliverables</h3>
            <p class="text-secondary">All presentation-ready materials for your implementation — kickoff deck, timeline, go-live checklist, and status report template.</p>
            <div class="output-tags">
              <span class="output-tag">✅ Project Complete</span>
              <span class="output-tag">${data.kickoff_deck?.slides?.length || 0} Slide Deck</span>
              <span class="output-tag">${data.golive_checklist?.categories?.reduce((a,c) => a + c.items.length, 0) || 0} Checklist Items</span>
            </div>
          </div>
          <div class="output-hero-stats">
            <div class="output-stat">
              <div class="output-stat-value">${data.timeline?.total_weeks || 0}</div>
              <div class="output-stat-label">Total Weeks</div>
            </div>
            <div class="output-stat">
              <div class="output-stat-value">${data.timeline?.phases?.length || 0}</div>
              <div class="output-stat-label">Phases</div>
            </div>
            <div class="output-stat">
              <div class="output-stat-value">${data.golive_checklist?.categories?.length || 0}</div>
              <div class="output-stat-label">Checklist Areas</div>
            </div>
          </div>
        </div>

        <!-- Deliverable tabs -->
        <div class="plan-tabs">
          <button class="plan-tab active" onclick="switchDeliverableTab('kickoff', this)">🎯 Kickoff Deck</button>
          <button class="plan-tab" onclick="switchDeliverableTab('timeline', this)">📅 Timeline</button>
          <button class="plan-tab" onclick="switchDeliverableTab('golive', this)">✅ Go-Live Checklist</button>
          <button class="plan-tab" onclick="switchDeliverableTab('status', this)">📊 Status Template</button>
        </div>

        <!-- KICKOFF DECK -->
        <div class="deliverable-panel active" id="del-kickoff">
          <div class="deck-header">
            <div class="deck-title-block">
              <h3>${data.kickoff_deck?.title || 'Kickoff Presentation'}</h3>
              <p class="text-secondary">${data.kickoff_deck?.subtitle || ''}</p>
              <div class="deck-meta">
                <span class="text-small text-muted">Presented by ${data.kickoff_deck?.presenter || 'Vendor'}</span>
                <span class="text-muted">·</span>
                <span class="text-small text-muted">${data.kickoff_deck?.client || 'Client'}</span>
                <span class="text-muted">·</span>
                <span class="text-small text-muted">${data.kickoff_deck?.date || ''}</span>
              </div>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="printKickoffDeck()">🖨️ Print / Export</button>
          </div>

          <div class="slides-grid">
            ${(data.kickoff_deck?.slides || []).map(slide => `
              <div class="slide-card">
                <div class="slide-number">${slide.slide_number}</div>
                <div class="slide-type-icon">${slideTypeIcon[slide.type] || '📄'}</div>
                <div class="slide-title">${slide.title}</div>
                <ul class="slide-bullets">
                  ${(slide.bullets || []).map(b => `<li>${b}</li>`).join('')}
                </ul>
                ${slide.speaker_notes ? `
                  <div class="slide-notes">
                    <span class="slide-notes-label">🎙️ Notes:</span>
                    ${slide.speaker_notes}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- TIMELINE -->
        <div class="deliverable-panel" id="del-timeline">
          <div class="timeline-header">
            <h4>${data.timeline?.timeline_title || 'Project Timeline'}</h4>
            <div class="timeline-dates text-small text-muted">
              ${data.timeline?.start_date || ''} → ${data.timeline?.end_date || ''}
              · ${data.timeline?.total_weeks || 0} weeks total
            </div>
          </div>

          <!-- Gantt Chart -->
          <div class="gantt-wrapper">
            <!-- Week header -->
            <div class="gantt-header">
              <div class="gantt-label-col">Phase</div>
              <div class="gantt-chart-col">
                <div class="gantt-weeks">
                  ${Array.from({length: totalWeeks}, (_, i) => `
                    <div class="gantt-week-label">W${i+1}</div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Phase rows -->
            ${(data.timeline?.phases || []).map((phase, pi) => {
              const color = phaseColors[pi % phaseColors.length];
              const startPct = ((phase.start_week - 1) / totalWeeks) * 100;
              const widthPct = ((phase.end_week - phase.start_week + 1) / totalWeeks) * 100;

              return `
                <div class="gantt-row">
                  <div class="gantt-label-col">
                    <div class="gantt-phase-label" style="color:${color}">${phase.phase}</div>
                  </div>
                  <div class="gantt-chart-col">
                    <div class="gantt-track">
                      <div class="gantt-bar" style="
                        left:${startPct}%;
                        width:${widthPct}%;
                        background:${color};
                      ">
                        <span class="gantt-bar-label">${phase.phase}</span>
                      </div>
                      ${(phase.milestones || []).map(m => {
                        const mLeft = ((m.week - 1) / totalWeeks) * 100 + (widthPct / 2 / phase.milestones.length);
                        return `
                          <div class="gantt-milestone" style="left:calc(${((m.week - 1) / totalWeeks) * 100}% + 4px)" title="${m.name} (${m.owner})">
                            <div class="gantt-milestone-dot" style="background:${m.type === 'go-live' ? '#DC2626' : m.type === 'decision' ? '#D97706' : '#ffffff'}"></div>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}

          </div>

          <!-- Milestone Legend -->
          <div class="milestone-legend">
            <div class="milestone-legend-item">
              <span class="gantt-milestone-dot" style="background:#ffffff; border:2px solid #ccc; display:inline-block; width:12px; height:12px; border-radius:50%"></span>
              <span class="text-small text-secondary">Deliverable</span>
            </div>
            <div class="milestone-legend-item">
              <span style="background:#D97706; display:inline-block; width:12px; height:12px; border-radius:50%"></span>
              <span class="text-small text-secondary">Decision</span>
            </div>
            <div class="milestone-legend-item">
              <span style="background:#DC2626; display:inline-block; width:12px; height:12px; border-radius:50%"></span>
              <span class="text-small text-secondary">Go-Live</span>
            </div>
          </div>

          <!-- Milestones Table -->
          <div class="milestones-table-section">
            <div class="output-card-title" style="margin-bottom:var(--space-md)">Key Milestones</div>
            <table class="metrics-table">
              <thead>
                <tr><th>Milestone</th><th>Phase</th><th>Week</th><th>Owner</th><th>Type</th></tr>
              </thead>
              <tbody>
                ${(data.timeline?.phases || []).flatMap(phase =>
                  (phase.milestones || []).map(m => `
                    <tr>
                      <td><strong>${m.name}</strong></td>
                      <td class="text-small text-secondary">${phase.phase}</td>
                      <td class="text-small text-muted">Week ${m.week}</td>
                      <td><span class="badge ${m.owner === 'Client' ? 'badge-researching' : 'badge-planning'}">${m.owner}</span></td>
                      <td><span class="badge badge-draft">${m.type}</span></td>
                    </tr>
                  `)
                ).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- GO-LIVE CHECKLIST -->
        <div class="deliverable-panel" id="del-golive">
          <div class="output-card-title" style="margin-bottom:var(--space-lg)">${data.golive_checklist?.checklist_title || 'Go-Live Readiness Checklist'}</div>

          <div class="golive-progress-bar">
            <div class="golive-progress-label">
              <span class="text-small text-muted">Completion</span>
              <span class="text-small font-bold" id="golive-progress-text">0%</span>
            </div>
            <div class="golive-track">
              <div class="golive-fill" id="golive-fill" style="width:0%"></div>
            </div>
          </div>

          ${(data.golive_checklist?.categories || []).map((cat, ci) => `
            <div class="golive-category">
              <div class="golive-category-header">
                <span class="golive-category-icon">${cat.icon || '✅'}</span>
                <div class="golive-category-title">${cat.name}</div>
                <span class="badge badge-draft">${cat.owner}</span>
              </div>
              <div class="golive-items">
                ${(cat.items || []).map((item, ii) => `
                  <div class="golive-item">
                    <input type="checkbox" class="checklist-checkbox golive-check"
                      id="gl-${ci}-${ii}"
                      onchange="updateGoLiveProgress()">
                    <label for="gl-${ci}-${ii}" class="golive-item-content">
                      <div class="golive-item-text">${item.item}</div>
                      <div class="golive-item-meta">
                        <span class="badge" style="background:${priorityColor[item.priority]?.bg || 'var(--color-surface-hover)'}; color:${priorityColor[item.priority]?.text || 'var(--color-text-muted)'}">
                          ${item.priority}
                        </span>
                        <span class="badge badge-draft">${item.owner}</span>
                        <span class="text-small text-muted">Evidence: ${item.evidence_required}</span>
                      </div>
                    </label>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- STATUS TEMPLATE -->
        <div class="deliverable-panel" id="del-status">
          <div class="status-template-header">
            <h4>${data.status_template?.template_title || 'Weekly Status Report'}</h4>
            <button class="btn btn-secondary btn-sm" onclick="copyStatusTemplate()">📋 Copy Template</button>
          </div>

          <!-- RAG Legend -->
          <div class="rag-legend">
            ${Object.entries(data.status_template?.rag_definitions || {}).map(([color, def]) => `
              <div class="rag-item">
                <span class="rag-dot" style="background:${ragColor[color] || '#ccc'}"></span>
                <div>
                  <strong class="text-small" style="text-transform:capitalize">${color}</strong>
                  <div class="text-small text-secondary">${def}</div>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Template Sections -->
          ${(data.status_template?.sections || []).map(section => `
            <div class="status-section">
              <div class="status-section-title">${section.section}</div>
              <div class="status-fields">
                ${(section.fields || []).map(field => `
                  <div class="status-field">
                    <label class="form-label">${field.label}</label>
                    ${field.type === 'rag' ? `
                      <div class="rag-selector">
                        <button class="rag-btn" style="background:#DCFCE7; color:#059669">🟢 Green</button>
                        <button class="rag-btn" style="background:#FEF9C3; color:#D97706">🟡 Amber</button>
                        <button class="rag-btn" style="background:#FEE2E2; color:#DC2626">🔴 Red</button>
                      </div>
                    ` : field.type === 'percentage' ? `
                      <div class="percentage-field">
                        <input type="range" min="0" max="100" value="0" class="percentage-slider"
                          oninput="this.nextElementSibling.textContent = this.value + '%'">
                        <span class="percentage-value">0%</span>
                      </div>
                    ` : `
                      <div class="status-placeholder">${field.placeholder}</div>
                    `}
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>

      </div>
    `;
  }
};

// ── Deliverable tab switcher ──
function switchDeliverableTab(tabName, btn) {
  document.querySelectorAll('.deliverable-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.plan-tab').forEach(b => b.classList.remove('active'));
  document.getElementById(`del-${tabName}`).classList.add('active');
  btn.classList.add('active');
}

// ── Go-Live progress tracker ──
function updateGoLiveProgress() {
  const all = document.querySelectorAll('.golive-check');
  const checked = document.querySelectorAll('.golive-check:checked');
  const pct = all.length > 0 ? Math.round((checked.length / all.length) * 100) : 0;
  const fill = document.getElementById('golive-fill');
  const text = document.getElementById('golive-progress-text');
  if (fill) fill.style.width = pct + '%';
  if (text) text.textContent = pct + '%';
}

// ── Print kickoff deck ──
function printKickoffDeck() {
  window.print();
}

// ── Copy status template ──
function copyStatusTemplate() {
  const sections = document.querySelectorAll('.status-section');
  let text = 'WEEKLY STATUS REPORT\n\n';
  sections.forEach(s => {
    text += s.querySelector('.status-section-title').textContent + '\n';
    s.querySelectorAll('.status-field').forEach(f => {
      text += '• ' + f.querySelector('.form-label').textContent + ': ___________\n';
    });
    text += '\n';
  });
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('[onclick="copyStatusTemplate()"]');
    if (btn) { btn.textContent = '✅ Copied!'; setTimeout(() => btn.textContent = '📋 Copy Template', 2000); }
  });
}
