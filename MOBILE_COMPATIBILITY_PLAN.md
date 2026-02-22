# Mobile Compatibility Plan - lies.exposed

## Overview

This document outlines the comprehensive strategy for implementing mobile-first responsive design across the lies.exposed platform, specifically for the **Events**, **Actors**, **Groups**, **Media**, and **Areas** pages and detail templates.

---

## 1. Design System & Foundation

### Design System: Minimalism & Swiss Style

**Key Characteristics:**
- Clean, simple, spacious, functional layout
- High contrast with white space emphasis
- Grid-based architecture
- Professional and accessible

**Color Palette:**
| Role | Hex | Usage |
|------|-----|-------|
| Primary | #DC2626 | Accent elements, key CTAs |
| Secondary | #EF4444 | Hover states, alternate actions |
| CTA Link | #1E40AF | Links, navigation |
| Background | #FEF2F2 | Light mode backgrounds |
| Text | #450A0A | Body text (dark red tone) |

**Typography:**
- **Font Family:** Plus Jakarta Sans (Google Fonts)
- **Sizes:** 12px, 14px, 16px, 18px, 20px, 24px, 32px, 36px
- **Weights:** 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

### Responsive Breakpoints (Mobile-First)

```css
/* Base: Mobile (< 640px) */
/* Default styles for 375px width */

/* Tablet (md) */
@media (min-width: 768px) { /* md: in Tailwind */ }

/* Laptop (lg) */
@media (min-width: 1024px) { /* lg: in Tailwind */ }

/* Desktop (xl) */
@media (min-width: 1280px) { /* xl: in Tailwind */ }

/* Large Desktop (2xl) */
@media (min-width: 1536px) { /* 2xl: in Tailwind */ }
```

### Touch & Interaction Standards

| Element | Standard | Implementation |
|---------|----------|-----------------|
| **Touch Target** | 44x44px minimum | `min-h-[44px] min-w-[44px]` |
| **Touch Spacing** | 8px gap minimum | `gap-2` (0.5rem) |
| **Cursor** | Pointer on interactive | `cursor-pointer` class |
| **Hover Delay** | 200-250ms smooth | `transition-colors duration-200` |
| **Focus State** | Visible outline | `focus:outline-2 focus:outline-offset-2` |
| **Tap Delay** | Remove 300ms delay | `touch-action: manipulation` |

### Viewport Configuration

All pages must include in `index.html`:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="theme-color" content="#DC2626">
```

---

## 2. Page-Specific Mobile Strategies

### 2.1 Event Pages (EventsPage, BooksPage, DocumentariesPage)

**Current Issues to Address:**
- List layouts not optimized for mobile
- Card designs may overflow on small screens
- Filter/search bar needs better mobile UX

**Mobile Strategy:**

#### Layout (375px - 768px)
- **Grid:** Single column (1 column)
- **Card Size:** Full width with 16px padding
- **Card Height:** Adaptive height based on content
- **Search:** Full-width search bar at top, sticky
- **Filters:** Expandable/collapsible filter panel (hamburger on mobile)

#### Layout (768px - 1024px)
- **Grid:** 2 columns
- **Card Size:** Flex to 50% width - gap-4
- **Search:** Side-by-side with filter toggle

#### Layout (1024px+)
- **Grid:** 3-4 columns
- **Card Size:** Flex to 33% or 25%
- **Filters:** Persistent sidebar or sticky header

**Card Components:**
```tailwind
/* Mobile Card */
<div className="rounded-lg bg-white dark:bg-slate-900 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
  <div className="aspect-video bg-slate-200 dark:bg-slate-800" />
  <div className="p-4 md:p-6">
    <h3 className="text-lg md:text-xl font-semibold line-clamp-2">Title</h3>
    <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 line-clamp-2 mt-2">Description</p>
    <div className="flex gap-2 mt-4">
      <button className="flex-1 min-h-[44px] rounded px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer transition-colors duration-200">
        View
      </button>
    </div>
  </div>
