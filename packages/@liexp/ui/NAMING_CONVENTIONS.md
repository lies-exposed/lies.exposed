# Component Naming Conventions

**Applies to**: All components in `packages/@liexp/ui/src/components/`

**Version**: 1.0  
**Last Updated**: February 2026

---

## Overview

Consistent naming conventions ensure:
- Predictable component discovery
- Clear purpose and usage
- Reduced cognitive load
- Easy refactoring and maintenance

This document defines the standard naming patterns for all components in the lies.exposed design system.

---

## File Naming Pattern

```
{Category}{Purpose}{Variant}.{type}.tsx
```

### Components

```
{PascalCase}{PascalCase}{PascalCase}.tsx
```

**Rules**:
- PascalCase (capitalize first letter of each word)
- No underscores, hyphens, or lowercase words
- File name matches exported component name
- Consistent within category folders

**Examples**:
- `EventCard.tsx` → `<EventCard />`
- `DateRangePicker.tsx` → `<DateRangePicker />`
- `ActorChip.tsx` → `<ActorChip />`
- `ErrorBox.tsx` → `<ErrorBox />`

### Special Files

```
{ComponentName}.stories.tsx      // Storybook story
{ComponentName}.test.tsx         // Unit tests
{ComponentName}.spec.tsx         // Test specification
{ComponentName}.types.ts         // Type definitions
{ComponentName}.constants.ts     // Constants/config
{ComponentName}.utils.ts         // Utilities
{ComponentName}.plugin.tsx       // Editor plugins
```

**Examples**:
- `EventCard.stories.tsx` → Storybook story for EventCard
- `DatePicker.test.tsx` → Unit tests for DatePicker
- `FlowGraph.plugin.tsx` → Editor plugin for FlowGraph

---

## Component Naming Pattern

### Structure: {Category}{Purpose}{Variant}

1. **Category** (optional, but recommended)
   - What type of component: `Event`, `Actor`, `Group`, `Card`, `Button`, etc.
   - Examples: `Event*`, `Actor*`, `Date*`, `Graph*`, `Chat*`

2. **Purpose** (required)
   - What the component does: `Card`, `Button`, `List`, `Graph`, `Dialog`, etc.
   - Examples: `*Card`, `*Button`, `*List`, `*Graph`, `*Dialog`

3. **Variant** (optional)
   - Distinguishes similar components: `Slim`, `Compact`, `Full`, `Mini`, `Stack`, etc.
   - Examples: `EventSlimCard`, `BarStackGraph`, `CO2LeftBudgetCounter`

### Naming Examples by Category

#### Layout Components
```
ContentWithSidebar        // Content + sidebar layout
FullSizeSection          // Full-width container
FullSizeLoader           // Full-page loader overlay
```

#### Event-Related
```
EventCard                // Standard event display
EventSlimCard            // Compact event
EventCardGrid            // Grid of events
EventIcon                // Event type icon
EventPageContent         // Event detail page
EventTimelinePlugin      // Timeline editor plugin
CreateEventCard          // "Create new event" UI
```

#### Actor-Related
```
ActorCard                // Actor profile card
ActorChip                // Compact actor
ActorFamilyTree          // Actor family visualization
ActorPageContent         // Actor detail page
ActorInlineBlockNote.plugin  // Inline mention in editor
```

#### Group-Related
```
GroupNode                // Group in graph
GroupBoxNode             // Boxed group display
GroupBoxNodeContextMenu   // Context menu for group
```

#### Area-Related
```
AreaChip                 // Compact area/location
AreaPageContent          // Area detail page
AreasMap                 // Map of areas
```

#### Form & Input
```
DatePicker               // Single date selector
DateRangePicker          // Date range selector
BlockNoteInput           // Rich text editor
MapInput                 // Geographic selector
SearchFiltersBox         // Advanced filters
JSONInput                // JSON editor
```

#### Display & Cards
```
LinkCard                 // External link preview
BookCard                 // Book/media card
Avatar                   // User/entity avatar
ErrorBox                 // Error message display
```

#### Data & Tables
```
List                     // Simple vertical list
ListItem                 // List item
Table                    // Data table
ExpandableList           // List with expand/collapse
```

