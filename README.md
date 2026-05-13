# Implify — AI Implementation Manager

> **From Contract to Go-Live Plan in Minutes**

AI-powered implementation planning for B2B SaaS teams. Enter a client name, paste a SOW — get a complete implementation plan with client intelligence, RACI matrix, risk register, kickoff deck, and Gantt timeline. No manual research. No spreadsheets. Ready to present.

🔗 **[Try it live →](https://ai-implementation-manager.vercel.app)**

---

## The Problem

Most B2B SaaS implementation teams spend **3–5 weeks** manually preparing before they can even start. Senior consultants spend **40+ hours per engagement** on research and prep work. 68% of enterprise SaaS implementations experience delays caused by poor initial planning.

**Implify compresses all of this into under 30 minutes.**

---

## Five AI-Powered Phases

| # | Phase | What AI Does |
|---|-------|-------------|
| 🔍 | **Client Intelligence** | Researches the company — business model, market, regulators, competitors, and recent news |
| 🔗 | **Solution-Client Fit** | Maps your SaaS product to client needs. Scores fit 1–10, identifies must-have modules |
| 📋 | **Scope Analysis** | Extracts scope, deliverables, timelines, SLAs, and flags every ambiguity from the SOW |
| 📊 | **Implementation Plan** | Phased plan with tasks, RACI matrix, risk register, resource plan, and change management |
| 🎯 | **Deliverables** | 9-slide PowerPoint kickoff deck, Gantt timeline, go-live checklist, status report template |

---

## Key Features

- Zero manual research — enter a client name, AI does the rest
- Complete RACI matrix across all implementation phases
- Risk register with probability, impact, mitigation, and contingency
- Download `.pptx` — professionally designed kickoff deck, client-ready
- Interactive go-live checklist with progress tracking
- All plans saved per project — iterate and refine anytime
- Your API key, your data — Claude key stored in browser localStorage only

---

## Architecture

```
Browser (Vanilla HTML/CSS/JS)
    ├── Supabase Auth      Email + Google OAuth
    ├── Supabase DB        PostgreSQL + Row-Level Security
    │   ├── projects
    │   ├── phase_outputs  (JSONB per phase)
    │   ├── profiles       (avatar, org, timezone)
    │   └── audit_log
    └── Vercel Serverless
        ├── /api/claude.js          Claude API proxy (solves CORS)
        ├── /api/generate-deck.js   pptxgenjs → .pptx download
        └── /api/delete-account.js  Supabase admin user delete
```

**AI call strategy — Phase 4 uses 3 parallel calls via `Promise.all()`** to avoid JSON truncation on large structured outputs. Each call is scoped to one section (phases, RACI, resources), then merged before saving.

---

## Tech Stack

| Layer | Tech | Why |
|-------|------|-----|
| Frontend | Vanilla HTML/CSS/JS | No build step, instant Vercel deploy |
| Database | Supabase PostgreSQL | RLS, real-time, free tier |
| Auth | Supabase Auth | Email + Google OAuth, zero config |
| AI | Claude API (Haiku 4.5 + Sonnet 4.6) | Haiku for speed, Sonnet for complex phases |
| Hosting | Vercel | Auto-deploy, serverless functions |
| Email | Resend via Supabase SMTP | Transactional emails |
| PPTX | pptxgenjs (browser CDN) | Client-side, no server round-trip |
| Storage | Supabase Storage | Avatar uploads, public CDN |

---

## Getting Started

### Prerequisites
- [Supabase](https://supabase.com) account (free)
- [Claude API key](https://console.anthropic.com) from Anthropic
- [Vercel](https://vercel.com) account (free)

### Setup

```bash
git clone https://github.com/ashutosh-tiwari-pm/ai-implementation-manager.git
cd ai-implementation-manager
```

**Run schema in Supabase SQL Editor:**
```sql
-- Run supabase/schema.sql first
-- Then run supabase/profiles-schema.sql
```

**Set credentials:**
```javascript
// js/supabase-client.js
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'your_publishable_key';
```

**Set Vercel environment variables:**
```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

**Deploy:**
```bash
git push origin main   # Vercel auto-deploys
```

**Add Claude API key in app:** Sign in → ⚙️ Settings → paste `sk-ant-...`

---

## Project Structure

```
implify/
├── index.html                  Landing page
├── login.html                  Auth (email + Google)
├── dashboard.html              Projects dashboard
├── project.html                5-phase workspace
├── profile.html                Profile settings
├── api/
│   ├── claude.js               Claude proxy (CORS)
│   ├── generate-deck.js        pptxgenjs PPTX generator
│   └── delete-account.js       Supabase admin delete
├── js/
│   ├── supabase-client.js
│   ├── dashboard.js
│   ├── project.js
│   ├── profile.js
│   ├── utils/ai-client.js      Claude API wrapper
│   └── phases/
│       ├── client-intelligence.js
│       ├── solution-context.js
│       ├── scope-analysis.js
│       ├── implementation-plan.js
│       └── deliverables.js
└── supabase/
    ├── schema.sql
    └── profiles-schema.sql
```

---

## Built By

**Ashutosh Tiwari** — AI Product Manager, 13+ years in enterprise SaaS

I've personally led 40+ enterprise implementations across financial services, healthcare, retail, and compliance platforms. Implify was built to demonstrate what AI-native product thinking looks like in practice — not a demo, a real tool solving a real problem I lived.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Ashutosh_Tiwari-0077B5?style=flat&logo=linkedin)](https://www.linkedin.com/in/ashutosh-tiwari0021)
[![Portfolio](https://img.shields.io/badge/Portfolio-pm21.notion.site-black?style=flat&logo=notion)](https://pm21.notion.site/Ashutosh-Product-Management-270a1d6b6af980e5951dc13633f9087f)

---

## License

MIT — use it, fork it, build on it.
