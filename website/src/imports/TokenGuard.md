# TokenGuard — AI Token Spiral Monitor & Budget Enforcer

> **Status:** Idea validated — researched, unbuilt, problem confirmed at scale
> **Stage:** Pre-development / concept
> **Category:** Developer Tools / Vibe Coding Infrastructure
> **Target User:** Solo indie developers, non-technical vibe coders
> **Comparable Product:** [[Rulecatch]] — same passive monitor model, different problem

---

## 🧠 The Core Idea

A cross-IDE, always-on monitor that sits between the developer and their AI coding tools. It watches token burn rate, detects when an AI agent is spiralling (editing the same files repeatedly with no user input), enforces hard budget caps, and force-stops runaway sessions before real money is wasted.

**One sentence pitch:** *Rocket Money for AI coding tools — but with active enforcement, not just reporting.*

---

## 🔥 The Problem (Verified, Documented At Scale)

### Token Spirals Are Destroying Budgets

When an AI coding agent (Cursor, Windsurf, Claude Code, Bolt, etc.) hits a problem it can't solve, it enters a loop:

```
error → attempted fix → new error → attempted fix → new error → ...
```

Every loop iteration consumes tokens. The context window grows. The model doubles down. The user, often a non-technical vibe coder, has no idea this is happening. By the time they notice — the session bill has exploded.

**Documented real cases from research:**
- One Cursor user burned **28 million tokens** generating 149 lines of code
- Another burned **170 million tokens in 2 days**
- A Bolt user reported prompts consuming **600K–1.2M tokens** for a single minor page edit
- One developer's first two prompts cost **$0.61 and $0.68 with zero warning**
- Cursor's June 2025 pricing switch triggered mass overcharging — no live tracker existed — Cursor issued public apology and refunds
- Documented "value ratio" in one spiral case: **1.4%** — 40 useful lines from 2,847 generated

### The Vibe Coder Profile Makes This Worse

63% of active vibe coding users are **non-developers** — product managers, founders, marketers. They:
- Don't understand what a token is
- Can't read a context window warning
- Have no idea when an agent is looping vs. thinking
- Are running Cursor + Bolt + Lovable + Claude API simultaneously with **no unified spend view**
- Are paying **$20–$200/month per tool** with zero transparency

The phenomenon has a documented name in the vibe coding community: **"token anxiety"** — developers rationing queries and avoiding agents for simple tasks out of fear of burning through quotas.

---

## 🗺️ How It Works (Conceptual)

### Detection Layer
TokenGuard attaches to the IDE via extension hooks (same mechanism as Rulecatch). It watches:

1. **File edit frequency** — if the same file is written 3+ times within a rolling time window with no user input between edits, a spiral flag is raised
2. **Token burn rate** — monitors tokens-per-minute. Normal coding is linear. Spirals are exponential. The inflection point is detectable
3. **Context window pressure** — fires a warning at 70–80% of context window capacity, before the model starts losing coherence
4. **Error-fix-error pattern** — if rapid file edits correlate with no successful build/test, the loop signature is confirmed

### Enforcement Layer
When a spiral is detected, TokenGuard can:
- **Warn** — surface a banner with current burn rate, estimated cost to cap, files being looped
- **Pause** — block the next prompt from firing until the user confirms
- **Force-stop** — kill the agent session entirely and roll back to last stable checkpoint
- **Hard cap** — refuse to allow any prompt once session token limit is reached

The user sets their own thresholds:
- Max tokens per session (e.g. 300k)
- Max monthly spend in dollars (e.g. $60)
- Max edits to same file before spiral flag (e.g. 3×)
- Max prompt rate (e.g. 8 prompts per 5 minutes)

### Dashboard Layer
A lightweight local or web dashboard showing:
- Live token burn rate chart — current session
- Budget bars — session cap, monthly cap, context window
- Loop detector — which files are being spiralled right now
- Spend by tool — Cursor, Bolt, Claude API, Windsurf, Copilot in one view
- Session event timeline — every spiral caught, stopped, saved
- Monthly savings — estimated dollars rescued from spirals

---

## 🧱 Technical Architecture (Conceptual)

### How It Attaches To IDEs

**Cursor / Windsurf / VS Code:**
Uses Claude Code hooks — the same mechanism Rulecatch uses. Hooks fire on every tool call, capturing file write events and metadata without reading prompt content.

**Bolt / Lovable / Replit (browser-based):**
These are harder — no local filesystem. Possible approaches:
- Browser extension intercepting API calls
- Webhook integration if the platform exposes a usage API
- Manual token import from platform dashboards (fallback)

**Claude API / OpenAI API (direct):**
Proxy layer — TokenGuard sits between the app and the API, counting tokens on every request/response.

### What It Does NOT Need

- It does not read prompt content — only metadata (file paths, edit counts, timestamps, token counts)
- It does not require AI model access — purely observational
- It does not require security domain expertise
- No model training required — detection is rule-based on observable signals

