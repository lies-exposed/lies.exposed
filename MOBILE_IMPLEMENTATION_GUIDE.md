# Mobile Compatibility Implementation Guide

## Quick Reference

### Essential Imports
```typescript
import { clsx } from 'clsx';
import { type FC, useState } from 'react';
```

### Responsive Utility Classes (Tailwind)

**Breakpoints:**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

**Mobile-First Syntax:**
```tailwind
/* Base styles apply to mobile (< 640px) */
/* Then override with md:, lg:, xl: prefixes */

text-sm md:text-base lg:text-lg
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
p-4 md:p-6 lg:p-8
```

---

## Common Component Patterns

### 1. Responsive Card Grid

```typescript
interface CardGridProps {
  items: Array<{ id: string; title: string; description: string }>;
  onCardClick: (id: string) => void;
}

export const CardGrid: FC<CardGridProps> = ({ items, onCardClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onCardClick(item.id)}
          className="p-4 md:p-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:shadow-md transition-shadow duration-200 group"
        >
          <h3 className="text-base md:text-lg font-semibold line-clamp-2">
            {item.title}
          </h3>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 line-clamp-2 mt-2">
            {item.description}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCardClick(item.id);
            }}
            className="mt-4 w-full min-h-[44px] px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-colors duration-200 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500"
          >
            View Details
          </button>
        </div>
      ))}
    </div>
  );
};
```

### 2. Sticky Search Bar

```typescript
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFilterToggle?: () => void;
}

export const SearchBar: FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  onFilterToggle,
}) => {
  return (
    <div className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 md:p-6">
      <div className="flex gap-2 w-full max-w-6xl mx-auto">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-h-[44px] px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 transition-colors duration-200"
        />
        {onFilterToggle && (
          <button
            onClick={onFilterToggle}
            className="min-h-[44px] min-w-[44px] rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer md:hidden transition-colors duration-200 flex items-center justify-center text-slate-700 dark:text-slate-300"
          >
            ☰
          </button>
        )}
      </div>
    </div>
  );
};
```

### 3. Responsive Tabs

```typescript
interface TabsProps {
  tabs: Array<{ id: string; label: string; content: React.ReactNode }>;
  defaultTabId?: string;
}

export const Tabs: FC<TabsProps> = ({ tabs, defaultTabId }) => {
  const [activeTab, setActiveTab] = useState(defaultTabId || tabs[0].id);

  return (
    <div>
      <div className="flex gap-0 border-b border-slate-200 dark:border-slate-800 overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'min-h-[44px] px-4 md:px-6 flex-shrink-0 border-b-2 transition-colors duration-200 cursor-pointer text-sm md:text-base font-medium',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};
```

### 4. Responsive Button

```typescript
interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...props
}) => {
  const baseClass =
    'rounded-lg font-medium transition-colors duration-200 cursor-pointer focus:outline-2 focus:outline-offset-2';

  const variantClass = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-blue-500',
    secondary: 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-700 focus:outline-slate-500',
    outline:
      'border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-slate-500',
  }[variant];

  const sizeClass = {
    sm: 'min-h-[32px] min-w-[32px] px-3 text-sm',
    md: 'min-h-[44px] min-w-[44px] px-4 text-base',
    lg: 'min-h-[48px] min-w-[48px] px-6 text-lg',
  }[size];

  return (
    <button
      className={clsx(
        baseClass,
        variantClass,
        sizeClass,
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};
```

### 5. Responsive Image Container

```typescript
interface ResponsiveImageProps {
  src: string;
  alt: string;
  aspectRatio?: 'square' | 'video' | 'portrait';
}

export const ResponsiveImage: FC<ResponsiveImageProps> = ({
  src,
  alt,
  aspectRatio = 'video',
}) => {
  const aspectClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
  }[aspectRatio];

  return (
    <div className={`w-full ${aspectClass} bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
};
```

### 6. Responsive Container

```typescript
interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const Container: FC<ContainerProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={clsx(
        'w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8',
        className,
      )}
    >
      {children}
    </div>
  );
};
```

### 7. Mobile-Friendly Avatar

```typescript
interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Avatar: FC<AvatarProps> = ({ src, alt, size = 'md' }) => {
  const sizeClass = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }[size];

  return (
    <div className={clsx(sizeClass, 'rounded-full overflow-hidden flex-shrink-0')}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
      />
    </div>
  );
};
```

### 8. Responsive Hero Section

```typescript
interface HeroProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  children?: React.ReactNode;
}

