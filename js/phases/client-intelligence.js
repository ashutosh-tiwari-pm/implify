// ============================================
// Phase 1: Client Intelligence
// Researches the client company using Claude
// ============================================

const PHASE_CLIENT_INTELLIGENCE = {

  // ── System Prompt ──
  SYSTEM_PROMPT: `You are a senior implementation consultant and business intelligence analyst with 15+ years of experience implementing B2B SaaS solutions for enterprise clients globally.

Your task is to research and analyze a client company based on the information provided, and return a comprehensive client intelligence profile.

IMPORTANT: Return ONLY valid JSON. No markdown, no explanation, no preamble. Just the JSON object.

Return this exact JSON structure:
{
  "company_name": "string",
  "overview": {
    "description": "2-3 sentence company description",
    "founded": "year or approximate",
    "headquarters": "city, country",
    "size": "employee count range",
    "revenue": "estimated revenue range if known",
    "stock_listed": "yes/no and exchange if public"
  },
  "business_model": {
    "type": "B2B/B2C/B2B2C/etc",
    "description": "how they make money",
    "primary_customers": "who they sell to",
    "revenue_streams": "main revenue sources",
    "key_products_services": ["product1", "product2"]
  },
  "geography": {
    "headquarters": "city, country",
    "operating_regions": ["region1", "region2"],
    "key_markets": "description of main markets",
    "international_presence": "yes/no with details"
  },
  "regulatory_environment": {
    "applicable_regulations": ["regulation1", "regulation2"],
    "regulators": "key regulatory bodies",
    "compliance_complexity": "Low/Medium/High",
    "compliance_notes": "key compliance considerations for implementation"
  },
  "market_position": {
    "industry": "primary industry",
    "sub_sector": "specific sector",
    "market_segment": "enterprise/mid-market/SMB",
    "market_position": "leader/challenger/niche",
    "competitive_advantages": "key differentiators"
  },
  "competitors": [
    {
      "name": "competitor name",
      "description": "one line description",
      "threat_level": "High/Medium/Low"
    }
  ],
  "recent_news": [
    {
      "headline": "news headline",
      "significance": "why this matters for implementation",
      "date": "approximate date if known"
    }
  ],
  "key_stakeholders": [
    {
      "role": "job title",
      "department": "department",
      "implementation_relevance": "why they matter for implementation"
    }
  ],
  "technology_signals": {
    "tech_stack_hints": "known or likely technologies used",
    "digital_maturity": "Low/Medium/High",
    "notes": "any relevant technology observations"
  },
  "implementation_considerations": {
    "complexity": "Low/Medium/High",
    "key_risks": ["risk1", "risk2"],
    "key_opportunities": ["opportunity1", "opportunity2"],
    "recommended_approach": "brief recommendation for implementation approach"
  },
  "confidence_level": "High/Medium/Low",
  "data_sources_note": "note about what information was available vs estimated"
}`,

  // ── Generate Client Intelligence ──
  async generate(projectId, clientName, clientUrl) {
    const userPrompt = `Research and analyze the following company for an enterprise SaaS implementation:

Company Name: ${clientName}
Website: ${clientUrl || 'Not provided'}

Based on your knowledge of this company and industry, provide a comprehensive client intelligence profile. Focus on information that would be most relevant for planning a B2B SaaS implementation — their business model, regulatory environment, technology maturity, organizational structure, and any recent developments that could impact an implementation project.

If you don't have specific information about this company, use the company name and URL to make educated inferences about their likely industry, size, and characteristics. Be clear about what is known vs estimated.`;

    const result = await AI_CLIENT.callJSON(this.SYSTEM_PROMPT, userPrompt, 4000);

    // Save to database
    await this.save(projectId, result);

    return result;
  },

  // ── Save to Supabase ──
  async save(projectId, data) {
    const { error } = await supabaseClient
      .from('phase_outputs')
      .upsert({
        project_id: projectId,
        phase: 'client_intelligence',
        output: data,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'project_id,phase'
      });

    if (error) throw error;

    // Update project status
    await supabaseClient
      .from('projects')
      .update({ status: 'researching', updated_at: new Date().toISOString() })
      .eq('id', projectId);
  },

  // ── Load from Supabase ──
  async load(projectId) {
    const { data, error } = await supabaseClient
      .from('phase_outputs')
      .select('output')
      .eq('project_id', projectId)
      .eq('phase', 'client_intelligence')
      .single();

    if (error) return null;
    return data?.output || null;
  },

  // ── Render HTML ──
  render(data) {
    const complexityColor = {
      'Low': 'var(--color-success)',
      'Medium': 'var(--color-warning)',
      'High': 'var(--color-danger)'
    };

    return `
      <div class="phase-output page-enter">

        <!-- Header Card -->
        <div class="output-hero">
          <div class="output-hero-left">
            <h3>${data.company_name}</h3>
            <p class="text-secondary">${data.overview.description}</p>
            <div class="output-tags">
              <span class="output-tag">${data.market_position.industry}</span>
              <span class="output-tag">${data.business_model.type}</span>
              <span class="output-tag">${data.market_position.market_segment}</span>
              <span class="output-tag" style="background:${complexityColor[data.implementation_considerations.complexity]}20; color:${complexityColor[data.implementation_considerations.complexity]}">
                ${data.implementation_considerations.complexity} Complexity
              </span>
            </div>
          </div>
          <div class="output-hero-stats">
            <div class="output-stat">
              <div class="output-stat-value">${data.overview.headquarters}</div>
              <div class="output-stat-label">Headquarters</div>
            </div>
            <div class="output-stat">
              <div class="output-stat-value">${data.overview.size}</div>
              <div class="output-stat-label">Company Size</div>
            </div>
            <div class="output-stat">
              <div class="output-stat-value">${data.regulatory_environment.compliance_complexity}</div>
              <div class="output-stat-label">Compliance Complexity</div>
            </div>
          </div>
        </div>

        <!-- Grid -->
        <div class="output-grid">

          <!-- Business Model -->
          <div class="output-card">
            <div class="output-card-title">💼 Business Model</div>
            <div class="output-field">
              <span class="output-field-label">Type</span>
              <span class="output-field-value">${data.business_model.type}</span>
            </div>
            <div class="output-field">
              <span class="output-field-label">Customers</span>
              <span class="output-field-value">${data.business_model.primary_customers}</span>
            </div>
            <div class="output-field">
              <span class="output-field-label">Revenue</span>
              <span class="output-field-value">${data.business_model.revenue_streams}</span>
            </div>
            <div class="output-field-full">
              <span class="output-field-label">Key Products</span>
              <div class="output-pills">
                ${data.business_model.key_products_services.map(p => `<span class="output-pill">${p}</span>`).join('')}
              </div>
            </div>
          </div>

          <!-- Geography -->
          <div class="output-card">
            <div class="output-card-title">🌍 Geography & Markets</div>
            <div class="output-field">
              <span class="output-field-label">HQ</span>
              <span class="output-field-value">${data.geography.headquarters}</span>
            </div>
            <div class="output-field">
              <span class="output-field-label">International</span>
              <span class="output-field-value">${data.geography.international_presence}</span>
            </div>
            <div class="output-field-full">
              <span class="output-field-label">Operating Regions</span>
              <div class="output-pills">
                ${data.geography.operating_regions.map(r => `<span class="output-pill">${r}</span>`).join('')}
              </div>
            </div>
          </div>

          <!-- Regulatory -->
          <div class="output-card">
            <div class="output-card-title">⚖️ Regulatory Environment</div>
            <div class="output-field">
              <span class="output-field-label">Regulators</span>
              <span class="output-field-value">${data.regulatory_environment.regulators}</span>
            </div>
            <div class="output-field">
              <span class="output-field-label">Complexity</span>
              <span class="output-field-value" style="color:${complexityColor[data.regulatory_environment.compliance_complexity]}; font-weight:600">
                ${data.regulatory_environment.compliance_complexity}
              </span>
            </div>
            <div class="output-field-full">
              <span class="output-field-label">Key Regulations</span>
              <div class="output-pills">
                ${data.regulatory_environment.applicable_regulations.map(r => `<span class="output-pill">${r}</span>`).join('')}
              </div>
            </div>
            <div class="output-field-full">
              <span class="output-field-label">Notes</span>
              <span class="output-field-value text-small">${data.regulatory_environment.compliance_notes}</span>
            </div>
          </div>

          <!-- Technology -->
          <div class="output-card">
            <div class="output-card-title">💻 Technology Profile</div>
            <div class="output-field">
              <span class="output-field-label">Digital Maturity</span>
              <span class="output-field-value" style="color:${complexityColor[data.technology_signals.digital_maturity] || 'inherit'}; font-weight:600">
                ${data.technology_signals.digital_maturity}
              </span>
            </div>
            <div class="output-field-full">
              <span class="output-field-label">Tech Stack Signals</span>
              <span class="output-field-value text-small">${data.technology_signals.tech_stack_hints}</span>
            </div>
            <div class="output-field-full">
              <span class="output-field-label">Notes</span>
              <span class="output-field-value text-small">${data.technology_signals.notes}</span>
            </div>
          </div>

          <!-- Competitors -->
          <div class="output-card output-card-wide">
            <div class="output-card-title">🏆 Competitive Landscape</div>
            <div class="output-field">
              <span class="output-field-label">Position</span>
              <span class="output-field-value">${data.market_position.market_position} · ${data.market_position.competitive_advantages}</span>
            </div>
            <div class="competitors-grid">
              ${data.competitors.slice(0, 4).map(c => `
                <div class="competitor-item">
                  <div class="competitor-name">${c.name}</div>
                  <div class="competitor-desc text-small text-secondary">${c.description}</div>
                  <span class="badge" style="background:${c.threat_level === 'High' ? 'var(--color-danger-light)' : c.threat_level === 'Medium' ? 'var(--color-warning-light)' : 'var(--color-success-light)'}; color:${c.threat_level === 'High' ? 'var(--color-danger)' : c.threat_level === 'Medium' ? 'var(--color-warning)' : 'var(--color-success)'}">
                    ${c.threat_level} Threat
                  </span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Recent News -->
          <div class="output-card output-card-wide">
            <div class="output-card-title">📰 Recent Developments</div>
            <div class="news-list">
              ${data.recent_news.slice(0, 4).map(n => `
                <div class="news-item">
                  <div class="news-headline">${n.headline}</div>
                  <div class="news-significance text-small text-secondary">📌 ${n.significance}</div>
                  ${n.date ? `<div class="text-small text-muted">${n.date}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Implementation Considerations -->
          <div class="output-card output-card-wide">
            <div class="output-card-title">🎯 Implementation Considerations</div>
            <div class="output-field">
              <span class="output-field-label">Recommended Approach</span>
              <span class="output-field-value">${data.implementation_considerations.recommended_approach}</span>
            </div>
            <div class="considerations-grid">
              <div>
                <div class="output-field-label" style="margin-bottom:8px">⚠️ Key Risks</div>
                ${data.implementation_considerations.key_risks.map(r => `
                  <div class="consideration-item risk">${r}</div>
                `).join('')}
              </div>
              <div>
                <div class="output-field-label" style="margin-bottom:8px">✅ Key Opportunities</div>
                ${data.implementation_considerations.key_opportunities.map(o => `
                  <div class="consideration-item opportunity">${o}</div>
                `).join('')}
              </div>
            </div>
          </div>

        </div>

        <!-- Confidence Note -->
        <div class="confidence-note">
          <strong>Confidence Level: ${data.confidence_level}</strong> — ${data.data_sources_note}
        </div>

      </div>
    `;
  }
};
