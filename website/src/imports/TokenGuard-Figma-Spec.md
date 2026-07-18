# TokenGuard — Figma Redesign Specification
### From: brand system v1 (high-contrast neon-dark)
### To: calm, minimal, AI-native — Linear / Obsidian / Codex register

---

## Why This Redesign Exists

The previous design (v1) used neon-red danger colors, scan-line textures, radar rings, and JetBrains Mono as a display face. It communicated "hacker terminal." The reference apps — Linear, Obsidian, Raycast, Vercel dashboard, Codex — communicate something quieter: "this tool is so confident it doesn't need to shout." The redesign strips everything decorative and makes every element earn its place through function, not flair.

The rule to work by: **if you can remove it and the meaning survives, remove it.**

---

## Reference Apps — What to Study Before Touching Figma

Before making any changes, open these and spend 10 minutes in each:

- **Linear** — notice how the sidebar uses a single gray for all nav items, only the active item gets a white fill. Notice the total absence of border radius variation — everything is the same subtle rounding. Notice there are zero gradients anywhere in the app UI (only the marketing site uses them). The app itself is monochrome with one accent color used sparingly.
- **Obsidian (default dark theme)** — notice the three-pane layout: narrow icon rail → file tree → main content. Each pane is a slightly different shade of the same near-black. No hard borders between panes — depth comes from the 3–4% lightness difference between surfaces.
- **Raycast** — notice how status is communicated through a single colored dot or badge, never through color-washing an entire card. The rest of the card is always neutral gray.
- **Vercel dashboard** — notice how data-heavy pages use pure monospace black text on white cards. The only color is a green/red dot for deployment status. Everything else is grayscale.
- **Codex / OpenAI platform** — notice the extreme typographic restraint. One font size for body, one slightly larger for headings. No bold used mid-sentence. Muted text is genuinely muted — closer to 40% opacity than 60%.

---

## What to Delete From the Current Design

Remove every instance of the following from all frames before starting the redesign:

- All `radial-gradient` backgrounds and glow effects on any element
- All scan-line texture overlays
- All radar/pulse ring animations on static frames (keep only on the active spiral indicator, one instance)
- `#F25757` used as a fill on anything other than: the wordmark accent letter, active spiral badge text, and the danger metric value
- `JetBrains Mono` as the logo/display typeface — it stays only for raw data strings (token counts, costs, file paths, timestamps)
- All `border: 1px solid` replaced with `border: 1px solid` at no more than 8% opacity on dark surfaces
- The gradient swatch cards in the brand palette — color roles stay, gradient presentation goes
- Any element with more than one color ramp applied to it simultaneously

---

## New Design Tokens

Replace all color variables in the Figma local styles with these exact values. Delete any old styles not listed here.

### Surface hierarchy (dark — primary mode)
```
bg/page         #0C0C10    ← deepest, page background
bg/panel        #111116    ← sidebar, secondary panels
bg/card         #17171E    ← raised cards, main content areas
bg/elevated     #1E1E28    ← dropdowns, tooltips, hover states
bg/overlay      #13131A    ← modals, drawers background
```

### Surface hierarchy (light — secondary mode, build after dark is done)
```
bg/page         #F7F7F8
bg/panel        #EFEFF2
bg/card         #FFFFFF
bg/elevated     #F2F2F5
bg/overlay      #FAFAFA
```

### Border
```
border/subtle   rgba(255,255,255,0.06)   ← most dividers, card outlines
border/default  rgba(255,255,255,0.10)   ← interactive element outlines
border/strong   rgba(255,255,255,0.16)   ← focused inputs, selected items
```

### Text
```
text/primary    #E8E8F0    ← headings, labels, important body
text/secondary  #8E8EA8    ← body copy, descriptions
text/muted      #52526A    ← placeholders, hints, timestamps
text/disabled   #33334A    ← disabled state text
```

### Status (use only for the specific semantic meaning — nowhere else)
```
status/danger   #E05555    ← spiral active, budget critical
status/warn     #D4874A    ← burn rate elevating, budget >70%
status/ok       #3DAD78    ← safe state, resolved, guardrails on
status/info     #4A8FD4    ← neutral data, informational
```

### One accent
```
accent          #6E6AE8    ← one place only: primary CTA button fill
```

