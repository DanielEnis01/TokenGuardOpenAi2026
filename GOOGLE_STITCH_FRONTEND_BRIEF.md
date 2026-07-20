# TokenGuard — Frontend Product and Style Brief

> **Purpose:** Give this document to Google Stitch as the product brief for a complete, desktop-first frontend prototype. Build a polished, coherent application rather than a marketing site. The product is a calm, premium control center for developers who use AI coding tools and need to understand, control, and reduce runaway token spend.

## 1. Product in one sentence

**TokenGuard is an always-on local monitor for AI coding sessions.** It shows token usage, cost, context pressure, burn rate, and repeated-edit loops; it warns the developer before a session becomes wasteful and lets them intervene.

The product should feel like a trustworthy safety system: quiet while everything is normal, precise and direct when attention is needed. It must never feel like a noisy “hacker dashboard,” a crypto trading screen, or a gamified productivity tool.

## 2. Core user and product promise

### Primary user

A solo developer or small engineering team member who uses AI coding tools such as Codex or Claude Code. They want to move quickly without accidentally spending too many tokens, overflowing a context window, or allowing an AI agent to repeatedly modify the same file without making progress.

### The job TokenGuard performs

1. Connect to local AI coding tools.
2. Observe session metadata and activity without reading prompt content.
3. Show the current live session: tool, model, runtime, token use, cost, burn rate, and context pressure.
4. Detect a likely **spiral**: repeated rapid edits to the same file with no meaningful user interruption.
5. Show a clear intervention when a spiral, budget limit, or context-risk condition needs attention.
6. Let the user configure spending and behavior guardrails.
7. Preserve a readable history of sessions, detected spirals, interventions, costs, and estimated savings.

### Important product language

- Say **spiral**, **repeated edit loop**, **guardrail**, **live session**, **intervention**, and **estimated savings**.
- Avoid sensational language such as “panic,” “meltdown,” “hacked,” “critical failure,” or “AI gone rogue.”
- Use direct, calm copy: “Repeated edits detected in `src/api/routes.ts`.”
- Explain uncertainty honestly: “Likely spiral detected” is better than an absolute claim when appropriate.

## 3. Product state: live, sample, and planned

The frontend must distinguish these states clearly.

| State | Meaning | Required presentation |
| --- | --- | --- |
| Live and healthy | The local monitor is connected and receiving real session data. | Small green status dot; “Monitoring active” or “Daemon live.” |
| Connecting | The app is trying to reach the local monitor or a tool. | Neutral spinner/dot; “Connecting to TokenGuard…” |
| Offline | The local monitor is not running or cannot be reached. | Clear neutral warning panel with one next step: “Start monitoring.” |
| Sample data | The UI is using demonstration data because no live service is available. | Explicit pill and page-level notice: “Showing sample data — no session is being monitored.” Never make sample data look live. |
| No active session | Monitoring is available but no supported AI coding session is active. | Quiet empty state: “No live AI session yet. Start a Codex task and TokenGuard will begin monitoring.” |
| Active intervention | A likely spiral or limit requires a decision. | The only time the danger color and subtle pulse animation may be prominent. |

Current live support is centered on **Codex** and **Claude Code**. Other tool cards may be visible as future integrations, but they must be labeled “Coming later” or “Not available yet”; do not make them look connected.

## 4. Information architecture

### Global application shell

Create a desktop-first app shell with:

- A narrow, collapsible left navigation rail. Collapsed width is approximately 56px; expanded width is approximately 220px.
- TokenGuard wordmark at the top of the rail.
- Navigation icons with labels when expanded.
- Main content area with a maximum useful reading width around 1120px, but allow data tables and charts to use available space.
- A persistent compact status bar at the bottom showing session/live state and number of active spirals.

Navigation items, in this order:

1. **Monitor** — live session telemetry and interventions.
2. **Guardrails** — limits and automated behavior.
3. **Sessions** — historical session outcomes.
4. **Tools** — connections to AI coding tools.
5. **Settings** — account, notifications, privacy, data, and plan.

The active navigation item has a quiet raised background, not a loud colored treatment.

