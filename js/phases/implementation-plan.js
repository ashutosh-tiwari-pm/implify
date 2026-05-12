// ============================================
// Phase 4: Implementation Plan
// Generates full plan using all previous phases
// ============================================

const PHASE_IMPLEMENTATION_PLAN = {

  SYSTEM_PROMPT: `You are a senior implementation consultant with 15+ years delivering enterprise B2B SaaS implementations globally.

Using the client intelligence, solution fit analysis, and scope provided, generate a complete implementation plan.

Return ONLY valid JSON. No markdown, no explanation. Be concise — max 5 items per array.

Return this exact structure:
{
  "project_summary": {
    "project_name": "string",
    "client": "string",
    "solution": "string",
    "total_duration": "X weeks",
    "go_live_date": "string",
    "methodology": "Phased/Agile/Waterfall",
    "team_size": "X people client + Y people vendor"
  },
  "phases": [
    {
      "phase_number": 1,
      "name": "Discovery & Planning",
      "duration": "2 weeks",
      "objectives": ["objective1", "objective2"],
      "tasks": [
        {
          "task": "task description",
          "owner": "Client/Vendor/Both",
          "duration": "X days",
          "dependencies": "none or task name"
        }
      ],
      "deliverables": ["deliverable1", "deliverable2"],
      "exit_criteria": "what must be true to move to next phase"
    }
  ],
  "raci_matrix": [
    {
      "activity": "activity name",
      "client_sponsor": "R/A/C/I/-",
      "client_pm": "R/A/C/I/-",
      "client_technical": "R/A/C/I/-",
      "vendor_pm": "R/A/C/I/-",
      "vendor_architect": "R/A/C/I/-",
      "vendor_engineer": "R/A/C/I/-"
    }
  ],
  "risk_register": [
    {
      "id": "R01",
      "risk": "risk description",
      "category": "Technical/Commercial/Resource/External",
      "probability": "High/Medium/Low",
      "impact": "High/Medium/Low",
      "risk_score": "High/Medium/Low",
      "owner": "Client/Vendor",
      "mitigation": "mitigation strategy",
      "contingency": "what to do if risk materializes"
    }
  ],
  "resource_plan": {
    "client_team": [
      {
        "role": "role title",
        "responsibilities": "key responsibilities",
        "time_commitment": "% of time or days/week",
        "phases_involved": "Phase 1, 2..."
      }
    ],
    "vendor_team": [
      {
        "role": "role title",
        "responsibilities": "key responsibilities",
        "time_commitment": "% of time or days/week",
        "phases_involved": "Phase 1, 2..."
      }
    ]
  },
  "change_management": {
    "approach": "brief description of change management strategy",
    "stakeholder_groups": [
      {
        "group": "group name",
        "impact": "High/Medium/Low",
        "strategy": "engagement strategy"
      }
    ],
    "communication_plan": [
      {
        "audience": "audience",
        "message": "key message",
        "channel": "email/meeting/town hall",
        "frequency": "weekly/monthly/milestone"
      }
    ],
    "training_plan": {
      "approach": "training approach",
      "sessions": [
        {
          "audience": "who",
          "topic": "what",
          "format": "how",
          "duration": "how long",
          "timing": "when"
        }
      ]
    }
  },
  "configuration_checklist": [
    {
      "category": "category name",
      "items": ["item1", "item2", "item3"]
    }
  ],
  "success_metrics": [
    {
      "metric": "metric name",
      "baseline": "current state",
      "target": "goal",
      "measurement": "how to measure",
      "timeframe": "when"
    }
  ]
}`,

  async generate(projectId, clientIntelligence, solutionContext, scopeAnalysis) {
    const context = `
CLIENT: ${clientIntelligence?.company_name || 'Not specified'}
Industry: ${clientIntelligence?.market_position?.industry || 'Not specified'}
Size: ${clientIntelligence?.overview?.size || 'Not specified'}
Regulatory complexity: ${clientIntelligence?.regulatory_environment?.compliance_complexity || 'Not specified'}
Implementation complexity: ${clientIntelligence?.implementation_considerations?.complexity || 'Not specified'}

SOLUTION: ${solutionContext?.solution_name || 'Not specified'}
Fit score: ${solutionContext?.fit_assessment?.fit_score || 'Not specified'}/10
Methodology: ${solutionContext?.implementation_approach?.recommended_methodology || 'Phased'}
Modules: ${solutionContext?.relevant_modules?.slice(0, 3).map(m => m.name).join(', ') || 'Not specified'}

SCOPE:
Project: ${scopeAnalysis?.project_overview?.project_name || 'Not specified'}
Duration: ${scopeAnalysis?.timeline?.total_duration || 'Not specified'}
Go-live: ${scopeAnalysis?.timeline?.go_live_date || 'Not specified'}
Risks identified: ${scopeAnalysis?.risks_identified?.length || 0}
Client responsibilities: ${scopeAnalysis?.client_responsibilities?.slice(0, 3).join(', ') || 'Not specified'}`;

    const userPrompt = `Generate a complete implementation plan for this project:

${context}

Create a realistic, detailed implementation plan with 4-6 phases covering Discovery through Hypercare. Include a RACI matrix for key activities, risk register, resource plan, change management approach, and configuration checklist. Tailor everything to this specific client's industry, size, and regulatory environment.`;

    const result = await AI_CLIENT.callJSON(this.SYSTEM_PROMPT, userPrompt, 8000);
    await this.save(projectId, result);
    return result;
  },

  async save(projectId, data) {
    const { error } = await supabaseClient
      .from('phase_outputs')
      .upsert({
        project_id: projectId,
        phase: 'implementation_plan',
        output: data,
        updated_at: new Date().toISOString()
      }, { onConflict: 'project_id,phase' });

    if (error) throw error;

    await supabaseClient
      .from('projects')
      .update({ status: 'planning', updated_at: new Date().toISOString() })
      .eq('id', projectId);
  },

  async load(projectId) {
    const { data, error } = await supabaseClient
      .from('phase_outputs')
      .select('output')
      .eq('project_id', projectId)
      .eq('phase', 'implementation_plan')
      .single();

    if (error) return null;
    return data?.output || null;
  },

  render(data) {
    const riskColor = {
      'High': { bg: 'var(--color-danger-light)', text: 'var(--color-danger)' },
      'Medium': { bg: 'var(--color-warning-light)', text: 'var(--color-warning)' },
      'Low': { bg: 'var(--color-success-light)', text: 'var(--color-success)' }
    };

    const raciColor = {
      'R': '#1D4ED8', 'A': '#7C3AED', 'C': '#059669', 'I': '#6B7280', '-': '#E5E7EB'
    };

    const raciLabel = {
      'R': 'Responsible', 'A': 'Accountable', 'C': 'Consulted', 'I': 'Informed', '-': '-'
    };

    return `
      <div class="phase-output page-enter">

        <!-- Hero -->
        <div class="output-hero">
          <div class="output-hero-left">
            <h3>${data.project_summary.project_name}</h3>
            <p class="text-secondary">${data.project_summary.client} · ${data.project_summary.solution}</p>
            <div class="output-tags">
              <span class="output-tag">${data.project_summary.methodology}</span>
              <span class="output-tag">${data.project_summary.total_duration}</span>
              <span class="output-tag">${data.project_summary.team_size}</span>
            </div>
          </div>
          <div class="output-hero-stats">
            <div class="output-stat">
              <div class="output-stat-value">${data.phases.length}</div>
              <div class="output-stat-label">Phases</div>
            </div>
            <div class="output-stat">
              <div class="output-stat-value">${data.risk_register.length}</div>
              <div class="output-stat-label">Risks Tracked</div>
            </div>
            <div class="output-stat">
              <div class="output-stat-value">${data.project_summary.go_live_date}</div>
              <div class="output-stat-label">Go-Live</div>
            </div>
          </div>
        </div>

        <!-- Output tabs -->
        <div class="plan-tabs">
          <button class="plan-tab active" onclick="switchPlanTab('phases', this)">📋 Phases & Tasks</button>
          <button class="plan-tab" onclick="switchPlanTab('raci', this)">👥 RACI Matrix</button>
          <button class="plan-tab" onclick="switchPlanTab('risks', this)">⚠️ Risk Register</button>
          <button class="plan-tab" onclick="switchPlanTab('resources', this)">🧑‍💼 Resource Plan</button>
          <button class="plan-tab" onclick="switchPlanTab('change', this)">🔄 Change Management</button>
          <button class="plan-tab" onclick="switchPlanTab('config', this)">⚙️ Config Checklist</button>
        </div>

        <!-- PHASES TAB -->
        <div class="plan-tab-panel active" id="plan-phases">
          ${data.phases.map((phase, i) => `
            <div class="phase-block">
              <div class="phase-block-header">
                <div class="phase-block-number">Phase ${phase.phase_number}</div>
                <div class="phase-block-title">${phase.name}</div>
                <div class="phase-block-duration">${phase.duration}</div>
              </div>
              <div class="phase-block-body">
                <div class="phase-block-section">
                  <div class="output-card-title">Objectives</div>
                  ${phase.objectives.map(o => `<div class="consideration-item opportunity">${o}</div>`).join('')}
                </div>
                <div class="phase-block-section">
                  <div class="output-card-title">Tasks</div>
                  <table class="metrics-table">
                    <thead><tr><th>Task</th><th>Owner</th><th>Duration</th><th>Dependencies</th></tr></thead>
                    <tbody>
                      ${phase.tasks.map(t => `
                        <tr>
                          <td>${t.task}</td>
                          <td><span class="badge ${t.owner === 'Client' ? 'badge-researching' : t.owner === 'Vendor' ? 'badge-planning' : 'badge-draft'}">${t.owner}</span></td>
                          <td class="text-small text-muted">${t.duration}</td>
                          <td class="text-small text-secondary">${t.dependencies}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
                <div class="phase-block-two-col">
                  <div>
                    <div class="output-card-title">Deliverables</div>
                    ${phase.deliverables.map(d => `<div class="consideration-item opportunity">📄 ${d}</div>`).join('')}
                  </div>
                  <div>
                    <div class="output-card-title">Exit Criteria</div>
                    <div class="consideration-item risk">✅ ${phase.exit_criteria}</div>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- RACI TAB -->
        <div class="plan-tab-panel" id="plan-raci">
          <div class="raci-legend">
            ${Object.entries(raciLabel).filter(([k]) => k !== '-').map(([k, v]) => `
              <div class="raci-legend-item">
                <span class="raci-cell" style="background:${raciColor[k]}20; color:${raciColor[k]}; width:28px; height:28px; display:inline-flex; align-items:center; justify-content:center; border-radius:4px; font-weight:700; font-size:0.875rem">${k}</span>
                <span class="text-small text-secondary">${v}</span>
              </div>
            `).join('')}
          </div>
          <div class="raci-table-wrapper">
            <table class="raci-table">
              <thead>
                <tr>
                  <th class="raci-activity-col">Activity</th>
                  <th>Client<br>Sponsor</th>
                  <th>Client<br>PM</th>
                  <th>Client<br>Technical</th>
                  <th>Vendor<br>PM</th>
                  <th>Vendor<br>Architect</th>
                  <th>Vendor<br>Engineer</th>
                </tr>
              </thead>
              <tbody>
                ${data.raci_matrix.map(row => `
                  <tr>
                    <td class="raci-activity">${row.activity}</td>
                    ${['client_sponsor','client_pm','client_technical','vendor_pm','vendor_architect','vendor_engineer'].map(role => {
                      const val = row[role] || '-';
                      return `<td class="raci-value-cell">
                        <span class="raci-badge" style="background:${raciColor[val] ? raciColor[val] + '20' : '#F1F5F9'}; color:${raciColor[val] || '#94A3B8'}">${val}</span>
                      </td>`;
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- RISKS TAB -->
        <div class="plan-tab-panel" id="plan-risks">
          <div class="risk-summary">
            ${['High','Medium','Low'].map(level => {
              const count = data.risk_register.filter(r => r.risk_score === level).length;
              return `<div class="risk-summary-item" style="background:${riskColor[level].bg}; border-left: 3px solid ${riskColor[level].text}">
                <div class="risk-summary-count" style="color:${riskColor[level].text}">${count}</div>
                <div class="risk-summary-label text-small">${level} Risk</div>
              </div>`;
            }).join('')}
          </div>
          ${data.risk_register.map(risk => `
            <div class="risk-card">
              <div class="risk-card-header">
                <div class="risk-id">${risk.id}</div>
                <div class="risk-title">${risk.risk}</div>
                <div class="risk-badges">
                  <span class="badge" style="background:${riskColor[risk.risk_score]?.bg}; color:${riskColor[risk.risk_score]?.text}">${risk.risk_score}</span>
                  <span class="badge badge-draft">${risk.category}</span>
                  <span class="badge badge-draft">${risk.owner}</span>
                </div>
              </div>
              <div class="risk-card-body">
                <div class="risk-detail">
                  <span class="risk-detail-label">Probability</span>
                  <span class="risk-detail-value">${risk.probability}</span>
                </div>
                <div class="risk-detail">
                  <span class="risk-detail-label">Impact</span>
                  <span class="risk-detail-value">${risk.impact}</span>
                </div>
                <div class="risk-detail risk-detail-full">
                  <span class="risk-detail-label">Mitigation</span>
                  <span class="risk-detail-value">${risk.mitigation}</span>
                </div>
                <div class="risk-detail risk-detail-full">
                  <span class="risk-detail-label">Contingency</span>
                  <span class="risk-detail-value text-secondary">${risk.contingency}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- RESOURCES TAB -->
        <div class="plan-tab-panel" id="plan-resources">
          <div class="output-grid">
            <div class="output-card">
              <div class="output-card-title">👤 Client Team</div>
              ${data.resource_plan.client_team.map(r => `
                <div class="resource-item">
                  <div class="resource-role">${r.role}</div>
                  <div class="resource-detail text-small text-secondary">${r.responsibilities}</div>
                  <div class="resource-meta">
                    <span class="badge badge-researching">${r.time_commitment}</span>
                    <span class="text-small text-muted">${r.phases_involved}</span>
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="output-card">
              <div class="output-card-title">🏢 Vendor Team</div>
              ${data.resource_plan.vendor_team.map(r => `
                <div class="resource-item">
                  <div class="resource-role">${r.role}</div>
                  <div class="resource-detail text-small text-secondary">${r.responsibilities}</div>
                  <div class="resource-meta">
                    <span class="badge badge-planning">${r.time_commitment}</span>
                    <span class="text-small text-muted">${r.phases_involved}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- CHANGE MANAGEMENT TAB -->
        <div class="plan-tab-panel" id="plan-change">
          <div class="output-grid">
            <div class="output-card output-card-wide">
              <div class="output-card-title">🎯 Change Management Approach</div>
              <p class="text-secondary">${data.change_management.approach}</p>
            </div>
            <div class="output-card">
              <div class="output-card-title">👥 Stakeholder Groups</div>
              ${data.change_management.stakeholder_groups.map(s => `
                <div class="resource-item">
                  <div class="resource-role">${s.group}</div>
                  <div class="resource-meta">
                    <span class="badge" style="background:${riskColor[s.impact]?.bg}; color:${riskColor[s.impact]?.text}">${s.impact} Impact</span>
                  </div>
                  <div class="text-small text-secondary mt-sm">${s.strategy}</div>
                </div>
              `).join('')}
            </div>
            <div class="output-card">
              <div class="output-card-title">📣 Communication Plan</div>
              ${data.change_management.communication_plan.map(c => `
                <div class="resource-item">
                  <div class="resource-role">${c.audience}</div>
                  <div class="text-small text-secondary">${c.message}</div>
                  <div class="resource-meta mt-sm">
                    <span class="badge badge-draft">${c.channel}</span>
                    <span class="badge badge-draft">${c.frequency}</span>
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="output-card output-card-wide">
              <div class="output-card-title">🎓 Training Plan</div>
              <p class="text-secondary text-small" style="margin-bottom:var(--space-md)">${data.change_management.training_plan.approach}</p>
              <table class="metrics-table">
                <thead><tr><th>Audience</th><th>Topic</th><th>Format</th><th>Duration</th><th>Timing</th></tr></thead>
                <tbody>
                  ${data.change_management.training_plan.sessions.map(s => `
                    <tr>
                      <td>${s.audience}</td>
                      <td>${s.topic}</td>
                      <td><span class="badge badge-draft">${s.format}</span></td>
                      <td class="text-small text-muted">${s.duration}</td>
                      <td class="text-small text-secondary">${s.timing}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- CONFIG CHECKLIST TAB -->
        <div class="plan-tab-panel" id="plan-config">
          <div class="output-grid">
            ${data.configuration_checklist.map(cat => `
              <div class="output-card">
                <div class="output-card-title">⚙️ ${cat.category}</div>
                ${cat.items.map(item => `
                  <div class="checklist-item">
                    <input type="checkbox" class="checklist-checkbox" id="chk-${Math.random().toString(36).substr(2,9)}">
                    <label class="text-small">${item}</label>
                  </div>
                `).join('')}
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;
  }
};

// ── Plan tab switcher ──
function switchPlanTab(tabName, btn) {
  document.querySelectorAll('.plan-tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.plan-tab').forEach(b => b.classList.remove('active'));
  document.getElementById(`plan-${tabName}`).classList.add('active');
  btn.classList.add('active');
}
