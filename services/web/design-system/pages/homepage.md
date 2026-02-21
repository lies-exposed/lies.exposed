# Web Service Page Design: Homepage

**Parent Document**: `services/web/design-system/MASTER.md`  
**Applies to**: Landing page (`/`), public homepage

---

## Overview

The homepage is the entry point for most users. Design goals:
- **Trust building** - Immediately establish credibility
- **Discoverability** - Guide users to key content
- **Engagement** - Highlight recent fact-checks
- **Clarity** - Communicate the platform's value

---

## Page Layout

**Desktop**:
```
┌──────────────────────────────────────┐
│ HERO SECTION                         │
│ - Headline                           │
│ - Subheadline                        │
│ - Search bar                         │
│ - CTA button                         │
│ - Background image (subtle)          │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ FEATURED EVENTS SECTION              │
│ "Recent Fact-Checks" (3-4 cards)    │
│ [Event 1] [Event 2] [Event 3]       │
│ [View all →]                         │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ STATISTICS SECTION                   │
│ • 427 Events Tracked                 │
│ • 156 Actors Analyzed               │
│ • 48 Organizations                   │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ BROWSE CATEGORIES SECTION            │
│ [Events] [Actors] [Groups]          │
│ [Keywords] [Media] [Articles]       │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ METHODOLOGY SECTION                  │
│ - Explanation of fact-checking      │
│ - How verification works            │
│ - About the project                 │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ FOOTER                               │
└──────────────────────────────────────┘
```

---

## Section Specifications

### 1. Hero Section

```
┌──────────────────────────────────────────────────┐
│                                                   │
│  BACKGROUND: Subtle gradient or abstract image   │
│  (Low contrast overlay for text readability)     │
│                                                   │
│  H1: "Fact-Checking for the 21st Century"       │ (48px, bold)
│                                                   │
│  P: "Verify claims, explore evidence,           │ (18px, 1.6 line height)
│     and understand the facts behind the news"   │
│                                                   │
│  [Search bar]                                    │ (56px, full width or 600px max)
│  🔍 [Placeholder...]                            │
│                                                   │
│  [Primary CTA] [Secondary CTA]                  │
│  [Start Exploring] [Learn More ↓]              │
│                                                   │
│  Padding: 96px vertical, 48px horizontal       │
│                                                   │
└──────────────────────────────────────────────────┘
```