export const Hero: FC<HeroProps> = ({
  title,
  subtitle,
  backgroundImage,
  children,
}) => {
  return (
    <div
      className="w-full min-h-[200px] md:min-h-[400px] lg:min-h-[500px] bg-cover bg-center relative"
      style={{
        backgroundImage: backgroundImage
          ? `url(${backgroundImage})`
          : undefined,
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-4">
          {title}
        </h1>
        {subtitle && (
          <p className="text-base md:text-lg lg:text-xl text-white/90 max-w-2xl mb-6">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  );
};
```

---

## Page Structure Template

```typescript
import { useState } from 'react';
import { Container } from '@/components/Container';
import { SearchBar } from '@/components/SearchBar';
import { CardGrid } from '@/components/CardGrid';

export const ExamplePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Sticky Search Bar */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search items..."
        onFilterToggle={() => setShowFilters(!showFilters)}
      />

      {/* Main Content Container */}
      <Container className="py-6 md:py-8 lg:py-12">
        {/* Responsive Grid */}
        <CardGrid
          items={filteredItems}
          onCardClick={(id) => navigate(`/item/${id}`)}
        />

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400">
              No items found
            </p>
          </div>
        )}
      </Container>
    </div>
  );
};
```

---

## CSS Global Styles

Add to your global CSS file:

```css
/* Touch action optimization */
html {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
}

body {
  font-family: 'Plus Jakarta Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  touch-action: manipulation;
}

/* Prevent tap highlight on mobile */
button,
a,
[role='button'] {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Scrollable overflow on mobile */
input[type='search']::-webkit-search-cancel-button {
  -webkit-appearance: none;
}

/* Better focus states */
*:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
```

---

## Testing Checklist for Each Component

### Before Deployment
- [ ] Test at 375px (mobile)
- [ ] Test at 768px (tablet)
- [ ] Test at 1024px (desktop)
- [ ] Test at 1440px (large desktop)
- [ ] Light mode contrast ≥ 4.5:1
- [ ] Dark mode contrast ≥ 4.5:1
- [ ] All buttons min 44x44px
- [ ] All buttons have `cursor-pointer`
- [ ] All buttons have focus outline
- [ ] Touch targets have gap-2 spacing
- [ ] Images have alt text
- [ ] No horizontal scroll
- [ ] Hover states smooth (200-250ms)
- [ ] Keyboard navigation works
- [ ] Works in light and dark mode

---

## Performance Tips

1. **Lazy Load Images:** Use `loading="lazy"`
2. **Optimize Images:** Use modern formats (WebP)
3. **Code Splitting:** Lazy load heavy components
4. **Memoization:** Use `React.memo()` for expensive renders
5. **Virtual Lists:** Use for large lists (1000+ items)
6. **CSS Containment:** Use `contain: layout` for improved performance

---

## Accessibility Checklist

- [ ] Semantic HTML (`<button>`, `<form>`, `<nav>`, etc.)
- [ ] ARIA labels where needed
- [ ] Alt text on images
- [ ] Form labels
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Focus states visible
- [ ] Color contrast 4.5:1
- [ ] Icons have text labels
- [ ] No color-only indicators
- [ ] Video captions/transcripts
- [ ] Reduced motion support
- [ ] Screen reader friendly

---

## Dark Mode Implementation

```typescript
// In your tailwind config or global CSS
<html className={darkMode ? 'dark' : ''}>
  {/* content */}
</html>

// Usage in components
<div className="bg-white dark:bg-slate-900">
  <p className="text-slate-900 dark:text-white">Content</p>
</div>
```

---

## Troubleshooting

### Horizontal Scroll on Mobile
**Solution:** Check `overflow-x-hidden` on body, ensure no `width: 100vw`, use `width: 100%` instead

### Touch Targets Too Small
**Solution:** Use `min-h-[44px] min-w-[44px]` on all interactive elements

### Poor Contrast in Dark Mode
**Solution:** Use slate-900 for text on white, white text on slate-900, check 4.5:1 ratio

### Slow Performance
**Solution:** Lazy load images, code split components, reduce animations, optimize bundle size

### Layout Shift on Hover
**Solution:** Use `transition-colors` not `transition-transform`, avoid `scale()` on hover

---

## Resources

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Web Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [Lighthouse Chrome DevTools](https://developer.chrome.com/docs/lighthouse/)