</div>
```

**Search & Filter:**
```tailwind
/* Mobile Search Bar */
<div className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 md:p-6">
  <div className="flex gap-2">
    <input 
      type="text" 
      placeholder="Search events..." 
      className="flex-1 min-h-[44px] px-4 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500"
    />
    <button className="min-h-[44px] min-w-[44px] rounded-lg bg-slate-100 dark:bg-slate-800 cursor-pointer md:hidden">
      ☰
    </button>
  </div>
  
  {/* Expandable filter panel on mobile */}
  <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-2 mt-4">
    {/* Filter options */}
  </div>
</div>
```

---

### 2.2 Event Detail Template (EventTemplate.tsx)

**Current Issues to Address:**
- Tabs may not be touch-friendly
- Content layout may be too wide on mobile
- Images and rich content need responsive sizing

**Mobile Strategy:**

#### Mobile Layout (375px)
- **Hero Image:** Full-width, 200px height
- **Tabs:** Horizontal scrollable on mobile, swipeable
- **Content:** Single column, full-width - padding 16px
- **Buttons:** Full-width min-h-[44px]
- **Related Items:** Vertical scroll/stack

#### Tablet Layout (768px)
- **Hero Image:** 400px height
- **Tabs:** Standard horizontal tabs
- **Content:** 2-3 column grid where applicable
- **Buttons:** Standard sizing

#### Desktop Layout (1024px+)
- **Hero Image:** 500px height
- **Tabs:** Sticky tabs
- **Sidebar:** Fixed sidebar for related items
- **Full-width content:** Use max-w-6xl container

**Tab Implementation:**
```tailwind
/* Mobile-friendly tabs */
<div className="flex gap-0 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
  {tabs.map(tab => (
    <button 
      key={tab.id}
      className={`min-h-[44px] px-4 md:px-6 flex-shrink-0 border-b-2 transition-colors duration-200 cursor-pointer ${
        active === tab.id 
          ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
          : 'border-transparent text-slate-600 dark:text-slate-400'
      }`}
    >
      {tab.label}
    </button>
  ))}
</div>
```

---

### 2.3 Actor Pages & Template (ActorsPage.tsx, ActorTemplate.tsx)

**Mobile Strategy:**

#### List View (ActorsPage)
- **Grid:** 1 column mobile, 2 columns tablet, 3 columns desktop
- **Avatar:** 60x60px on mobile, 80x80px on tablet
- **Card:** Full-width with padding 16px

#### Detail View (ActorTemplate)
- **Avatar:** 120px on mobile, 180px on tablet/desktop
- **Bio:** Full-width, readable paragraph width
- **Stats:** Grid layout, 2 columns on mobile, 3+ on desktop
- **Related Actors:** Horizontal scroll on mobile

**Actor Card Component:**
```tailwind
<div className="flex gap-4 p-4 md:p-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:shadow-md transition-shadow duration-200">
  <img 
    src={actor.image} 
    alt={actor.name}
    className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover flex-shrink-0"
  />
  <div className="flex-1 min-w-0">
    <h3 className="text-base md:text-lg font-semibold line-clamp-1">{actor.name}</h3>
    <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
      {actor.description}
    </p>
    <div className="flex gap-2 mt-3 text-xs md:text-sm text-slate-500">
      <span>{actor.eventsCount} events</span>
      <span>•</span>
      <span>{actor.groupsCount} groups</span>
    </div>
  </div>
