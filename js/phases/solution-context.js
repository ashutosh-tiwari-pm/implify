// ============================================
// Phase 2: Solution Context
// Maps SaaS product to client needs
// ============================================

const PHASE_SOLUTION_CONTEXT = {

  SYSTEM_PROMPT: `You are a senior B2B SaaS solutions architect and implementation consultant. 
Your task is to analyze a SaaS solution and map it to a specific client's needs.

Return ONLY valid JSON. No markdown, no explanation. Just the JSON object.

Return this exact structure:
{
  "solution_name": "string",
  "solution_overview": "2-3 sentence description",
  "relevant_modules": [
    {
      "name": "module name",
      "description": "what it does",
      "relevance_to_client": "why this matters for this client",
      "priority": "Must Have/Should Have/Nice to Have"
    }
  ],
  "fit_assessment": {
    "overall_fit": "Strong/Good/Moderate/Weak",
    "fit_score": "1-10",
    "fit_rationale": "explanation of fit",
    "key_value_drivers": ["value1", "value2", "value3"]
  },
  "integration_requirements": [
    {
      "system": "system name",
      "type": "API/File/Database/Manual",
      "complexity": "Low/Medium/High",
      "notes": "integration notes"
    }
  ],
  "customization_needs": {
    "level": "Standard/Moderate/Heavy",
    "description": "what customization is needed",
    "items": ["customization1", "customization2"]
  },
  "data_requirements": {
    "migration_needed": "yes/no",
    "data_types": ["data type1", "data type2"],
    "estimated_volume": "description",
    "migration_complexity": "Low/Medium/High"
  },
  "success_metrics": [
    {
      "metric": "metric name",
      "baseline": "where client likely is today",
      "target": "what success looks like",
      "timeframe": "when to measure"
    }
  ],
  "implementation_approach": {
    "recommended_methodology": "Phased/Big Bang/Pilot",
    "rationale": "why this approach",
    "key_dependencies": ["dependency1", "dependency2"]
  }
}`,

  async generate(projectId, solutionName, solutionDescription, clientIntelligence) {
    const clientContext = clientIntelligence
      ? `Client: ${clientIntelligence.company_name}
Industry: ${clientIntelligence.market_position.industry}
Size: ${clientIntelligence.overview.size}
Regulations: ${clientIntelligence.regulatory_environment.applicable_regulations.join(', ')}
Digital Maturity: ${clientIntelligence.technology_signals.digital_maturity}
Complexity: ${clientIntelligence.implementation_considerations.complexity}`
      : 'Client details not yet available';

    const userPrompt = `Analyze this SaaS solution and map it to the client's needs:

SOLUTION:
Name: ${solutionName}
Description: ${solutionDescription}

CLIENT CONTEXT:
${clientContext}

Provide a detailed solution-client fit analysis including relevant modules, integration requirements, customization needs, and success metrics tailored to this specific client.`;

    const result = await AI_CLIENT.callJSON(this.SYSTEM_PROMPT, userPrompt, 4000);
    await this.save(projectId, result, solutionName);
    return result;
  },

  async save(projectId, data, solutionName) {
    const { error } = await supabaseClient
      .from('phase_outputs')
      .upsert({
        project_id: projectId,
        phase: 'solution_context',
        output: data,
        updated_at: new Date().toISOString()
      }, { onConflict: 'project_id,phase' });

    if (error) throw error;

    await supabaseClient
      .from('projects')
      .update({
        solution_name: solutionName,
        status: 'planning',
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);
  },

  async load(projectId) {
    const { data, error } = await supabaseClient
      .from('phase_outputs')
      .select('output')
      .eq('project_id', projectId)
      .eq('phase', 'solution_context')
      .single();

    if (error) return null;
    return data?.output || null;
  },

  render(data) {
    const fitColor = {
      'Strong': 'var(--color-success)',
      'Good': 'var(--color-primary)',
      'Moderate': 'var(--color-warning)',
      'Weak': 'var(--color-danger)'
    };

    const priorityColor = {
      'Must Have': 'var(--color-danger)',
      'Should Have': 'var(--color-warning)',
      'Nice to Have': 'var(--color-success)'
    };

    return `
      <div class="phase-output page-enter">

        <!-- Fit Score Hero -->
        <div class="output-hero">
          <div class="output-hero-left">
            <h3>${data.solution_name}</h3>
            <p class="text-secondary">${data.solution_overview}</p>
            <div class="output-tags">
              <span class="output-tag" style="background:${fitColor[data.fit_assessment.overall_fit]}20; color:${fitColor[data.fit_assessment.overall_fit]}; font-weight:700">
                ${data.fit_assessment.overall_fit} Fit
              </span>
              <span class="output-tag">${data.implementation_approach.recommended_methodology} Implementation</span>
              <span class="output-tag">${data.customization_needs.level} Customization</span>
            </div>
          </div>
          <div class="output-hero-stats">
            <div class="output-stat">
              <div class="output-stat-value" style="color:${fitColor[data.fit_assessment.overall_fit]}">${data.fit_assessment.fit_score}/10</div>
              <div class="output-stat-label">Fit Score</div>
            </div>
            <div class="output-stat">
              <div class="output-stat-value">${data.relevant_modules.length}</div>
              <div class="output-stat-label">Relevant Modules</div>
            </div>
            <div class="output-stat">
              <div class="output-stat-value">${data.integration_requirements.length}</div>
              <div class="output-stat-label">Integrations</div>
            </div>
          </div>
        </div>

        <div class="output-grid">

          <!-- Relevant Modules -->
          <div class="output-card output-card-wide">
            <div class="output-card-title">📦 Relevant Modules</div>
            <div class="modules-list">
              ${data.relevant_modules.map(m => `
                <div class="module-item">
                  <div class="module-header">
                    <div class="module-name">${m.name}</div>
                    <span class="badge" style="background:${priorityColor[m.priority]}20; color:${priorityColor[m.priority]}">${m.priority}</span>
                  </div>
                  <div class="module-desc text-small text-secondary">${m.description}</div>
                  <div class="module-relevance text-small">
                    <strong>Why it matters:</strong> ${m.relevance_to_client}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Key Value Drivers -->
          <div class="output-card">
            <div class="output-card-title">💡 Key Value Drivers</div>
            ${data.fit_assessment.key_value_drivers.map(v => `
              <div class="consideration-item opportunity">${v}</div>
            `).join('')}
            <div class="output-field-full mt-md">
              <span class="output-field-label">Fit Rationale</span>
              <span class="output-field-value text-small">${data.fit_assessment.fit_rationale}</span>
            </div>
          </div>

          <!-- Integration Requirements -->
          <div class="output-card">
            <div class="output-card-title">🔗 Integration Requirements</div>
            ${data.integration_requirements.map(i => `
              <div class="integration-item">
                <div class="integration-name">${i.system}</div>
                <div class="integration-meta">
                  <span class="badge badge-draft">${i.type}</span>
                  <span class="badge" style="background:${i.complexity === 'High' ? 'var(--color-danger-light)' : i.complexity === 'Medium' ? 'var(--color-warning-light)' : 'var(--color-success-light)'}; color:${i.complexity === 'High' ? 'var(--color-danger)' : i.complexity === 'Medium' ? 'var(--color-warning)' : 'var(--color-success)'}">
                    ${i.complexity}
                  </span>
                </div>
                <div class="text-small text-secondary">${i.notes}</div>
              </div>
            `).join('')}
          </div>

          <!-- Success Metrics -->
          <div class="output-card output-card-wide">
            <div class="output-card-title">📊 Success Metrics</div>
            <table class="metrics-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Baseline</th>
                  <th>Target</th>
                  <th>Timeframe</th>
                </tr>
              </thead>
              <tbody>
                ${data.success_metrics.map(m => `
                  <tr>
                    <td><strong>${m.metric}</strong></td>
                    <td class="text-secondary text-small">${m.baseline}</td>
                    <td class="text-small" style="color:var(--color-success)">${m.target}</td>
                    <td class="text-small text-muted">${m.timeframe}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    `;
  }
};
