// ============================================
// AI Client — Claude API wrapper
// Used by all 5 phases
// ============================================

const AI_CLIENT = {

  // ── Core API call ──
  async call(systemPrompt, userPrompt, maxTokens = 4000) {
    const apiKey = localStorage.getItem('aim_api_key');
    const model = localStorage.getItem('aim_model') || 'claude-haiku-4-5-20251001';

    if (!apiKey) {
      throw new Error('No API key found. Please add your Claude API key in Settings.');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-client-side-api-key-flag': 'true'
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  },

  // ── Parse JSON response safely ──
  parseJSON(text) {
    try {
      // Strip markdown code blocks if present
      const clean = text
        .replace(/^```json\n?/m, '')
        .replace(/^```\n?/m, '')
        .replace(/```$/m, '')
        .trim();
      return JSON.parse(clean);
    } catch (e) {
      console.error('JSON parse error:', e, 'Raw text:', text);
      throw new Error('AI returned an unexpected format. Please try again.');
    }
  },

  // ── Call and parse JSON in one step ──
  async callJSON(systemPrompt, userPrompt, maxTokens = 4000) {
    const text = await this.call(systemPrompt, userPrompt, maxTokens);
    return this.parseJSON(text);
  }
};