### Authentication

**Purpose:** a simple entry screen, not a feature-rich marketing page.

- TokenGuard wordmark.
- Headline: “A protected coding experience.”
- Email and password fields.
- Primary action: “Sign in.”
- Secondary action: “Sign in with Google.”
- Small registration link.

This is the one screen that may use a very restrained soft black/gray atmospheric background. Keep it monochrome; no colorful mesh gradients or bright decorative effects.

### Onboarding

Two calm steps after sign-in:

1. **Connect your tools**
   - Select supported AI tools from cards.
   - Each card has a tool icon, name, capability state, and plain language status: “Connected,” “Ready to connect,” or “Coming later.”
   - A confirmation dialog explains that a local connector command will run only after approval.
   - Allow “Skip for now.”
2. **Set your limits**
   - Session token cap.
   - Monthly budget cap.
   - Burn-rate alert threshold.
   - Repeated-edit threshold and time window.
   - Auto-stop spirals toggle.
   - Finish action: “Start monitoring.”

Show a small, unobtrusive two-step progress indicator.

## 5. Screen specifications

### A. Monitor — the primary screen

This is the product’s home screen and must be exceptionally legible. It answers: *What is happening right now? Is it safe? What should I do?*

#### Header

- Small eyebrow: “Live monitor.”
- Main title: “Session telemetry.”
- Supporting sentence: “Cost, context, and loop signals from the current coding session.”
- On the right, a compact status pill with a dot and plain-language state such as “Session events are streaming from the daemon.”

#### Live session overview card

A large card titled **“Current session at a glance.”**

Top-left status pill:

- Green dot + “Session live” when healthy.
- Orange/red dot + “Attention needed” when a guardrail is active.

Show compact metadata tiles:

- Tool: Codex, Claude Code, etc.
- Model: for example `gpt-5.6-terra`.
- Runtime: `00:53`.
- Session: abbreviated ID.

On the right, a compact action/summary panel with:

- Tokens.
- Cost.
- Burn rate.
- Context percentage.
- Destructive-outline action: **Stop agent**.
- Secondary action: **Review guardrails**.

Below the metadata, reserve a full-width alert area:

- Normal: “No active spiral detected.”
- Active spiral: “Likely spiral detected in `src/api/routes.ts`” with edit count and elapsed time.
- Active actions: **Continue anyway** and **Stop this session**.

#### Metric cards

Four equal cards in one row on desktop; two by two on tablet; one column on mobile:

1. **Tokens this session** — large number and small `+N / min` detail.
2. **Session cost** — large dollar amount and model label.
3. **Context window** — percentage plus a thin progress bar. Mention remaining room or risk plainly.
4. **Spirals caught today** — count plus “N stopped | N ongoing.”

Use green, amber, or red only for the changing value or status indicator, never by washing the entire card with color.

#### Burn rate chart

A wide, single-line chart labeled **Burn rate** with the subtitle “Actual burn versus expected linear rate.”

- Chart period controls: `5m`, `20m`, `1h`, `Session`.
- Two lines maximum: normal burn in green/neutral and escalating burn in red only after a threshold breach.
- A subtle dashed threshold line.
- Empty state: “No burn-rate samples yet. Start a live IDE session or run a smoke script and the chart will begin filling in.”
- Do not use filled area charts, gradients, or unnecessary grid lines.

#### Recent activity / intervention timeline

Below the chart, show an event feed with compact rows:

- “Codex session started.”
- “Context reached 68%.”
- “Repeated edit loop detected: `src/api/routes.ts`.”
- “User chose Continue anyway.”
- “Session stopped due to session cap.”

Rows include a timestamp, quiet category icon, short event text, and a status color only when meaningful.

### B. Guardrails

**Purpose:** Configure the rules TokenGuard uses to warn, pause, or stop a session.

Page heading: **Guardrails**

Subtitle: “Set limits for spend, context pressure, and repeated edit loops.”

Use grouped setting cards with simple labels, one-sentence explanations, numeric inputs, selectors, and toggles. Avoid a dense admin-table feeling.

#### Group 1: Spend limits