#### Visualization
```
FlowGraph                // Directed graph
ForcedNetworkGraph       // Force-directed network
BubbleGraph              // Bubble chart
BarStackGraph            // Stacked bars
PieChartGraph            // Pie chart
SankeyGraph              // Sankey diagram
CalendarHeatmap          // Calendar heatmap
EntitreeGraph            // Entity relationship tree
```

#### Navigation & UI
```
BreadCrumb               // Page hierarchy
Menu                     // Dropdown menu
ContextMenu              // Right-click menu
TabPanel                 // Tab navigation
Modal                    // Modal dialog
Popover                  // Popover panel
Slider                   // Numeric slider
```

#### Chat & Messages
```
ChatUI                   // Main chat interface
ChatInput                // Chat input bar
ChatHeader               // Chat window header
MessageBubble            // Single message
ToolMessage              // Tool execution message
StreamingMessage         // Streaming response
WelcomeMessage           // Welcome/greeting
```

#### Counters & Metrics
```
Counter                  // Simple counter
ChipCount                // Chip-style counter
WorldPopulationCount     // Population metric
CO2LeftBudgetCounter     // Carbon budget indicator
StatAccordion            // Statistics accordion
```

#### Icons & Utilities
```
FAIcon                   // Font Awesome icon
EventIcon                // Event type icon
FlagIcon                 // Country flag
ThemeSwitcher            // Dark/light mode toggle
ShareButtons             // Social sharing
```

#### Editor & Content
```
Editor                   // Main BlockNote editor
BlockQuote               // Block quote element
MarkdownContent          // Markdown display
MarkdownRenderer         // Markdown to React
TOC                      // Table of contents
LinkBlock.plugin         // Link insert plugin
MediaBlock.plugin        // Media insert plugin
```

---

## Folder Organization

### Category Folders

```
packages/@liexp/ui/src/components/

actors/              → {something}Actor + ActorXyz
  ├── ActorCard.tsx
  ├── ActorChip.tsx
  ├── ActorFamilyTree.tsx
  └── ActorPageContent.tsx

area/                → {something}Area + AreaXyz
  ├── AreaChip.tsx
  ├── AreaPageContent.tsx
  └── AreasMap.tsx

events/              → EventXyz + {something}Event
  ├── EventCard.tsx
  ├── EventSlimCard.tsx
  ├── EventCardGrid.tsx
  ├── EventIcon.tsx
  └── EventPageContent.tsx

groups/              → GroupXyz
  ├── GroupNode.tsx
  ├── GroupBoxNode.tsx
  └── GroupBoxNodeContextMenu.tsx

Common/              → Shared components (no category prefix needed)
  ├── Avatar.tsx
  ├── BreadCrumb.tsx
  ├── Loader.tsx
  ├── Menu.tsx
  ├── Modal.tsx
  ├── Popover.tsx
  ├── ThemeSwitcher.tsx
  ├── Button/
  ├── Graph/
  ├── Icons/
  ├── Markdown/
  └── ...

Chat/                → ChatXyz
  ├── ChatUI.tsx
  ├── ChatInput.tsx
  ├── ChatHeader.tsx
  └── ...

Counters/            → {something}Counter
  ├── Counter.tsx
  ├── CO2LeftBudgetCounter.tsx
  ├── WorldPopulationCount.tsx
  └── ...

Graph/               → {something}Graph
  ├── FlowGraph.tsx
  ├── ForcedNetworkGraph.tsx
  ├── BubbleGraph.tsx
  └── ...

Input/               → {something}Picker + {something}Input
  ├── DatePicker.tsx
  ├── DateRangePicker.tsx
  ├── BlockNoteInput.tsx
  └── ...

Media/               → {something}
  ├── Gallery.tsx
  ├── ImageBlock.tsx
  └── VideoPlayer.tsx

Modal/               → Dialog / Modal related
  ├── Modal.tsx
  └── ModalContext.tsx

Table/               → Table related
  ├── Table.tsx
  └── DataGrid.tsx

lists/               → List related
  ├── List.tsx
  ├── ListItem.tsx
  └── ExpandableList.tsx

admin/               → Admin-specific
  ├── AdminComponent.tsx
  └── ...
```

### When to Create a New Folder

Create a new folder when:
- ✅ You have 3+ related components
- ✅ Components share a common domain (e.g., `actors/`, `events/`)
- ✅ Components are rarely used outside the category

