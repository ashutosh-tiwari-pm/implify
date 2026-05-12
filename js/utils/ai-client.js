// ============================================
// AI Client — Claude API via Vercel Proxy
// Proxied to avoid CORS issues in browser
// ============================================

const AI_CLIENT = {

  // ── Core API call (goes through /api/claude proxy) ──
  async call(systemPrompt, userPrompt, maxTokens = 4000) {
    const apiKey = localStorage.getItem('aim_api_key');
    const model = localStorage.getItem('aim_model') || 'claude-haiku-4-5-20251001';

    if (!apiKey) {
      throw new Error('No API key found. Please add your Claude API key in Settings.');
    }

    const response = await fetch('/api/claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey,
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  },

  // ── Parse JSON response safely ──
  parseJSON(text) {
    try {
      const clean = text
        .replace(/^```json\n?/m, '')
        .replace(/^```\n?/m, '')
        .replace(/```$/m, '')
        .trim();
      return JSON.parse(clean);
    } catch (e) {
      // Try to fix truncated JSON by finding last complete object
      try {
        const clean = text
          .replace(/^```json\n?/m, '')
          .replace(/^```\n?/m, '')
          .replace(/```$/m, '')
          .trim();
        
        // Find the last valid closing brace
        let fixed = clean;
        
        // Count open/close braces to find truncation point
        let depth = 0;
        let lastValidEnd = 0;
        for (let i = 0; i < fixed.length; i++) {
          if (fixed[i] === '{') depth++;
          if (fixed[i] === '}') {
            depth--;
            if (depth === 0) lastValidEnd = i;
          }
        }
        
        if (lastValidEnd > 0) {
          fixed = fixed.substring(0, lastValidEnd + 1);
          return JSON.parse(fixed);
        }
      } catch (e2) {
        // Both attempts failed
      }
      
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