- **Session token cap** — maximum tokens for one session.
- **Monthly budget** — maximum spending for the month.
- **Monthly budget warning** — percentage at which to warn.
- **Hard stop at session cap** — toggle.
- **Hard stop at monthly budget** — toggle.

#### Group 2: Spiral detection

- **Repeated edits before warning** — default concept: 3–4 edits.
- **Time window** — default concept: 5 minutes.
- **Automatically stop likely spirals** — toggle.
- Short helper text: “TokenGuard watches for repeated writes to the same file without meaningful interruption.”

#### Group 3: Context and pace

- **Burn-rate warning threshold** — tokens per minute.
- **Context window warning** — percentage.
- **Context alerts enabled** — toggle.
- **Prompt rate limit** — optional advanced setting with count and time window.

#### Group 4: Recovery and data

- **Rollback on hard stop** — advanced toggle, clearly explain it is optional and potentially disruptive.
- Show “Last saved” feedback and a quiet “Reset to defaults” text action.

Persisting controls should have immediate optimistic feedback, then a small “Saved” confirmation. Do not use a giant permanent save button unless the interaction model requires it.

### C. Sessions — history and outcomes

**Purpose:** show whether TokenGuard is saving time and money over time.

Header:

- Eyebrow: “History.”
- Title: “Sessions.”
- Description: “Review spend, duration, and intervention outcomes over time.”
- Right-side action: **Export CSV**.

Summary cards:

- Total sessions.
- Total spent.
- Total saved.
- Spirals caught.

Filters:

- Last 30 days.
- All tools.
- Only sessions with spirals.

Desktop table columns:

| Date | Tool | Duration | Tokens in | Tokens out | Cost | Spirals detected | Spirals stopped | Savings |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |

Use a compact data table with stable columns, restrained dividers, and monospace numeric cells. A spiral count can use a small red or amber badge; savings use green text.

Empty state: “No sessions recorded yet. Once TokenGuard captures live sessions, this page will show spend, duration, and spiral outcomes.”

### D. Tools — integrations

**Purpose:** show every AI coding environment TokenGuard can monitor and make connection status obvious.

Header:

- Eyebrow: “Connections.”
- Title: “Tools.”
- Description: “Connect the coding environments TokenGuard should monitor.”

Use a two-column card grid on desktop. Each tool card contains:

- Tool icon.
- Tool name.
- Capability badge: `Ready now` or `Coming later`.
- Current status: Connected, Connecting, Not connected, or Needs attention.
- Last seen timestamp when connected.
- Action: Connect, Reconnect, or View setup.

Tools to represent:

- Codex — primary supported connector.
- Claude Code — supported connector.
- Cursor, Windsurf, GitHub Copilot, Bolt, Lovable, Claude API, and OpenAI API — future/coming later cards unless implemented.

Include one quiet privacy note at the bottom: “TokenGuard connects through local session logs, IDE hooks, and API proxies. It collects metadata, not prompt content.”

### E. Settings

**Purpose:** personal and workspace preferences, not core monitoring behavior.

Use narrow readable content and simple stacked sections.

1. **Account** — profile, plan, billing action.
2. **Notifications** — email alerts, budget warnings, weekly reports.
3. **Privacy and security** — metadata-only collection explanation, export data action.
4. **Danger zone** — sign out; use a thin red outline, not a solid red block.

### F. Empty, error, and confirmation states

Design these as first-class screens or overlays:

- Daemon offline: explain that the monitor must be running, offer a “Try again” action, and retain navigation.
- Connection failed: explain which tool needs attention and how to retry.
- Confirm stop: a compact modal asking “Stop this session?” Explain that TokenGuard will record the reason and resolve active spirals. Offer Cancel and Stop session.
- Spiral intervention: a focused modal/drawer that identifies the file, count, time window, and a short recommendation. Actions: Continue anyway and Stop this session.
- Tool install: a confirmation modal explaining that a local setup command will run only after approval.

## 6. Data concepts and UI behavior

### Live session data

The monitor may receive these fields:

