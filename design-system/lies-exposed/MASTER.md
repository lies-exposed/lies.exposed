# Design System Master File (ui-ux-pro-max v2 — reconciled with repo brand)

> **LOGIC:** When building a specific page, first check `services/{web,admin}/design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this file.
> Full canonical source: `packages/@liexp/ui/DESIGN_SYSTEM.md` (MUI implementation details live there).
> This file is the v2 ui-ux-pro-max quick-reference, reconciled 2026-11-17 to match the shipped brand tokens.

---

**Project:** lies.exposed
**Generated:** 2026-11-17 (ui-ux-pro-max v2.15) · **Reconciled** with `packages/@liexp/ui/src/theme/index.ts` and `services/admin/src/theme.ts`
**Category:** News/Media Platform

---

## Global Rules

### Color Palette

Matches the shipped MUI theme. CSS variables below are semantic aliases; in code, use MUI theme palette (`theme.palette.primary.main` etc.) — never hardcode hex (see canonical master).

| Role | Hex | CSS Variable | Notes |
|------|-----|--------------|-------|
| Primary | `#FF5E5B` | `--color-primary` | Coral Red — web CTA, emphasis; admin: becomes **secondary** |
| Secondary | `#17B9B6` | `--color-secondary` | Teal — web accents; admin: becomes **primary** |
| Accent/CTA | `#FF5E5B` (web) / `#17B9B6` (admin) | `--color-accent` | Service-dependent, see theme files |
| Background | `#121212` | `--color-background` | Dark mode is default |
| Card/Surface | `#1e1e1e` | `--color-card` | MUI `background.paper` |
| Foreground | `#ffffff` | `--color-foreground` | Text primary (dark mode) |
| Muted Foreground | `rgba(255,255,255,0.6)` | `--color-muted-foreground` | Secondary text, metadata |
| Border | `#2d2d2d` | `--color-border` | Dividers, outlines |
| Success | `#10B981` | `--color-success` | Verified / complete states |
| Warning | `#F59E0B` | `--color-warning` | Pending / attention |
| Destructive/Error | `#EF4444` | `--color-destructive` | Failed actions, destructive ops |
| Info | `#3B82F6` | `--color-info` | Informational hints |

**Color notes:** Editorial coral + teal on near-black. Admin swaps primary/secondary roles deliberately (teal-forward for data-dense backoffice). Light mode alternative exists in the canonical master.

### Typography

- **Heading/UI Font:** Signika (400/600/700)
- **Body/Prose Font:** Lora (400/500/600/700), Georgia serif fallback
- **Mood:** editorial, trustworthy, readable, research-oriented

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Signika:wght@400;600;700&family=Lora:wght@400;500;600;700&display=swap');
```

Type scale, MUI `createTheme` wiring, and usage rules: see canonical master §Typography System.

### Spacing Variables

4px base unit — matches existing MUI spacing (`spacing: (f) => 0.25 * f rem`).

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

Maps to MUI elevation levels (use `<Card elevation={n}>`, not custom shadows).

| Level | MUI Elevation | Usage |
|-------|---------------|-------|
| `--shadow-sm` | 1 | Cards at rest |
| `--shadow-md` | 2–3 | Hovered cards, dropdowns |
| `--shadow-lg` | 4 | Modals, popovers |
| `--shadow-xl` | 8+ | Floating elements, sticky headers |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 4px | Small buttons, tags, chips |
| `md` | 8px | Default (MUI `shape.borderRadius: 8`) |
| `lg` | 12px | Large containers, modals |
| `full` | 9999px | Pills, avatars |

---

## Style Guidelines

**Style:** Minimalism & Swiss Style — clean, spacious, functional, high contrast, grid-based. Fits an information-dense fact-checking platform.

**Key Effects:** Subtle hover (200–250ms), smooth transitions, minimal shadows, clear type hierarchy, fast loading.

### Page Pattern

**Hero-Centric Design** for marketing/home surfaces: one primary CTA, hero dominant, value prop strip, proof/benefits, sticky nav CTA. Static hero + non-pulsing CTA under reduced motion; keyboard-operable media controls.

For app surfaces (explore, entity detail, events), follow the service page overrides in `services/web/design-system/pages/`.

---

## Anti-Patterns (Do NOT Use)

- ❌ Cluttered layout — this is an information-dense product; hierarchy and whitespace are trust signals
- ❌ Slow loading
- ❌ **Emojis as icons** — use SVG (Heroicons primary, Lucide fallback), per canonical master
- ❌ **Hardcoded colors/pixels** — use `theme.palette.*` and `theme.spacing()` (MUI)
- ❌ **Layout-shifting hovers** — avoid scale transforms; use elevation/color changes
- ❌ **Low contrast text** — 4.5:1 minimum (note coral `#FF7976` bright variant in dark mode for CTA on dark surfaces)
- ❌ **Instant state changes** — transitions 150–300ms
- ❌ **Invisible focus states** — focus must be visible for keyboard nav
- ❌ **Color-only status indication** — pair status colors with icons/text (verified/pending/failed states)

---

## Pre-Delivery Checklist

- [ ] No emojis used as icons (SVG only, consistent set)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150–300ms), no layout shift
- [ ] Text contrast 4.5:1 minimum in **both** light and dark mode (dark is default)
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Status not conveyed by color alone
- [ ] Touch targets ≥ 44×44px
- [ ] Responsive: 375px, 768px, 1024px, 1440px (MUI breakpoints xs/sm/md/lg/xl)
- [ ] Loading and error states present for async operations
- [ ] Semantic HTML + ARIA labels on icon buttons

---

## Hierarchy & Implementation Map

```
Page overrides:        services/{web,admin}/design-system/pages/*.md   ← highest precedence
Service overrides:     services/{web,admin}/design-system/MASTER.md
Quick-reference (v2):  design-system/lies-exposed/MASTER.md            ← this file
Canonical master:      packages/@liexp/ui/DESIGN_SYSTEM.md             ← full MUI specs
Live tokens (source of truth for values):
  ├─ packages/@liexp/ui/src/theme/index.ts   (shared theme, web colors)
  └─ services/admin/src/theme.ts             (admin: teal primary / coral secondary)
```

When the generator (`~/.opencode/skills/ui-ux-pro-max/scripts/search.py`) recommends values that conflict with these files, **the shipped theme tokens win** — regenerate with brand-aligned queries instead of changing product colors.
