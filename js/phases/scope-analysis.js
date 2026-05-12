// ============================================
// Phase 3: Scope Analysis
// Extracts structured scope from SOW/contract
// ============================================

const PHASE_SCOPE_ANALYSIS = {

  SYSTEM_PROMPT: `You are a senior implementation consultant specializing in B2B SaaS contract and SOW analysis.
Your task is to extract and structure all relevant implementation information from a scope document.

Return ONLY valid JSON. No markdown, no explanation. Just the JSON object.

Return this exact structure:
{
  "project_overview": {
    "project_name": "string",
    "client": "string",
    "vendor": "string",
    "project_type": "New Implementation/Migration/Upgrade/Expansion",
    "summary": "2-3 sentence project summary"
  },
  "scope": {
    "in_scope": ["item1", "item2"],
    "out_of_scope": ["item1", "item2"],
    "modules_purchased": ["module1", "module2"],
    "user_count": "number or range",
    "environments": ["Production", "UAT", "etc"]
  },
  "timeline": {
    "contract_start": "date or description",
    "go_live_date": "date or description",
    "total_duration": "X weeks/months",
    "key_milestones": [
      {
        "milestone": "milestone name",
        "due": "date or week number",
        "owner": "Client/Vendor/Both"
      }
    ]
  },
  "commercial": {
    "contract_value": "value if mentioned",
    "payment_terms": "payment structure",
    "pricing_model": "subscription/one-time/hybrid"
  },
  "slas": [
    {
      "metric": "SLA metric",
      "target": "target value",
      "consequence": "what happens if missed"
    }
  ],
  "client_responsibilities": ["responsibility1", "responsibility2"],
  "vendor_responsibilities": ["responsibility1", "responsibility2"],
  "dependencies": [
    {
      "dependency": "description",
      "owner": "Client/Vendor/Third Party",
      "risk_if_delayed": "impact description"
    }
  ],
  "special_requirements": ["requirement1", "requirement2"],
  "data_requirements": {
    "migration_required": "yes/no",
    "data_cutover_approach": "description",
    "data_types": ["type1", "type2"]
  },
  "training_requirements": {
    "training_included": "yes/no",
    "format": "online/in-person/hybrid",
    "audience": "who needs training",
    "hours": "estimated hours"
  },
  "acceptance_criteria": ["criterion1", "criterion2"],
  "risks_identified": [
    {
      "risk": "risk description",
      "probability": "High/Medium/Low",
      "impact": "High/Medium/Low",
      "mitigation": "suggested mitigation"
    }
  ],
  "gaps_and_ambiguities": ["gap1", "gap2"]
}`,

  async generate(projectId, sowText, clientIntelligence, solutionContext) {
    const context = `
Client: ${clientIntelligence?.company_name || 'Not specified'}
Solution: ${solutionContext?.solution_name || 'Not specified'}`;

    const userPrompt = `Analyze this SOW/contract and extract all implementation-relevant information:

${context}

SOW/CONTRACT CONTENT:
${sowText}

Extract and structure all relevant information. For any fields not explicitly mentioned in the document, note them as "Not specified" rather than making assumptions. Flag any ambiguities or gaps that should be clarified with the client.`;

    const result = await AI_CLIENT.callJSON(this.SYSTEM_PROMPT, userPrompt, 5000);
    await this.save(projectId, result);
    return result;
  },

  async save(projectId, data) {
    const { error } = await supabaseClient
      .from('phase_outputs')
      .upsert({
        project_id: projectId,
        phase: 'scope_analysis',
        output: data,
        updated_at: new Date().toISOString()
      }, { onConflict: 'project_id,phase' });

    if (error) throw error;
  },

  async load(projectId) {
    const { data, error } = await supabaseClient
      .from('phase_outputs')
      .select('output')
      .eq('project_id', projectId)
      .eq('phase', 'scope_analysis')
      .single();

    if (error) return null;
    return data?.output || null;
  },

  render(data) {
    return `
      <div class="phase-output page-enter">

        <div class="output-hero">
          <div class="output-hero-left">
            <h3>${data.project_overview.project_name}</h3>
            <p class="text-secondary">${data.project_overview.summary}</p>
            <div class="output-tags">
              <span class="output-tag">${data.project_overview.project_type}</span>
              <span class="output-tag">${data.timeline.total_duration}</span>
              <span class="output-tag">${data.scope.user_count} Users</span>
            </div>
          </div>
          <div class="output-hero-stats">
            <div class="output-stat">
              <div class="output-stat-value">${data.scope.modules_purchased.length}</div>
              <div class="output-stat-label">Modules</div>
            </div>
            <div class="output-stat">
              <div class="output-stat-value">${data.timeline.go_live_date}</div>
              <div class="output-stat-label">Go-Live</div>
            </div>
            <div class="output-stat">
              <div class="output-stat-value">${data.risks_identified.length}</div>
              <div class="output-stat-label">Risks Identified</div>
            </div>
          </div>
        </div>

        <div class="output-grid">

          <!-- Scope In/Out -->
          <div class="output-card output-card-wide">
            <div class="output-card-title">📋 Project Scope</div>
            <div class="scope-grid">
              <div>
                <div class="output-field-label" style="margin-bottom:8px; color:var(--color-success)">✅ In Scope</div>
                ${data.scope.in_scope.map(i => `<div class="consideration-item opportunity">${i}</div>`).join('')}
              </div>
              <div>
                <div class="output-field-label" style="margin-bottom:8px; color:var(--color-danger)">❌ Out of Scope</div>
                ${data.scope.out_of_scope.map(i => `<div class="consideration-item risk">${i}</div>`).join('')}
              </div>
            </div>
          </div>

          <!-- Timeline & Milestones -->
          <div class="output-card output-card-wide">
            <div class="output-card-title">📅 Key Milestones</div>
            <div class="milestones-list">
              ${data.timeline.key_milestones.map((m, i) => `
                <div class="milestone-item">
                  <div class="milestone-number">${i + 1}</div>
                  <div class="milestone-content">
                    <div class="milestone-name">${m.milestone}</div>
                    <div class="milestone-meta">
                      <span class="text-small text-muted">${m.due}</span>
                      <span class="badge badge-draft">${m.owner}</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Responsibilities -->
          <div class="output-card">
            <div class="output-card-title">👥 Client Responsibilities</div>
            ${data.client_responsibilities.map(r => `
              <div class="consideration-item opportunity">${r}</div>
            `).join('')}
          </div>

          <div class="output-card">
            <div class="output-card-title">🏢 Vendor Responsibilities</div>
            ${data.vendor_responsibilities.map(r => `
              <div class="consideration-item opportunity">${r}</div>
            `).join('')}
          </div>

          <!-- Risks -->
          <div class="output-card output-card-wide">
            <div class="output-card-title">⚠️ Identified Risks</div>
            <table class="metrics-table">
              <thead>
                <tr>
                  <th>Risk</th>
                  <th>Probability</th>
                  <th>Impact</th>
                  <th>Mitigation</th>
                </tr>
              </thead>
              <tbody>
                ${data.risks_identified.map(r => `
                  <tr>
                    <td>${r.risk}</td>
                    <td><span class="badge" style="background:${r.probability === 'High' ? 'var(--color-danger-light)' : r.probability === 'Medium' ? 'var(--color-warning-light)' : 'var(--color-success-light)'}; color:${r.probability === 'High' ? 'var(--color-danger)' : r.probability === 'Medium' ? 'var(--color-warning)' : 'var(--color-success)'}">${r.probability}</span></td>
                    <td><span class="badge" style="background:${r.impact === 'High' ? 'var(--color-danger-light)' : r.impact === 'Medium' ? 'var(--color-warning-light)' : 'var(--color-success-light)'}; color:${r.impact === 'High' ? 'var(--color-danger)' : r.impact === 'Medium' ? 'var(--color-warning)' : 'var(--color-success)'}">${r.impact}</span></td>
                    <td class="text-small text-secondary">${r.mitigation}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Gaps & Ambiguities -->
          ${data.gaps_and_ambiguities.length > 0 ? `
          <div class="output-card output-card-wide">
            <div class="output-card-title">❓ Gaps & Ambiguities to Clarify</div>
            ${data.gaps_and_ambiguities.map(g => `
              <div class="consideration-item risk">${g}</div>
            `).join('')}
          </div>
          ` : ''}

        </div>
      </div>
    `;
  }
};