- Session ID, tool, model, start time, and session status.
- Token input/output totals and total tokens.
- Session and monthly cost.
- Token burn rate per minute.
- Context used, context capacity, and context percentage.
- Number of spirals detected today.
- Active spirals, including file path, edit count, start time, and estimated wasted cost.
- Latest budget threshold warning.
- Latest stop reason and stop timestamp.

Handle missing data gracefully. Show an em dash, `0`, or “Not reported yet” depending on context. Never invent live metrics.

### Spiral behavior

A spiral is a repeated-edit loop in one file during a short period. It is important enough to appear in:

- The Monitor overview card.
- The alert/intervention panel.
- The active-spiral count in the app footer.
- The Sessions history outcome columns.

When a spiral is active:

- Use `status/danger` for the small dot, count, badge text, and focused alert boundary.
- Keep the rest of the interface neutral.
- Allow one restrained pulse animation on the status dot only.
- Surface the file path in monospace.
- Make the decision actions unambiguous.

### Guardrail behavior

Warnings use a progression:

- **Healthy:** green dot or neutral text.
- **Approaching a limit:** amber value/dot and a short action-oriented explanation.
- **Needs intervention:** red status dot/badge and an explicit decision.
- **Stopped/resolved:** return to neutral/green and preserve the outcome in the event timeline.

## 7. Visual direction

### Overall aesthetic

**Calm, minimal, AI-native.** Reference the restraint of Linear, Obsidian, Raycast, Vercel dashboards, and modern OpenAI/Codex surfaces.

The application should look expensive because it is quiet and organized, not because it is flashy.

Avoid:

- Neon colors.
- Cyberpunk, terminal, hacker, or radar aesthetics.
- Scan lines, noise textures, particle fields, and decorative circles.
- Gradients in the application UI.
- Excessive shadows.
- Large color blocks for ordinary content.
- More than one visual focal point per screen.

### Dark color tokens

Use dark mode as the primary designed state.

| Token | Value | Use |
| --- | --- | --- |
| `bg/page` | `#0C0C10` | deepest page canvas |
| `bg/panel` | `#111116` | rail, sidebar, secondary surfaces |
| `bg/card` | `#17171E` | cards and raised main regions |
| `bg/elevated` | `#1E1E28` | hover, inputs, tooltip, nested panels |
| `bg/overlay` | `#13131A` | modal and drawer surface |
| `border/subtle` | `rgba(255,255,255,0.06)` | standard dividers and cards |
| `border/default` | `rgba(255,255,255,0.10)` | interactive outlines |
| `border/strong` | `rgba(255,255,255,0.16)` | focus and selected state |
| `text/primary` | `#E8E8F0` | headings and important labels |
| `text/secondary` | `#8E8EA8` | body copy |
| `text/muted` | `#52526A` | hints, timestamps, placeholders |
| `text/disabled` | `#33334A` | disabled copy |
| `status/ok` | `#3DAD78` | healthy, resolved, saved |
| `status/warn` | `#D4874A` | rising burn or near-limit state |
| `status/danger` | `#E05555` | active spiral and critical limit |
| `status/info` | `#4A8FD4` | neutral informational state |
| `accent` | `#6E6AE8` | one primary CTA at a time |

Light mode can be designed later using the same structure: `#F7F7F8` page, `#EFEFF2` panel, white cards, and muted charcoal text. Do not mix dark and light surface conventions in the same screen.

### Typography

Use **Inter** for all interface copy and headings. Use **JetBrains Mono** only for data: token counts, dollar amounts, timestamps, model names, IDs, and file paths.

| Role | Style |
| --- | --- |
| Display / app hero | Inter 600, 28px, line-height 1.2, tracking -0.4px |
| Page title / panel title | Inter 500, 15–20px, tight but not bold-heavy |
| Label / nav item | Inter 500, 12px |
| Body | Inter 400, 13px |
| Caption | Inter 400, 11px, tracking 0.2px |
| Data | JetBrains Mono 400, 12px |
| Large metric | JetBrains Mono 500, 22–28px |

Use weight sparingly. Prefer hierarchy through spacing, size, and contrast rather than many bold weights.

### Spacing, shape, and depth

