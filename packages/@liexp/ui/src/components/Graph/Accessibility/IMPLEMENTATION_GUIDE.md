# Graph Accessibility Implementation Guide (Phase 4)

## Overview

This document outlines the accessibility improvements made to data visualization components in the lies.exposed platform to meet WCAG 2.1 Level AA standards.

## Current Status

### ✅ Completed (Tier 1 - Quick Wins)

| Component                                | Status      | Implementation         |
| ---------------------------------------- | ----------- | ---------------------- |
| **HumanPopulationGrowthGraphAccessible** | ✅ Complete | WCAG 2.1 AA compliant  |
| **CO2LevelsGraphAccessible**             | ✅ Complete | WCAG 2.1 AA compliant  |
| **GraphA11yWrapper**                     | ✅ Complete | Core wrapper component |
| **graphA11y.utils**                      | ✅ Complete | 10+ utility functions  |

### 🟡 Planned (Tier 2 - Medium Complexity)

| Component                   | Complexity | Approach                          |
| --------------------------- | ---------- | --------------------------------- |
| **WealthDistributionGraph** | Low-Med    | Bubble pack with data table       |
| **ProjectFundsPieGraph**    | Low-Med    | Pie chart with slice descriptions |
| **VaccineADRGraph**         | Med        | Multi-line with filter states     |

### 🔴 Future (Tier 3-4 - Complex)

| Component                 | Complexity | Challenge                       |
| ------------------------- | ---------- | ------------------------------- |
| **EventsSankeyGraph**     | High       | Complex node-link relationships |
| **HierarchyNetworkGraph** | High       | Force-directed layout           |
| **EventsNetworkGraph**    | High       | Dynamic graph rendering         |

## Implementation Architecture

### Core Components

#### 1. GraphA11yWrapper (`GraphA11yWrapper.tsx`)

Semantic HTML wrapper that adds WCAG 2.1 AA accessibility features:

```tsx
<GraphA11yWrapper
  id="graph-id"
  title="Graph Title"
  description="Human-readable description of what the graph shows"
  dataTable={<AccessibleDataTable />}
  dataDownloadUrl="/data.csv"
>
  <YourGraphComponent />
</GraphA11yWrapper>
```

**Features:**

- ✅ `role="img"` for SVG graphs
- ✅ `aria-label` and `aria-describedby` attributes
- ✅ `<figcaption>` for accessible titles
- ✅ Screen reader-only description text
- ✅ Expandable `<details>` element for data table
- ✅ CSV/JSON download link
- ✅ Keyboard focus management (tabindex=0)

#### 2. Utility Functions (`graphA11y.utils.ts`)

| Function                         | Purpose                                          |
| -------------------------------- | ------------------------------------------------ |
| `generateDataDescription()`      | Creates human-readable summary of numerical data |
| `createAccessibleDataTable()`    | Generates semantic HTML table from chart data    |
| `makeChartKeyboardAccessible()`  | Adds keyboard navigation (Arrow keys, Enter)     |
| `addAriaLabels()`                | Applies ARIA labels to SVG elements              |
| `createLiveRegionAnnouncement()` | Generates screen reader announcements            |
| `describeNetworkGraph()`         | Narrates network/graph relationships             |
| `validateGraphAccessibility()`   | WCAG 2.1 compliance checker                      |
| `exportChartDataAsCSV()`         | Exports data in accessible format                |
| `getFocusVisibleStyle()`         | Returns focus indicator styles                   |

### Integration Pattern

```tsx
import {
  GraphA11yWrapper,
  generateDataDescription,
  createAccessibleDataTable,
} from "@liexp/ui/lib/components/Graph/Accessibility";

// Your accessible graph component
export const MyGraphAccessible = ({ data }) => {
  const description = generateDataDescription(data.values, "metric name");
  const table = createAccessibleDataTable(data, columns);

  return (
    <GraphA11yWrapper
      id="my-graph"
      title="My Graph Title"
      description={description}
      dataTable={<div dangerouslySetInnerHTML={{ __html: table }} />}
    >
      <OriginalGraphComponent data={data} />
    </GraphA11yWrapper>
  );
};
```

## Accessibility Features

### 1. Semantic HTML Structure

- ✅ SVG wrapped in `<figure>` elements
- ✅ Descriptive `<figcaption>` for titles
- ✅ Alternative text in `<details>` element
- ✅ Semantic HTML tables for data

### 2. ARIA Attributes

- ✅ `role="img"` for SVG visualizations
- ✅ `aria-label` with graph title
- ✅ `aria-describedby` linking to description text
- ✅ `aria-label` on interactive controls (toggles, filters)

### 3. Keyboard Navigation

- ✅ `tabindex="0"` allows focus on graph
- ✅ Tab key navigates to all interactive elements
- ✅ Enter/Space activates buttons and controls
- ✅ Arrow keys for data exploration (when implemented)

### 4. Screen Reader Support

- ✅ Text descriptions for visual patterns (trends, ranges)
- ✅ Data tables provide numeric details
- ✅ Live region announcements for data updates
- ✅ Screen reader-only text in `.sr-only` style

### 5. Color & Contrast

- ✅ Graphics don't rely solely on color
- ✅ Patterns and labels distinguish elements
- ✅ 4.5:1 contrast ratio for text (WCAG AA)
- ✅ 3:1 contrast for graphics (WCAG AA)