**Hero Properties**:
- Background: Gradient (dark #121212 → #1a1a1a) or subtle pattern
- Text color: White (#FFFFFF)
- Min-height: 600px (desktop), 400px (mobile)
- CTA buttons: Primary (coral #FF7976) + Secondary (outline)

### 2. Featured Events Section

```
┌──────────────────────────────────────────────────┐
│                                                   │
│ H2: "Recent Fact-Checks"                        │
│ "Explore the latest fact-checking investigations"│
│                                                   │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│ │Event Card│ │Event Card│ │Event Card│         │
│ └──────────┘ └──────────┘ └──────────┘         │
│                                                   │
│ [View all recent events →]                      │
│                                                   │
└──────────────────────────────────────────────────┘
```

**Properties**:
- 3 columns (desktop), 2 columns (tablet), 1 column (mobile)
- Gap: 24px between cards
- Padding: 64px vertical, 48px horizontal
- Background: Transparent (use surface color if needed)
- Cards: EventCard component (compact variant)

### 3. Statistics Section

```
┌──────────────────────────────────────────────────┐
│                                                   │
│                PLATFORM STATS                    │
│                                                   │
│ ┌──────────────┐ ┌──────────────┐ ┌────────────┐│
│ │ 427          │ │ 156          │ │ 48         ││
│ │ Events       │ │ Actors       │ │ Groups     ││
│ │ Tracked      │ │ Analyzed     │ │ Monitored  ││
│ └──────────────┘ └──────────────┘ └────────────┘│
│                                                   │
│ [More statistics ↓]                             │
│                                                   │
└──────────────────────────────────────────────────┘
```

**Properties**:
- 3 cards (desktop), 2 cards (tablet), 1 card (mobile)
- Each card: 200px width (desktop), 100% (mobile)
- Center-aligned text
- Large number: 64px, bold, primary color
- Label: 16px, secondary color
- Background: Gradient or accent color (subtle)

### 4. Browse Categories Section

```
┌──────────────────────────────────────────────────┐
│                                                   │
│ H2: "Browse by Category"                        │
│ "Find the information you're looking for"       │
│                                                   │
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐       │
│ │ 📅    │ │ 🔗    │ │ 👥    │ │ 🏢   │       │
│ │Events │ │Links  │ │Actors │ │Groups│       │
│ │(427)  │ │(892)  │ │(156)  │ │(48)  │       │
│ └───────┘ └───────┘ └───────┘ └───────┘       │
│                                                   │
│ ┌───────┐ ┌───────┐                            │
│ │ #️⃣    │ │ 🎬    │                            │
│ │Keywords│ │Media  │                            │
│ │(2,847) │ │(1,234)│                            │
│ └───────┘ └───────┘                            │
│                                                   │
└──────────────────────────────────────────────────┘
```

**Properties**:
- Grid: 4 columns (desktop), 2 columns (tablet), 1 column (mobile)
- Card size: 200x200px (desktop), 100% (mobile)
- Gap: 24px
- Icon size: 48px
- Icon: Font Awesome or custom
- Title: 18px, bold
- Count: 14px, secondary color
- Hover: Lift (shadow), change background color
- Click: Navigate to category browse page

### 5. Methodology Section

```
┌──────────────────────────────────────────────────┐
│                                                   │
│ H2: "How It Works"                              │
│ Background: Subtle accent color                 │
│                                                   │
│ 1️⃣  COLLECT                                     │
│ "We gather information from multiple sources"   │
│                                                   │
│ 2️⃣  ANALYZE                                     │
│ "Our team reviews claims and evidence"          │
│                                                   │
│ 3️⃣  VERIFY                                      │
│ "We cross-reference with reliable sources"      │
│                                                   │
│ 4️⃣  PUBLISH                                     │
│ "Results are published with full citations"     │
│                                                   │
│ [Learn more about our methodology →]            │
│                                                   │
└──────────────────────────────────────────────────┘
```

**Properties**:
- Background: alpha(primary, 0.05) or accent color
- Padding: 64px
- Steps: 4 columns (desktop), 2 columns (tablet), 1 column (mobile)
- Number: 36px, bold, primary color
- Title: 18px, bold
- Description: 16px, secondary color
- Spacing between steps: 32px

---

## Component Specifications

### Featured Event Cards

Same as EventCard in Events pages design, but:
- Compact variant (280-320px height)
- Hover effect: elevation-2
- Click: Navigate to event detail

### Category Browse Card

```
<div class="category-card">
  <Icon>📅</Icon>
  <Title>Events</Title>
  <Count>(427)</Count>
</div>
```

Properties:
- Border radius: 12px
- Background: Surface color
- Border: 1px solid divider
- Padding: 24px
- Hover: Box shadow, transform: scale(1.05)
- Text alignment: Center

### CTA Buttons

**Primary Button** (Hero section):
```css
background-color: #FF7976;
color: white;
padding: 16px 32px;
font-size: 16px;
font-weight: 600;
border-radius: 8px;
border: none;
cursor: pointer;

&:hover {
  background-color: #FF5E5B;
  box-shadow: 0 8px 24px rgba(255, 121, 118, 0.3);
}
```

**Secondary Button** (Hero section):
```css
background-color: transparent;
color: white;
padding: 16px 32px;
font-size: 16px;
font-weight: 600;
border: 2px solid white;
border-radius: 8px;
cursor: pointer;

&:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
```

---

## Visual Specifications

### Colors

| Section | Background | Text | Accent |
|---------|-----------|------|--------|
| Hero | #121212 gradient | White | #FF7976 |
| Featured | #121212 | White | #4DD3CF |
| Stats | alpha(#FF7976, 0.1) | White | #FF7976 |
| Categories | #121212 | White | #4DD3CF |
| Methodology | alpha(#FF7976, 0.05) | White | #FF7976 |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| H1 (Hero) | Signika | 48px | 600 |
| H2 (Sections) | Signika | 32px | 600 |
| Subheadline | Lora | 18px | 400 |
| Body text | Lora | 16px | 400 |
| Button text | Signika | 16px | 600 |
| Meta/Labels | Lora | 14px | 400 |

### Spacing

```
Hero: 96px vertical, 48px horizontal
Featured: 64px vertical, 48px horizontal
Stats: 48px vertical, 48px horizontal
Categories: 64px vertical, 48px horizontal
Methodology: 64px vertical, 48px horizontal

Between sections: 0 (no gap, use full width)
Card gaps: 24px
Column gaps: 24px
```

---

## Interactive Behaviors

### Button Hover States

```
Primary button:
- Background: #FF5E5B (darker)
- Shadow: Elevation-4
- Transform: scale(1.02)

Secondary button:
- Background: rgba(255, 255, 255, 0.1)
- Border: 2px solid white (no change)

Link:
- Color: #4DD3CF
- Text-decoration: underline
```

### Card Hover States

```
Event card:
- Shadow: elevation-1 → elevation-4
- Border: transparent → alpha(#FF7976, 0.3)
- Transform: translateY(-4px)

Category card:
- Shadow: none → elevation-2
- Transform: scale(1.05)
```

### Loading States

```
Featured events section:
- Show 3 skeleton cards
- Gradient animation
- Duration: 1.5s

Statistics:
- Show 3 skeleton stat cards
- Gradient animation
```

---

## Mobile Optimization

### Responsive Breakpoints

| Breakpoint | Hero Height | Featured Cols | Category Cols |
|-----------|-------------|---------------|--------------|
| Mobile (xs) | 400px | 1 | 1 |
| Tablet (sm) | 450px | 2 | 2 |
| Desktop (md+) | 600px | 3 | 4 |

### Mobile Hero

```
┌──────────────────────────┐
│ HERO (Reduced height)    │
│                           │
│ H1: 36px (reduced)       │
│ P: 16px                  │
│ [Search: Full width]     │
│ [CTA buttons: Stacked]   │
│                           │
└──────────────────────────┘
```

### Mobile Touch Targets

- CTA buttons: 44x44px minimum
- Category cards: Full width with padding
- Card text: 16px+ (no zoom)

### Mobile Navigation

- Hide secondary CTA in hero
- Stack buttons vertically
- Full-width search bar
- Single column for all sections

---

## Accessibility (WCAG 2.1 AA)

### Semantic HTML

```html
<!-- Hero section -->
<section role="region" aria-label="Hero">
  <h1>Fact-Checking for the 21st Century</h1>
  <p>Verify claims, explore evidence...</p>
</section>

<!-- Featured events -->
<section aria-labelledby="featured-heading">
  <h2 id="featured-heading">Recent Fact-Checks</h2>
  <div role="list">
    <!-- Event cards with role="listitem" -->
  </div>
</section>

<!-- Statistics -->
<section aria-label="Platform Statistics">
  <div role="list">
    <!-- Stat items -->
  </div>
</section>
```

### Color Contrast

- Hero headline: 7:1 (white on dark)
- Body text: 7:1 (white on dark)
- Button text: 7:1
- All links: 7:1

### Focus Management

- Tab order: Search bar → CTA buttons → Featured events → Browse → Learn more
- Focus indicators: 3px outline on all interactive elements
- Skip link: "Skip to main content"

### Images & Icons

- All icons have descriptive alt text
- Category icons have aria-label
- Hero background: Decorative (aria-hidden="true")

---

## Performance

### Image Optimization

- Hero background: WebP, 1920x600px (compressed < 200KB)
- Featured event thumbnails: 600x400px (lazy load)
- Category icons: SVG or 64x64px PNG

### Lazy Loading

- Hero: Eager (above fold)
- Featured events: Eager (above fold)
- Stats: Eager (above fold)
- Categories: Lazy (below fold)
- Methodology: Lazy (below fold)

### Code Splitting

- Hero section: Main bundle
- Featured events: Separate bundle (lazy load)
- Browse categories: Link to separate page

---

## Design Review Checklist (Homepage)

### Visual Design
- [ ] Hero headline is prominent and clear
- [ ] CTA buttons are obvious and distinct
- [ ] Featured events showcase recent activity
- [ ] Statistics section is readable and scannable
- [ ] Category cards have clear icons
- [ ] Dark mode appearance is correct
- [ ] All spacing follows 8px grid

### Information Architecture
- [ ] Hero immediately communicates value proposition
- [ ] Navigation paths are clear
- [ ] Featured content is relevant and current
- [ ] Statistics are up-to-date
- [ ] Call-to-action is obvious

### Accessibility
- [ ] H1 is used for page title only
- [ ] Heading hierarchy is correct
- [ ] All buttons/links have focus indicators
- [ ] Color contrast is 7:1 minimum
- [ ] Images have descriptive alt text
- [ ] Skip link is present

### Mobile
- [ ] Layout adapts to mobile (stacked)
- [ ] Touch targets are 44px+
- [ ] No horizontal scroll
- [ ] Text is readable (16px+)
- [ ] CTA buttons are accessible

---

**Last Updated**: February 2026  
**Version**: 1.0  
**Maintained by**: Design System Team