### Typography
```
Display:  Inter 600 · 28px · tracking -0.4px   ← app name, onboarding hero
Heading:  Inter 500 · 15px · tracking -0.1px   ← panel titles, page headers
Label:    Inter 500 · 12px · tracking 0px       ← nav items, card labels
Body:     Inter 400 · 13px · tracking 0px       ← descriptions, body copy
Caption:  Inter 400 · 11px · tracking 0.2px    ← timestamps, hints
Data:     JetBrains Mono 400 · 12px            ← all numbers, paths, costs
Data/lg:  JetBrains Mono 500 · 22px            ← metric values (284k, $2.41)
```

Note: Inter replaces Space Grotesk. Inter is what Linear, Vercel, and Notion all use. It is the reference app standard at this aesthetic register.

---

## Layout Structure — App Shell

The app uses a fixed three-zone layout. Do not deviate from this structure across any page.

```
┌─────────────────────────────────────────────────────┐
│  RAIL (48px wide, fixed)                             │
│  Icon-only navigation. No text labels visible.      │
├──────────┬──────────────────────────────────────────┤
│  SIDEBAR │  MAIN CONTENT                            │
│  (220px, │  (fills remaining width)                 │
│  fixed)  │                                          │
│          │                                          │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

**Rail** — `bg/panel`, 48px wide, contains 5–6 icon buttons stacked vertically with 8px gap. Icons are 16×16px, neutral `text/muted` color when inactive, `text/primary` when active. No background highlight on active — only icon color change. Bottom-pinned: settings icon. No tooltips in static frames.

**Sidebar** — `bg/panel`, 220px wide, slightly lighter than rail by 2–3% (see surface tokens). Contains section heading (`text/muted`, 10px, uppercase, `letter-spacing: 0.1em`) then nav items. Active nav item: `bg/elevated` fill, full width, 6px border-radius, `text/primary`. Inactive: no fill, `text/secondary`. No icons in sidebar nav — text only.

**Main content** — `bg/card` or `bg/page` depending on page. Standard padding: 28px horizontal, 24px top. Content max-width: none (full width). No inner card wrapper on pages that are already data-dense — the surface color is the container.

---

## Page Inventory — Build These 5 Pages

### Page 1: Live Monitor (default landing page)

The page the user lands on when a session is active. The previous design had this as the only page — it now becomes one of five.

**Header row** — page title "Monitor" in `Heading` style left-aligned. Right: session pill showing active IDE + model in `Caption/Data` style. Status dot (8px circle, `status/ok` or `status/danger`) before the pill.

**Metric row** — 4 cards in a `gap: 12px` horizontal grid. Each card: `bg/elevated`, 1px `border/subtle`, 12px border-radius, 16px padding. Inside: `Caption` label top, `Data/lg` value below. Value color inherits the appropriate status token if in a danger/warn state, otherwise `text/primary`. No top-accent bar (this was v1 — remove it).

**Burn rate chart** — full width, 200px tall. Line chart only, no fills. Two lines maximum: one `status/ok` for the normal phase, one `status/danger` for the spiral phase. Threshold line: 1px dashed, `border/default`. No chart card wrapper — the chart sits directly on the page surface. X-axis labels in `Caption` style, `text/muted`. No Y-axis label.

**Two-column section below chart:**
- Left (60% width): Loop Detector. Title in `Heading`. List of file items — each row is 44px tall, `border-bottom: 1px border/subtle`, no card per row. Columns: status dot (8px) · filename in `Data` style · edit-count badge · time elapsed in `Caption/text/muted`. Active rows: status dot is `status/danger`, animated blink. Resolved: `status/ok`, static.
- Right (40% width): Budget bars. Title in `Heading`. Three bar rows (session, monthly, context window). Each: label in `Label` + value in `Data` right-aligned on same row, then 4px tall track below. Track: `bg/elevated`. Fill: appropriate status color. No numeric percentage in the bar — only in the label row.

---

### Page 2: Guardrails

Where users configure their enforcement rules. This is a settings-pattern page.

**Layout** — single column, max-width 560px, centered in the main content zone. No sidebar within the page.

**Section pattern** — repeated for each rule group:
- Section title in `Heading` style with a `border-bottom: 1px border/subtle` below it and 16px margin-bottom
- Rule rows: each row is 56px tall, flex row. Left: rule name in `Label` + rule description in `Caption/text/muted` below it. Right: either a toggle (on/off) or a number input with stepper (for numeric thresholds like "300k tokens").

**Toggle design** — 36px × 20px pill. Off state: `bg/elevated` track, `border/default` stroke, white thumb. On state: `status/ok` fill, no stroke, white thumb. No intermediate states in static frames.

**Number input design** — 80px wide, `bg/elevated` fill, `border/default` stroke, 8px radius. Value in `Data` style centered. Stepper arrows (`▲ ▼`) at 10px, `text/muted`, right-side stacked. Label to the left of the input in `Label` style.

**Rule groups to include:**
1. Spiral detection — threshold edits per file (default: 3), time window (default: 5 min), toggle for auto-stop
2. Token caps — session max (default: 300k), hard stop toggle
3. Budget — monthly dollar cap, warning threshold %, hard stop toggle
4. Context window — warn at % full (default: 75%), toggle
5. Prompt rate — prompts per N minutes, toggle (off by default)

---

### Page 3: Session History

A log of all past sessions with cost breakdowns.

**Layout** — full-width table. No inner card.

**Table header row** — `Caption` style, `text/muted`, `border-bottom: 1px border/default`. Columns: Date · IDE / Model · Duration · Tokens · Cost · Spirals blocked · Saved.

**Table data rows** — 48px tall, `border-bottom: 1px border/subtle`. Date in `Caption/text/muted`. IDE+model in `Label`. Duration, tokens, cost in `Data` style. Spirals blocked: if >0, show count as a small badge (`status/danger` background at 10% opacity, `status/danger` text, 4px radius). Saved: `status/ok` text color.

**Above table: three summary stat cards** — same design as Page 1 metric cards. Show: Total spend this month · Total tokens this month · Total saved from spirals.

**Row hover state** — `bg/elevated` fill on hover, full row width, no border change.

---

### Page 4: Tools

Where users connect their IDEs and API keys.

**Layout** — grid of tool cards, `gap: 12px`, 2 columns.

**Tool card** — `bg/elevated`, `border/subtle`, 12px radius, 20px padding. Contains: tool icon (24×24 SVG, `text/secondary` tint) · tool name in `Label` · status line in `Caption/text/muted` ("Connected · 1.2M tokens this month" or "Not connected"). Right side: connection status badge. If connected: `status/ok` dot + "Connected" in `Caption`. If not: outlined button "Connect" in `Label` style, `accent` border color, `accent` text.

**Tools to include in the grid:**
- Cursor
- Windsurf
- Claude Code
- GitHub Copilot
- Bolt
- Lovable
- Claude API (direct)
- OpenAI API (direct)

**Below grid: a note row** — `Caption/text/muted` — "TokenGuard connects via IDE hooks and API proxies. No prompt content is ever read — only metadata."

---

### Page 5: Onboarding (3-step flow)

Shown only on first launch. Three screens, each full-viewport.

**Step 1 — Welcome**
Center-aligned, vertically centered in viewport. Logo mark (32px) · wordmark (Display style) · one-line tagline in `Body/text/secondary`. Below: two-line description of what TokenGuard does, `Body` style, `text/secondary`, max-width 400px. Primary CTA button: "Get started" — `accent` fill, white `Label` text, 40px tall, 16px horizontal padding, 8px radius. Below button: `Caption/text/muted` "Takes 2 minutes. No account required."

**Step 2 — Connect your first tool**
Reduced version of the Tools page — same card grid but selectable. Instruction row above: "Select the tools you use" in `Heading`. Cards show a selection state: selected = `border/strong` at 2px, `accent` color, checkbox in top-right corner. Unselected = default card style. CTA: "Continue" button (same style as step 1).

**Step 3 — Set your budget**
Single column, 400px max-width centered. Two inputs: Monthly budget ($) and Session cap (tokens). Same input design as Guardrails page. Below: simplified toggle for "Auto-stop spirals" — pre-toggled on. CTA: "Start monitoring". Below: `Caption/text/muted` — "You can change these any time in Guardrails."

---

## Component Replacements — What Changes in the Component Library

### Danger alert banner
**Old:** Red-washed background, high-opacity red border, bold red title, scan-line texture behind.
**New:** `bg/elevated` background. Left border accent only: `4px solid status/danger` at the left edge, `border-radius: 0` on that edge, `8px` on the other three. Title in `Label/text/primary`. Subtitle in `Caption/text/muted`. Action buttons right-aligned. No fill wash. This is how Linear handles destructive states — contained, quiet, unambiguous.

### Metric card
**Old:** `bg/surface2` with a colored 2px top bar and colored metric value always.
**New:** `bg/elevated`, no top bar, no border. Metric value is `Data/lg` in `text/primary` unless in a danger/warn state (then the appropriate status color). Label is `Caption/text/muted` above. Delta line is `Caption/text/muted` with directional arrow. The card communicates status through the value color alone — nothing else.

### Loop detector row
**Old:** Per-row colored card background for active loops.
**New:** Flat row with `border-bottom` only. Status communicated by the 8px dot color and the edit-count badge. No card background per row. Active rows do not get a fill — the dot blinks instead.

### Toggle
**Old:** Custom styled with thick pill, green glow effect on active.
**New:** Standard pill, 36×20px. On: `status/ok` fill, no glow, no shadow. Off: `bg/elevated` fill, `border/default` stroke. Thumb: white circle, 14px, 3px from edge. Clean, Obsidian-style.

### Navigation item (sidebar)
**Old:** No sidebar existed — all content was one page.
**New:** 40px tall, full-width, 8px horizontal padding, 6px border-radius. Active: `bg/elevated` fill, `text/primary`. Inactive: no fill, `text/secondary`. Hover: `bg/elevated` at 50% opacity. No icons. No badges unless a count is functionally necessary (e.g. "3 active spirals" on the Monitor nav item — shown as a muted pill, not a red dot).

### Badge / status pill
**Old:** High-opacity colored backgrounds with matching colored borders.
**New:** Status color at 10–12% opacity for background, status color at 100% for text, no visible border (the background provides enough contrast). `Caption` font size. 4px border-radius (not fully rounded — pills are for counts only).

---

## Spacing System

Use an 8px base grid throughout. The only allowed spacing values are:

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64`