Don't create a folder for:
- ❌ Single-component categories
- ❌ Highly reusable generic components (use `Common/`)
- ❌ Components used across multiple categories

---

## Variant Naming

### Standard Variants

```
{Component}Slim         // Compact/condensed version
{Component}Compact      // Space-efficient version
{Component}Full         // Full-featured version
{Component}Mini         // Extra small version
{Component}Large        // Extra large version
{Component}Stack        // Stacked layout variant
{Component}Grid         // Grid layout variant
{Component}Horizontal   // Horizontal orientation
```

**Examples**:
- `EventSlimCard` → Slim variant of EventCard
- `BarStackGraph` → Stacked bar chart variant
- `BarStackHorizontalGraph` → Horizontal stacked bars
- `ExpandableList` → Expandable variant of List

### Color/Style Variants

Use MUI's variant system instead of naming variants:

```
// ❌ WRONG - Variant in component name
<ButtonRed onClick={...} />
<ButtonBlue onClick={...} />

// ✅ CORRECT - Variant as prop
<Button color="error" onClick={...} />
<Button color="primary" onClick={...} />
```

---

## Props Naming

### Boolean Props

```
// Prefix with "is" or "has"
isLoading
isVisible
isActive
isSelected
hasError
hasChildren
```

**Examples**:
```typescript
interface EventCardProps {
  isCompact?: boolean;        // ✅ Good
  isHighlighted?: boolean;    // ✅ Good
  active?: boolean;           // ❌ Avoid (ambiguous)
  showDetails?: boolean;      // ❌ Use "isShown" instead
}
```

### Event/Callback Props

```
// Prefix with "on" + PascalCase action
onClick
onChange
onSubmit
onDelete
onSave
onClose
onSelect
onError
```

**Examples**:
```typescript
interface DatePickerProps {
  onChange: (date: Date) => void;    // ✅ Good
  onError?: (error: Error) => void;  // ✅ Good
  onDateChange?: (date: Date) => void; // ⚠️ Be consistent
}
```

### Data Props

```
// Use clear, descriptive names
items        // Array of data
value        // Current value
data         // Generic data object
defaultValue // Default state
initialValue // Initial state
children     // React children
```

**Examples**:
```typescript
interface ListProps {
  items: ListItem[];              // ✅ Good
  renderItem: (item) => ReactNode; // ✅ Good
  data?: unknown;                 // ❌ Too vague
}
```

---

## Export Naming

### Default vs Named Exports

```typescript
// ✅ Default export - main component
export default EventCard;

// ✅ Named exports - types, helpers, constants
export type EventCardProps = {
  event: Event;
  onClick?: () => void;
};

export const EVENT_CARD_MAX_HEIGHT = 400;

export const useEventCardStyles = () => { ... };
```

### Index Files (Barrel Exports)

```typescript
// packages/@liexp/ui/src/components/events/index.ts
export { default as EventCard } from './EventCard';
export { default as EventSlimCard } from './EventSlimCard';
export { default as EventCardGrid } from './EventCardGrid';
export type { EventCardProps } from './EventCard';
```

---

## Anti-Patterns (What NOT to Do)

### ❌ Avoid

```
// Too generic
Component.tsx
Widget.tsx
Item.tsx
Container.tsx
Element.tsx

// Redundant category prefix
CardCardComponent.tsx
EventEventCard.tsx
ButtonButton.tsx

// Unclear abbreviations
Evt.tsx
Actr.tsx
Btn.tsx
Grp.tsx

// Weak verbs in naming
ShowEvent.tsx  // Use EventDisplay or EventCard instead
GetActor.tsx   // Use ActorCard or ActorInfo instead
DoEdit.tsx     // Use EditButton instead

// Inconsistent casing
event_card.tsx       // Use EventCard
EventCARD.tsx        // Use EventCard
eventCard.tsx        // Use EventCard

// Version numbers in names
EventCardV2.tsx      // Track in git, not naming
ActorComponentNew.tsx // Remove old, don't version in names
```

---

## Migration Path (For Existing Components)

When renaming existing components:

1. **Create new file** with correct name
2. **Copy implementation** from old file
3. **Update exports** in index files
4. **Add deprecation notice** to old file:
   ```typescript
   /**
    * @deprecated Use EventCard instead
    */
   export { default as OldEventName } from './EventCard';
   ```
