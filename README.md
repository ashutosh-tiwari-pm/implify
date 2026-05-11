# ⚡ AI Implementation Manager (AIM)

**From Contract to Go-Live Plan in Minutes**

AI-powered implementation planning for B2B SaaS teams. Enter a client name, paste a SOW — get a complete implementation plan with client intelligence, RACI matrix, risk register, kickoff deck, and timeline.

🔗 **[Try it live →](https://ai-implementation-manager.vercel.app)**

---

## What It Does

Most B2B SaaS implementations start with weeks of manual work — researching the client, reading the contract, building spreadsheets, creating slide decks. AIM compresses that into minutes using AI.

### Five AI-Powered Phases

| Phase | What AI Does |
|-------|-------------|
| 🔍 **Client Intelligence** | Researches the company — business model, geography, market, regulators, competitors, recent news, key stakeholders |
| 🔗 **Solution-Client Fit** | Maps your SaaS product capabilities to the client's specific needs and identifies implementation complexity |
| 📋 **Scope Analysis** | Extracts scope, deliverables, timelines, SLAs, integrations, and special requirements from the SOW/contract |
| 📊 **Implementation Plan** | Generates phased plan (Discovery → Configure → Test → Train → Go-Live → Hypercare) with tasks, RACI, dependencies, risks |
| 🎯 **Deliverables** | Creates kickoff deck, timeline, risk register, go-live checklist, change management plan, and status report template |

### Key Features

- **Automated client research** from publicly available information
- **Complete implementation plans** with phases, tasks, owners, and durations
- **RACI matrix** — who does what (client vs vendor)
- **Risk register** with severity ratings and mitigations
- **Kickoff deck** ready to present to the client
- **Follow-up refinement** — iterate with AI ("Shorten timeline to 8 weeks", "Add data migration phase")
- **Project history** — save, revisit, and iterate on past plans
- **Your API key, your data** — Claude API key stored locally in your browser

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML / CSS / JavaScript |
| Hosting | Vercel |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Email + Google) |
| AI | Claude API (Haiku 4.5 / Sonnet 4.6) |
| Security | Row-Level Security (RLS), API key stored client-side |

---

## Getting Started

### Prerequisites
- A [Supabase](https://supabase.com) account (free tier)
- A [Claude API key](https://console.anthropic.com) from Anthropic
- A [Vercel](https://vercel.com) account (free tier)

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/ashutosh-tiwari-pm/ai-implementation-manager.git
   cd ai-implementation-manager
   ```

2. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to SQL Editor → paste the contents of `supabase/schema.sql` → Run
   - Go to Settings → API → Copy your Project URL and `anon` key

3. **Configure the app**
   - Open `js/supabase-client.js`
   - Replace `YOUR_PROJECT_ID` and `YOUR_ANON_KEY` with your Supabase credentials

4. **Deploy to Vercel**
   - Push to GitHub
   - Connect the repo to Vercel
   - It auto-deploys on every push

5. **Add your Claude API key**
   - Sign in to the app
   - Go to Settings (⚙️) → paste your Claude API key
   - The key is stored in your browser's localStorage only

---

## Architecture

```
User enters client name + URL
         │
         ▼
   ┌─────────────┐
   │  Web Search  │  → AI researches the client company
   │  & Research  │     (business model, market, regulators)
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │  Solution    │  → Maps SaaS product to client needs
   │  Context     │     (modules, integrations, complexity)
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │  SOW/Contract│  → Extracts scope, requirements, SLAs
   │  Analysis    │     (deliverables, timelines, constraints)
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │  Plan        │  → Generates complete implementation plan
   │  Generation  │     (phases, RACI, risks, timeline)
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │  Deliverables│  → Creates kickoff deck, checklist,
   │  Generation  │     status templates, change mgmt plan
   └─────────────┘
```

---

## Built By

**Ashutosh Tiwari** — AI Product Manager with 13+ years in enterprise SaaS

- 🔗 [LinkedIn](https://www.linkedin.com/in/ashutosh-tiwari0021)
- 🌐 [Portfolio](https://pm21.notion.site/Ashutosh-Product-Management-270a1d6b6af980e5951dc13633f9087f)
- 💻 [GitHub](https://github.com/ashutosh-tiwari-pm)

---

## License

MIT — use it, fork it, build on it.