Do not use 10, 14, 18, 30, or any non-8-grid value. Component internal padding uses 4px increments (4, 8, 12, 16). Page-level spacing uses 8px increments (16, 24, 32, 48).

---

## Interaction States to Document in Every Component

For every interactive component, include these states as variants in Figma:

`Default → Hover → Active/Pressed → Focused (keyboard) → Disabled`

Hover state rule: always `bg/elevated` background, never a color change. Only danger/destructive buttons change color on hover (darken slightly). No scale transforms.

---

## What to Absolutely Not Do

- Do not add glassmorphism (`backdrop-filter: blur`) to any element. It was trendy in 2022.
- Do not use more than one status color on the same card. A card is either in a danger state or it isn't.
- Do not use gradients inside the app UI. Gradients are for the marketing landing page only.
- Do not use `font-weight: 700` anywhere. The heaviest weight in the app is 600, used only for the wordmark.
- Do not use shadows. Depth is created by surface color steps, not shadows.
- Do not add decorative dividers with gradient fades. Use `1px border/subtle` or nothing.
- Do not animate more than one element per user action. One thing moves at a time.

---

## Files to Create in Figma

```
TokenGuard.fig
├── Page: 🎨 Design Tokens        ← color styles, text styles, spacing reference
├── Page: 🧱 Components           ← all components with all states
├── Page: 01 Onboarding           ← 3 frames (step 1, 2, 3)
├── Page: 02 Live Monitor         ← 2 frames (idle state, spiral active state)
├── Page: 03 Guardrails           ← 1 frame
├── Page: 04 Session History      ← 1 frame
├── Page: 05 Tools                ← 1 frame (connected) + 1 frame (empty/onboarding)
└── Page: 📱 Mobile               ← optional, defer to v2
```

Each frame is 1440×900px (standard laptop viewport). Use auto-layout on all frames. Name every layer — Figma's default "Frame 47" naming is not acceptable.

---

*Spec version: 2.0 — for TokenGuard Figma file*
*Replace design system v1 entirely — do not attempt to merge*