5. **Run codemod** to update imports across codebase
6. **Remove old file** in a separate PR

---

## Real-World Examples

### Naming Decision Tree

**Example 1: "I have a card that displays actor information"**
```
Category: Actor
Purpose: Card
Result: ActorCard ✅

File: packages/@liexp/ui/src/components/actors/ActorCard.tsx
Export: export default ActorCard;
Import: import ActorCard from '@liexp/ui/actors';
```

**Example 2: "I have a form input for selecting a geographic area"**
```
Category: Area
Purpose: Input/Select
Result: AreaPicker or MapInput (depending on UI)

File: packages/@liexp/ui/src/components/Input/MapInput.tsx
or
File: packages/@liexp/ui/src/components/area/AreaPicker.tsx
```

**Example 3: "I have a compact bar chart with stacked bars in horizontal orientation"**
```
Category: Graph
Purpose: BarChart
Variants: Stacked + Horizontal
Result: BarStackHorizontalGraph ✅

File: packages/@liexp/ui/src/components/Graph/BarStackHorizontalGraph.tsx
Export: export default BarStackHorizontalGraph;
```

**Example 4: "I have a modal dialog for confirming event deletion"**
```
Category: Modal (or Events)
Purpose: Dialog/Modal
Variant: Confirmation
Result: ConfirmationDialog or EventDeleteModal

File: packages/@liexp/ui/src/components/Modal/ConfirmationDialog.tsx
Export: export default ConfirmationDialog;
```

---

## Type Definition Naming

### Props Interface

```typescript
// Pattern: {ComponentName}Props
interface EventCardProps {
  event: Event;
  onClick?: () => void;
  isCompact?: boolean;
  variant?: 'default' | 'slim' | 'compact';
}

// For forwarded refs:
// Pattern: {ComponentName}Element
type EventCardElement = HTMLDivElement;
```

### Hooks

```typescript
// Pattern: use{ComponentName}
// Examples:
useEventCard()
useEventCardStyles()
useEventCardAnimation()
useEventCardData()
```

### Utilities/Constants

```typescript
// Pattern: {COMPONENT_NAME}_{PURPOSE}
// Examples:
EVENT_CARD_MAX_HEIGHT = 400
EVENT_CARD_ANIMATION_DURATION = 200ms
ACTOR_CHIP_FONT_SIZE = 14px

EVENT_CARD_VARIANTS = ['default', 'slim', 'compact'] as const
```

---

## Common Questions

### Q: Should I use "Container" in the name?
**A**: No. The component type should be clear from context.
- ❌ `EventCardContainer`
- ✅ `EventCard` (it's a card)

### Q: Should I use "Wrapper"?
**A**: Only for layout components that primarily contain other components.
- ✅ `ContentWithSidebar` (layout wrapper)
- ❌ `EventCardWrapper` (just use EventCard)

### Q: How should I name a component that displays multiple things?
**A**: Use a generic name or parent category:
- ✅ `EventCard` (displays event info)
- ✅ `EntityCard` (displays any entity)
- ❌ `EventAndActorCard` (too specific, create separate components)

### Q: When should I use "Manager"?
**A**: Only for complex state management components or services:
- ✅ `EventFormManager` (handles complex form state)
- ❌ `EventCardManager` (just use EventCard or a custom hook)

### Q: Should hook names start with "use"?
**A**: Always. It's a React convention.
- ✅ `useEventCard`
- ✅ `useEventCardStyles`
- ❌ `getEventCardStyles`

---

## Checker Script

Run this script to audit component naming:

```bash
# Find components that don't follow conventions
find packages/@liexp/ui/src/components -name "*.tsx" \
  -not -name "[A-Z]*" \
  -not -name "*.stories.tsx" \
  -not -name "*.test.tsx" \
  -not -name "*.plugin.tsx"

# Find files without matching exports
for file in packages/@liexp/ui/src/components/**/*.tsx; do
  name=$(basename "$file" .tsx)
  if ! grep -q "export.*$name" "$file"; then
    echo "Missing export: $file"
  fi
done
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Feb 2026 | Initial conventions document |

---

**Last Updated**: February 2026  
**Version**: 1.0  
**Maintained by**: Design System Team