</div>
```

---

### 2.4 Group Pages & Template (GroupsPage.tsx, GroupTemplate.tsx)

**Mobile Strategy:**

#### List View
- **Grid:** 1 column mobile, 2 columns tablet, 3 columns desktop
- **Logo:** 48x48px mobile, 64x64px tablet
- **Card:** Full-width with responsive padding

#### Detail View
- **Logo:** 100x100px mobile, 150x150px tablet
- **Members:** Scrollable carousel on mobile, grid on tablet+
- **Stats:** 2 columns mobile, 3+ columns desktop

---

### 2.5 Media Pages (MediaPage.tsx)

**Mobile Strategy:**

#### Gallery View
- **Grid:** 2 columns mobile (165px each), 3 columns tablet, 4+ columns desktop
- **Aspect Ratio:** 1:1 square images
- **Lightbox:** Full-screen modal on tap
- **Navigation:** Touch-swipe on mobile, arrow keys on desktop

#### Responsive Image Loading:
```tailwind
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
  {media.map(item => (
    <div 
      key={item.id}
      className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200 group"
    >
      <img 
        src={item.thumbnail}
        alt={item.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        loading="lazy"
      />
    </div>
  ))}
</div>
```

---

### 2.6 Area Pages & Template (AreasPage.tsx, AreaTemplate.tsx)

**Mobile Strategy:**

#### List View
- **Grid:** 1 column mobile, 2 columns tablet, 3 columns desktop
- **Map Preview:** Full-width, 150px height on mobile
- **Card:** Compact on mobile with essential info

#### Detail View
- **Map:** Full-width responsive, 300px mobile, 500px+ desktop
- **Info Panel:** Below map on mobile, sidebar on desktop
- **Events by Location:** Scrollable list on mobile, table on desktop

---

## 3. Implementation Checklist

### Phase 1: Foundation (Design System)
- [ ] Create `design-system/MASTER.md` with all guidelines
- [ ] Verify viewport meta tags in all templates
- [ ] Implement touch-action CSS globally
- [ ] Set up responsive breakpoint utilities
- [ ] Verify Plus Jakarta Sans font loading

### Phase 2: Core Pages (Events, Actors, Groups)
- [ ] **EventsPage.tsx:** Responsive grid, sticky search
- [ ] **EventTemplate.tsx:** Mobile tabs, responsive layout
- [ ] **ActorsPage.tsx:** Responsive card grid
- [ ] **ActorTemplate.tsx:** Mobile-first detail view
- [ ] **GroupsPage.tsx:** Responsive card grid
- [ ] **GroupTemplate.tsx:** Mobile-first detail view

### Phase 3: Media & Areas
- [ ] **MediaPage.tsx:** Responsive gallery grid
- [ ] **AreaPage.tsx:** Responsive card list
- [ ] **AreaTemplate.tsx:** Mobile map & info layout

### Phase 4: Interaction & Accessibility
- [ ] Implement 44x44px touch targets on all buttons
- [ ] Add gap-2 spacing between interactive elements
- [ ] Add cursor-pointer to all clickable elements
- [ ] Implement focus states (outline-2, outline-offset-2)
- [ ] Ensure keyboard navigation works
- [ ] Add alt text to all images
- [ ] Implement prefers-reduced-motion

### Phase 5: Testing & Refinement
- [ ] Test at breakpoints: 375px, 768px, 1024px, 1440px
- [ ] Verify no horizontal scroll on mobile
- [ ] Test light/dark mode at all breakpoints
- [ ] Verify contrast ratios (4.5:1 minimum)
- [ ] Performance testing (Core Web Vitals)
- [ ] Cross-browser testing (Chrome, Safari, Firefox)

---

## 4. Common Patterns

### Responsive Container
```tailwind
<div className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
  {/* Content */}
</div>
```

### Responsive Grid (Auto)
```tailwind
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
  {/* Cards */}
</div>
```

### Touch-Friendly Button
```tailwind
<button className="min-h-[44px] min-w-[44px] px-4 md:px-6 py-2 md:py-3 rounded-lg bg-primary text-white hover:bg-primary-600 cursor-pointer transition-colors duration-200 focus:outline-2 focus:outline-offset-2 focus:outline-primary">
  Action
</button>
```

### Responsive Image Container
```tailwind
<div className="w-full aspect-video bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden">
  <img 
    src={src}
    alt={alt}
    className="w-full h-full object-cover"
    loading="lazy"
  />
</div>
```

### Mobile-First Text Sizes
```tailwind
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">Heading</h1>
<p className="text-sm md:text-base lg:text-lg text-slate-600">Body text</p>
```

---

## 5. Pre-Delivery Checklist

### Visual Quality ✓
- [ ] No emojis used as icons (use SVG: Heroicons/Lucide)
- [ ] All icons from consistent icon set
- [ ] Brand logos correct from Simple Icons
- [ ] Hover states don't cause layout shift
- [ ] Theme colors used directly (not var() wrapper)

### Touch & Interaction ✓
- [ ] All clickable elements have `cursor-pointer`
- [ ] Min 44x44px touch targets
- [ ] Min 8px gap between targets (gap-2)
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Focus states visible for keyboard nav

### Responsive ✓
- [ ] Mobile-first approach (default mobile styles)
- [ ] Responsive at 375px, 768px, 1024px, 1440px
- [ ] No horizontal scroll on mobile
- [ ] Images scale properly
- [ ] Typography scales with breakpoints

### Light/Dark Mode ✓
- [ ] Light mode text contrast 4.5:1 minimum
- [ ] Glass/transparent elements visible in light mode
- [ ] Borders visible in both modes
- [ ] Tested both modes at all breakpoints

### Accessibility ✓
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Color not the only indicator
- [ ] `prefers-reduced-motion` respected
- [ ] Keyboard navigation works
- [ ] Focus states visible

### Performance ✓
- [ ] Lazy load images (`loading="lazy"`)
- [ ] Optimize images for mobile
- [ ] Minimize bundle size
- [ ] Smooth animations (not janky)
- [ ] Fast interaction response

---

## 6. Testing Plan

### Devices & Breakpoints
1. **Mobile:** iPhone 12 (390px), iPhone SE (375px)
2. **Tablet:** iPad (768px), iPad Pro (1024px)
3. **Desktop:** MacBook (1440px), 4K (2560px)

### Testing Checklist
- [ ] Portrait & landscape orientations
- [ ] Touch interactions (tap, long-press, swipe)
- [ ] Hover states (mouse/trackpad)
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Screen reader compatibility
- [ ] Light & dark mode
- [ ] Network throttling (Slow 3G)
- [ ] Performance metrics (Core Web Vitals)

### Automated Testing
- [ ] Responsive design testing (Playwright)
- [ ] Accessibility testing (axe-core)
- [ ] Visual regression testing
- [ ] Performance testing (Lighthouse)

---

## 7. Resources & References

### Design Tokens
- **Font:** Plus Jakarta Sans (Google Fonts)
- **Colors:** Primary #DC2626, Secondary #EF4444, Link #1E40AF
- **Spacing:** 4px (gap-1), 8px (gap-2), 12px (gap-3), 16px (gap-4), 24px (gap-6)
- **Radius:** 4px (rounded-sm), 8px (rounded-lg), 12px (rounded-xl)
- **Shadows:** sm, md, lg (Tailwind defaults)

### Component Libraries
- **Icons:** Heroicons, Lucide, Simple Icons
- **UI Framework:** Tailwind CSS
- **React:** React 18+, React Router

### Accessibility Standards
- **WCAG 2.1 Level AA** (minimum)
- **Mobile Accessibility Guidelines**
- **Apple HIG (Human Interface Guidelines)**
- **Material Design 3**

---

## 8. Timeline & Milestones

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Design System | 2-3 days | MASTER.md, component patterns |
| Core Pages | 5-7 days | Events, Actors, Groups (list & detail) |
| Media & Areas | 3-4 days | Media gallery, Area maps |
| Testing | 3-4 days | Cross-browser, accessibility, performance |
| Refinement | 2-3 days | Bug fixes, polish, edge cases |
| **Total** | **15-21 days** | **Production-ready mobile UI** |

---

## 9. Success Metrics

- [ ] 100% of pages responsive at all breakpoints
- [ ] 44x44px minimum touch targets on mobile
- [ ] 4.5:1 contrast ratio on all text
- [ ] Zero horizontal scrolling on mobile
- [ ] Lighthouse score ≥ 90 (mobile)
- [ ] Core Web Vitals all "Good"
- [ ] Keyboard navigation fully functional
- [ ] Screen reader compatible
- [ ] <3s load time on 3G
- [ ] No layout shift (CLS < 0.1)

---

## Notes

- This plan prioritizes **mobile-first design**, building responsive layouts from 375px upward
- All changes maintain the **Minimalism & Swiss Style** design system
- Focus on **touch-friendly interactions** with proper spacing and target sizes
- Ensure **accessibility** is built-in, not added later
- **Test early and often** at target breakpoints
- Keep the design **clean and focused** on content, not decoration

---

Generated: 2026-02-22
Based on UI Pro Max Design System Analysis