### Stack Options (To Decide)
- IDE extension: TypeScript (VS Code extension API)
- Local daemon: Node.js or Rust (for filesystem watching)
- Dashboard: lightweight web UI, local-first
- Optional cloud sync: for cross-device budget tracking

---

## ✅ Market Validation

### Problem Confirmation Sources
- Stack Overflow Developer Survey 2025 — 66% of developers spending more time fixing AI code than saved
- Documented Reddit threads: r/cursor, r/vibecoding, r/ClaudeAI — hundreds of posts about token overcharging
- Cursor public apology + refunds (July 2025) — direct confirmation that tracking gap is real and caused financial harm
- Industry publication explicitly calls for "Guardrail Agents" as the next evolution of vibe coding tooling

### Competitor Map

| Tool | Token Tracking | Spiral Detection | Cross-IDE | Solo Dev Priced |
|------|---------------|-----------------|-----------|-----------------|
| Cursor (built-in) | Partial, post-session | ❌ | ❌ | ✅ |
| Cline | Session total only | ❌ | ❌ | ✅ |
| Kiro | Per-prompt cost | ❌ | ❌ | ✅ |
| LangSmith | ✅ | ❌ | API only | ❌ ($$$) |
| Arize / Galileo | ✅ | ❌ | API only | ❌ ($$$) |
| **TokenGuard** | **✅ Real-time** | **✅** | **✅** | **✅** |

**Conclusion from research: The specific combination of cross-IDE + real-time burn rate + automated spiral detection + hard budget enforcement does not exist as a standalone product.**

---

## 💰 Business Model

### Pricing Hypothesis
Following the Rulecatch model:

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | 1 IDE, session tracking, basic alerts |
| Solo | $9–12/month | All IDEs, spiral detection, budget caps, dashboard |
| Pro | $19–24/month | Multi-project, team view, API access, custom rules |

### Why Solo Devs Will Pay
- They are **already paying $20–$200/month per AI tool**
- They have experienced token overcharging directly
- The value prop is immediate and calculable — "TokenGuard saved you $14.30 this month"
- Price is less than the cost of one spiral session

### Distribution Channels
Primary: communities where vibe coders already are and already complaining about this exact problem
- r/cursor (~200k members)
- r/vibecoding
- r/ClaudeAI
- r/indiehackers
- Indie Hackers newsletter / Show HN post
- Twitter/X #vibecoding tag

Marketing angle: **"The $0.61 prompt that cost you $47"** — lead with the documented overcharging stories. The outrage is already there. Don't manufacture it.

---

## ⚠️ Risks & Unknowns

### Technical Risks
- **Browser-based IDEs (Bolt, Lovable)** — no local filesystem access. Extension or proxy approach needed. May require separate product version
- **IDE API stability** — Claude Code hooks are relatively new. If Cursor/Anthropic changes hook architecture, integration breaks
- **Token counting accuracy** — counting tokens without reading prompt content requires approximation (character count → token estimate). Accuracy may be 85–90%, not 100%

### Market Risks
- **IDE incumbents could build this** — Cursor, Windsurf could ship native spiral detection. They haven't in 2 years despite user demand. Not a guarantee they won't
- **Willingness to pay** — the 71-Reddit-threads-but-zero-willingness-to-pay problem is real. Needs validation with a waitlist before building
- **Non-developer users are hard to reach with developer-channel marketing** — r/cursor skews technical. Non-dev vibe coders may be on different platforms (TikTok, YouTube, LinkedIn)

### Open Questions
- [ ] Can spiral detection be accurate enough to avoid false positives on legitimate multi-edit sessions?
- [ ] What's the minimum viable hook integration — does Cursor's current API expose enough data?
- [ ] Is a browser extension viable for Bolt/Lovable, or is that a v2 feature?
- [ ] Does anyone pay for a waitlist / pre-launch interest?

---

## 🔗 Related Ideas (Killed — For Reference)

- **AI Codebase Consistency Checker** — killed, Rulecatch already built this (March 2026)
- **Ephemeral Environments for non-standard stacks** — real gap, requires deep DevOps infra investment, not indie buildable
- **OSS Security Report Noise Filter** — real gap, requires security domain expertise
- **Secrets/env manager for solo devs** — killed, Doppler + Infisical cover it
- **Lightweight fabrication shop job management** — viable but different market (blue collar)

---

## 📅 Research Log

| Date | Action | Finding |
|------|--------|---------|
| Session 1 | Blue collar market scan | Saturated across all major trade verticals. One gap: 1–5 person fabrication shop SaaS |
| Session 2 | Dev sphere Reddit/HN/SO scrape | Token spiral, AI change audit, architecture diagram gaps identified |
| Session 3 | Architecture consistency checker deep dive | Killed — Rulecatch.ai already built it (live, $49–499/month) |
| Session 4 | Token spiral verification | **Not built. Gap confirmed across all research vectors.** |

---

*Last updated: {{date}}*
*Research method: problem-first, no inductive reasoning, verify before ideating*
