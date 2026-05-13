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


## Sample Data — Try It Instantly

Don't have a real SOW? Use this sample to see Implify in action immediately.

**Client:** TechFlow Solutions Inc.
**Engagement:** Salesforce Sales Cloud Enterprise Implementation
**Value:** $485,000 · 16 weeks · 87 users · NA + EMEA

**How to use:**
1. Sign in → New Project
2. Enter client name: `TechFlow Solutions`
3. Paste the SOW below into the SOW field
4. Add your Claude API key → Run all 5 phases

<details>
<summary>📄 Click to expand sample SOW</summary>

```
STATEMENT OF WORK — CRM PLATFORM IMPLEMENTATION
Client: TechFlow Solutions Inc.
Total value: $485,000 | Timeline: 16 weeks | Go-live: June 30, 2026

SCOPE:
Phase 1 — Discovery & Design (Weeks 1-3)
Current state assessment, future state design workshops, data audit of HubSpot 
(47,000 contacts, 12,000 accounts, 8,500 opportunities), technical architecture.

Phase 2 — Configuration (Weeks 4-8)
Sales Cloud setup, 34 custom fields, opportunity stages (7-stage pipeline), 
product catalog (142 SKUs), CPQ, territory management (12 NA + 6 EMEA), 
22 reports, 8 executive dashboards, 15 email templates.

Phase 3 — Data Migration (Weeks 6-9)
HubSpot to Salesforce migration, deduplication (23% duplicate rate flagged),
test migrations x2, production migration, validation sign-off.

Phase 4 — Integrations (Weeks 7-11)
Outreach.io (bi-directional), Gong (call logging), NetSuite (closed-won to order),
DocuSign (contract execution), Slack (deal alerts).

Phase 5 — Training & Go-Live (Weeks 12-16)
Admin training, 4 sales rep sessions, manager training, train-the-trainer,
30-day hypercare (4-hour SLA).

KEY RISKS:
- HubSpot data: 23% duplicate rate may extend migration timeline
- EMEA data residency: EU storage requirements unconfirmed (Frankfurt org may be needed)
- NetSuite version 2022.1: API integration approach TBD
- Key person dependency: Marcus Rodriguez sole technical contact

STAKEHOLDERS:
- Sarah Chen — VP Sales Operations (Executive Sponsor)
- Marcus Rodriguez — Director IT (Technical Lead)
- Priya Patel — Head Revenue Operations
- James Whitfield — Sales Director EMEA

COMPLIANCE: SOC 2 Type II, GDPR, Illinois BIPA
OUT OF SCOPE: Marketing Cloud, advanced CPQ, custom mobile app
```

</details>

**What Implify generates from this SOW:**
- Client intelligence on TechFlow Solutions (funding, market, competitors, news)
- Fit score for Salesforce vs TechFlow's needs with gap analysis
- Scope extraction: 47 flagged items, 6 ambiguities, 3 risks escalated
- 16-week phased plan with RACI for all 87-person org
- Downloadable kickoff deck ready for the Week 1 meeting

---
## Built By

**Ashutosh Tiwari** — AI Product Manager, 13+ years in enterprise SaaS

I've personally led 40+ enterprise implementations across financial services, healthcare, retail, and compliance platforms. Implify was built to demonstrate what AI-native product thinking looks like in practice — not a demo, a real tool solving a real problem I lived.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Ashutosh_Tiwari-0077B5?style=flat&logo=linkedin)](https://www.linkedin.com/in/ashutosh-tiwari0021)
[![Portfolio](https://img.shields.io/badge/Portfolio-pm21.notion.site-black?style=flat&logo=notion)](https://pm21.notion.site/Ashutosh-Product-Management-270a1d6b6af980e5951dc13633f9087f)

---

## License

MIT — use it, fork it, build on it.