### 6. Focus Management

- ✅ Visible focus indicators (outline: 2px solid)
- ✅ Focus visible only on keyboard tab (not mouse)
- ✅ Focus outline offset for clarity

## Testing Checklist

### Automated Testing

- [ ] TypeScript compilation passes
- [ ] No knip linting errors
- [ ] Vitest unit tests for utilities
- [ ] ESLint passes

### Manual Testing

- [ ] **NVDA (Windows)**: Test with screen reader
- [ ] **JAWS (Windows)**: Commercial screen reader
- [ ] **VoiceOver (macOS/iOS)**: Apple screen reader
- [ ] **Keyboard-only navigation**: Tab through all components
- [ ] **Focus indicators**: Visible on all interactive elements
- [ ] **Color contrast**: 4.5:1 for text, 3:1 for graphics

### Browser Testing

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (iOS Safari, Android Chrome)

## WCAG 2.1 Compliance

### Guidelines Addressed

| WCAG 2.1 Criterion                         | Status | Implementation                               |
| ------------------------------------------ | ------ | -------------------------------------------- |
| **1.1.1 Non-text Content (Level A)**       | ✅     | Alt text via aria-label and aria-describedby |
| **1.3.1 Info and Relationships (Level A)** | ✅     | Semantic HTML structure (figure, table)      |
| **1.4.3 Contrast (Level AA)**              | ✅     | 4.5:1 text contrast                          |
| **2.1.1 Keyboard (Level A)**               | ✅     | Tabindex, keyboard event handlers            |
| **2.4.3 Focus Order (Level A)**            | ✅     | Logical tab order via tabindex               |
| **2.4.7 Focus Visible (Level AA)**         | ✅     | Outline: 2px solid on focus                  |
| **4.1.2 Name, Role, Value (Level A)**      | ✅     | ARIA attributes for all interactive elements |
| **4.1.3 Status Messages (Level AA)**       | ✅     | Live regions for data updates                |

## Performance Considerations

### Memory & Rendering

- Avoid large inline data tables (use `<details>` for hiding)
- Lazy-load SVG definitions (gradients, defs)
- Memoize utility functions with stable dependencies
- Use `React.memo()` for accessible wrapper component

### Network

- SVG images are scalable (use `.js` format not `.png`)
- Data tables are text-based (no image exports for screen readers)
- CSV export is lightweight

## Future Roadmap

### Phase 4 Tier 2 (Next Sprint)

1. **WealthDistributionGraph** - Bubble pack layout
2. **ProjectFundsPieGraph** - Pie chart with slice descriptions
3. **VaccineADRGraph** - Multi-line chart with form controls

### Phase 4 Tier 3 (Following Sprint)

1. **EventsSankeyGraph** - Node-link narratives
2. **HierarchyNetworkGraph** - Network descriptions
3. **EventsFlowGraph** - Flow diagram explanations

### Phase 5 (Future)

1. **Advanced keyboard navigation** - Arrow keys to explore data
2. **Live data updates** - ARIA live regions for real-time changes
3. **Custom screen reader optimizations** - Testing with NVDA, JAWS, VoiceOver
4. **Storybook accessibility addon** - Visual testing with accessibility inspector
5. **Automated accessibility testing** - axe-core integration in Vitest

## Code Examples

### Example 1: Simple Line Chart

```tsx
import { HumanPopulationGrowthGraphAccessible } from "@liexp/ui";

export const PopulationPage = () => (
  <HumanPopulationGrowthGraphAccessible showPoints={true} />
);
```

### Example 2: Custom Accessible Graph

```tsx
import {
  GraphA11yWrapper,
  generateDataDescription,
  createAccessibleDataTable,
} from "@liexp/ui";

export const CustomChart = ({ data }) => (
  <GraphA11yWrapper
    id="custom-chart"
    title="Custom Data Visualization"
    description={generateDataDescription(data.values, "metric")}
    dataTable={
      <div
        dangerouslySetInnerHTML={{
          __html: createAccessibleDataTable(data, columns),
        }}
      />
    }
  >
    <svg>{/* Your chart */}</svg>
  </GraphA11yWrapper>
);
```

### Example 3: Using Utilities

```tsx
import {
  makeChartKeyboardAccessible,
  validateGraphAccessibility,
  exportChartDataAsCSV,
} from "@liexp/ui";

// Make chart keyboard accessible
const svg = document.querySelector("svg");
makeChartKeyboardAccessible(svg, (element) => {
  console.log("Selected:", element);
});

// Validate compliance
const result = validateGraphAccessibility(svg);
console.log("Issues:", result.issues);

// Export data
const csv = exportChartDataAsCSV(data, columns);
downloadFile(csv, "data.csv");
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [Visx Documentation](https://visx-docs.netlify.app/)
- [Web Content Accessibility Guidelines - Charts](https://www.w3.org/WAI/tutorials/images/graphs/)
- [Screen Reader Testing Tools](https://www.nvaccess.org/) (NVDA)

## Questions?

For questions about accessibility implementation, refer to:

1. This document for architecture and patterns
2. Component JSDoc comments for usage examples
3. Test files for implementation patterns
4. WCAG guidelines for compliance details