- Base spacing scale: 4, 8, 12, 16, 20, 24, 32px.
- Standard page padding: 24–28px desktop, 16–20px tablet/mobile.
- Card padding: 16px for compact metrics; 20–24px for primary panels.
- Card corner radius: 12–18px; keep radius consistent across the app.
- Inputs and buttons: 10–12px radius.
- Borders are thin and low-contrast. Prefer a surface-level change over a strong shadow.
- If glass blur is used, keep it extremely subtle and functional; the visual system should still work without blur.

### Buttons and controls

- **Primary CTA:** accent-purple fill, white text, used once per focused area.
- **Secondary button:** `bg/elevated` or transparent with `border/default`.
- **Destructive action:** transparent or dark-tinted background with thin danger border and danger text. Reserve solid danger fills for the final confirmation step only.
- **Toggles:** compact, accessible labels; green only when enabled and meaningful.
- **Pills:** use for filter state, connection state, time range, and status—not as generic decoration.
- **Icons:** thin, simple Lucide-style line icons at 16–20px.

## 8. Interaction, responsiveness, and accessibility

### Interaction principles

- Every interactive element needs a clear hover, focus, disabled, and loading state.
- Favor inline feedback over toasts when the result changes a guardrail or session state.
- Use confirmation dialogs for stopping a session, running a local connector installer, exporting data, and destructive actions.
- Update live telemetry with subtle number transitions; do not animate charts or cards continuously just to imply activity.
- Do not hide important state behind hover-only behavior.

### Responsive behavior

- **Desktop (1024px+):** expanded/collapsible rail, four metric cards, two-column tool grid, full history table.
- **Tablet (768–1023px):** keep icon rail or compact top navigation, use two metric columns, stack the session overview’s action panel beneath metadata when needed.
- **Mobile (<768px):** replace rail with a compact top bar or bottom navigation; use one metric column; convert session history table to stacked session cards; keep intervention buttons full-width and thumb-friendly.

### Accessibility

- Maintain accessible color contrast; status color cannot be the only signal.
- Show text labels alongside green/amber/red dots.
- Use visible keyboard focus outlines with `border/strong` or accent.
- Ensure all charts have a text summary and accessible tooltip values.
- Make file paths selectable and wrap safely on narrow layouts.
- Use plain language in alerts: say what happened, why it matters, and the next action.

## 9. Suggested realistic prototype content

Use believable examples, but clearly mark them as sample data when the UI is not live.

### Healthy session example

- Tool: Codex
- Model: `gpt-5.6-terra`
- Runtime: `00:53`
- Tokens: `142,600`
- Cost: `$2.41`
- Burn: `8,200 / min`
- Context: `68%`
- Active spiral: “No active spiral detected”

### Intervention example

- Status: “Likely spiral detected”
- File: `src/api/routes.ts`
- Activity: `4 edits in 3m 12s`
- Estimated waste: `$0.46`
- Recommendation: “The agent has repeatedly edited this file without a successful break in activity. Review the changes before continuing.”
- Actions: “Continue anyway” and “Stop this session”

### History example

- Jul 18, 2026 · Codex · 34m · 182k tokens · `$3.08` · 1 spiral detected · 1 stopped · `$0.74` saved
- Jul 17, 2026 · Claude Code · 52m · 248k tokens · `$4.16` · 0 spirals · `$0.00` saved

## 10. Final build instruction for Google Stitch

Create a polished high-fidelity frontend for **TokenGuard**, a desktop-first dark-mode application that monitors AI coding sessions for cost, token use, context pressure, and repeated-edit loops. Include Auth, a two-step onboarding flow, Monitor, Guardrails, Sessions, Tools, and Settings. Use a quiet near-black palette, Inter typography, JetBrains Mono for data, thin low-contrast borders, restrained status dots, and a collapsible left navigation rail. Design rich live, empty, offline, sample-data, and intervention states. The application must feel calm and trustworthy: no gradients in product pages, no neon cyberpunk styling, no radar effects, and no decorative visual clutter. Prioritize clarity of live status, spiral intervention, and guardrail configuration.
