# lies.exposed Component Inventory

**Last Updated**: February 2026  
**Total Components**: 384 (.tsx files)  
**Component Categories**: 26 folders + 52 shared Common components  
**Services**: Public Web + Admin  

---

## Component Inventory Organization

This document categorizes all 384 components in `packages/@liexp/ui/src/components/` by type and intended use. Use this as a reference for:

1. Finding existing components for UI development
2. Understanding what components are available
3. Identifying duplicates or candidates for consolidation
4. Tracking component status (dark mode, a11y, responsive, etc.)

---

## I. Layout & Structure Components

**Folder**: `Common/` (Shared)  
**Purpose**: Page structure, sidebars, content organization

| Component | Props | Usage | Services | Status |
|-----------|-------|-------|----------|--------|
| **ContentWithSidebar** | children, sidebar | Two-column layout with fixed sidebar | Web, Admin | ✅ |
| **ContentWithSideNavigation** | children, nav | Page layout with side navigation | Web, Admin | ✅ |
| **FullSizeSection** | children, title | Full-width content container | Web, Admin | ✅ |
| **FullSizeLoader** | isLoading | Full page loading state | Web, Admin | ✅ |

---

## II. Navigation Components

**Folder**: `Header/`, `Common/`  
**Purpose**: Navigation bars, menus, breadcrumbs

| Component | Props | Usage | Services | Status |
|-----------|-------|-------|----------|--------|
| **BreadCrumb** | items, currentPage | Page navigation hierarchy | Web, Admin | ✅ |
| **Menu** | items, onSelect | Dropdown or context menu | Web, Admin | ✅ |
| **ContextMenu** | items, position | Right-click context menu | Admin | ✅ |
| **TabPanel** | value, children | Tab navigation panel | Web, Admin | ✅ |
| **EditMenu** | onEdit, onDelete | Quick edit/delete actions | Admin | ✅ |

---

## III. Form & Input Components

**Folder**: `Input/`, `Common/`  
**Purpose**: Text inputs, selects, date pickers, custom editors

| Component | Props | Usage | Services | Status |
|-----------|-------|-------|----------|--------|
| **DatePicker** | value, onChange | Select single date | Web, Admin | ✅ |
| **DateRangePicker** | startDate, endDate, onChange | Select date range | Web, Admin | ✅ |
| **BlockNoteInput** | value, onChange | Rich text editor with blocks | Admin | ✅ |
| **MapInput** | value, onChange | Geographic area selector | Admin | ✅ |
| **JSONInput** | value, onChange | JSON editor with validation | Admin | ✅ |

---

## IV. Display & Cards

**Folder**: `Cards/`, `Common/`, `actors/`, `events/`, `groups/`  
**Purpose**: Content cards, entity displays, preview cards

| Component | Props | Usage | Services | Status |
|-----------|-------|-------|----------|--------|
| **EventCard** | event, onClick | Event display card (standard) | Web | ✅ |
| **EventSlimCard** | event, onClick | Compact event card | Web | ✅ |
| **EventCardGrid** | events, onSelect | Grid layout for event cards | Web | ✅ |
| **ActorChip** | actor, onSelect | Compact actor display | Web, Admin | ✅ |
| **ActorCard** | actor, onClick | Actor profile card | Web | ✅ |
| **GroupNode** | group, position | Group display in graph | Web | ✅ |
| **LinkCard** | link, onClick | External link preview | Web, Admin | ✅ |
| **BookCard** | book | Book/media card | Web | ✅ |
| **ErrorBox** | error, onDismiss | Error message display | Web, Admin | ✅ |
| **Modal** | open, onClose, children | Modal dialog | Web, Admin | ✅ |

---

## V. Data Tables & Lists

**Folder**: `lists/`, `Table/`, `Common/`  
**Purpose**: Displaying tabular data, lists of items

| Component | Props | Usage | Services | Status |
|-----------|-------|-------|----------|--------|
| **List** | items, renderItem | Simple vertical list | Web, Admin | ✅ |
| **ListItem** | item, onClick | Single list item | Web, Admin | ✅ |
| **Table** | columns, rows, sortable | Standard data table | Admin | ⚠️ |
| **ExpandableList** | items, renderItem | List with expand/collapse | Web, Admin | ✅ |

---

## VI. Graphs & Visualizations

**Folder**: `Graph/`, `charts/` (if exists)  
**Purpose**: Data visualization, network graphs, charts

| Component | Props | Usage | Services | Status |
|-----------|-------|-------|----------|--------|
| **FlowGraph** | nodes, edges | Directed graph visualization | Web | ⚠️ |
| **FlowGraphBuilder** | graph, onChange | Interactive graph editor | Admin | ⚠️ |
| **ForcedNetworkGraph** | nodes, edges | Force-directed network | Web | ⚠️ |
| **HierarchicalEdgeBundling** | nodes, edges | Hierarchical network layout | Web | ⚠️ |
| **BubbleGraph** | data | Bubble chart visualization | Web | ⚠️ |
| **BarStackGraph** | data | Stacked bar chart | Web | ⚠️ |
| **BarStackHorizontalGraph** | data | Horizontal stacked bars | Web | ⚠️ |
| **PieChartGraph** | data | Pie chart | Web | ⚠️ |
| **SankeyGraph** | data | Sankey diagram | Web | ⚠️ |
| **AxisGraph** | data, xAxis, yAxis | XY axis graph | Web | ⚠️ |
| **Pack** | data | Circle packing visualization | Web | ⚠️ |
| **Tree** | data | Hierarchical tree layout | Web | ⚠️ |
| **EntitreeGraph** | entities | Entity relationship tree | Web | ⚠️ |
| **Network** | nodes, edges | Generic network visualization | Web | ⚠️ |
| **SocietyCollapseForecastGraph** | data | Custom forecasting visualization | Web | ⚠️ |
| **CalendarHeatmap** | data | Calendar heatmap display | Web | ⚠️ |
| **Legends** | items | Chart legend component | Web | ⚠️ |

---

## VII. Media & Gallery

**Folder**: `Media/`, `Gallery/`, `Image/`, `Video/`  
**Purpose**: Image display, galleries, video players

| Component | Props | Usage | Services | Status |
|-----------|-------|-------|----------|--------|
| **Gallery** | images, title | Image gallery with lightbox | Web | ✅ |
| **ImageBlock** | image, alt | Responsive image display | Web, Admin | ✅ |
| **VideoPlayer** | src, title | HTML5 video player | Web | ⚠️ |
| **Avatar** | src, alt, size | User/entity avatar | Web, Admin | ✅ |

---

## VIII. Chat & Messaging

**Folder**: `Chat/`  
**Purpose**: Chat interface components for AI interactions

| Component | Props | Usage | Services | Status |
|-----------|-------|-------|----------|--------|
| **ChatUI** | messages, onSend | Main chat interface | Admin | ⚠️ |
| **ChatInput** | value, onChange, onSend | Chat input bar | Admin | ⚠️ |
| **ChatHeader** | title, onClose | Chat window header | Admin | ⚠️ |
| **MessageBubble** | message, isUser | Single message bubble | Admin | ⚠️ |
| **ContentMessage** | content | System content message | Admin | ⚠️ |
| **ToolMessage** | tool, result | Tool execution message | Admin | ⚠️ |
| **ToolMessageDisplay** | tool | Tool display component | Admin | ⚠️ |
| **StreamingMessage** | content | Streaming response display | Admin | ⚠️ |
| **LoadingMessage** | | Loading indicator in chat | Admin | ⚠️ |
| **WelcomeMessage** | | Welcome/greeting message | Admin | ⚠️ |
| **ProviderSelector** | providers, onChange | LLM provider selector | Admin | ⚠️ |

---

## IX. Counters & Metrics

**Folder**: `Counters/`  
**Purpose**: Statistics, metrics, counter displays

| Component | Props | Usage | Services | Status |
|-----------|-------|-------|----------|--------|
| **Counter** | value, label | Simple counter display | Web | ✅ |
| **ChipCount** | count, label | Compact chip-style counter | Web, Admin | ✅ |
| **WorldPopulationCount** | value | Population metric display | Web | ✅ |
| **CO2LeftBudgetCounter** | remaining | Carbon budget indicator | Web | ✅ |
| **StatAccordion** | stats, title | Expandable statistics | Web | ✅ |

---

## X. Entity-Specific Components

### Actors

**Folder**: `actors/`

| Component | Props | Usage | Services | Status |
|-----------|-------|-------|----------|--------|
| **ActorChip** | actor, onSelect | Compact actor display | Web, Admin | ✅ |
| **ActorCard** | actor, onClick | Actor profile card | Web | ✅ |
| **ActorFamilyTree** | actor | Family tree visualization | Web | ✅ |
| **ActorPageContent** | actor | Actor detail page | Web | ✅ |
| **ActorLink** | actor, text | Link to actor | Web, Admin | ✅ |
| **ActorNode** | actor, position | Actor in graph | Web | ✅ |
| **ActorInlineBlockNote.plugin** | actor | Inline actor mention in editor | Admin | ✅ |

### Events

**Folder**: `events/`

| Component | Props | Usage | Services | Status |
|-----------|-------|-------|----------|--------|
| **EventCard** | event, onClick | Standard event card | Web | ✅ |
| **EventSlimCard** | event, onClick | Compact event card | Web | ✅ |
| **EventCardGrid** | events | Grid of event cards | Web | ✅ |
| **EventPageContent** | event | Event detail page | Web | ✅ |
| **EventIcon** | eventType | Event type icon | Web, Admin | ✅ |
| **EventNode** | event, position | Event in graph | Web | ✅ |
| **EventBlock.plugin** | event | Inline event mention in editor | Admin | ✅ |
| **EventTimelinePlugin** | events | Event timeline in editor | Admin | ✅ |
| **CreateEventCard** | onCreate | Card to create new event | Admin | ✅ |

### Groups

**Folder**: `groups/`

| Component | Props | Usage | Services | Status |
|-----------|-------|-------|----------|--------|
| **GroupNode** | group, position | Group in graph | Web | ✅ |
| **GroupBoxNode** | group, position | Boxed group display | Web | ✅ |
| **GroupBoxNodeContextMenu** | group, position | Context menu for group | Web | ✅ |
| **GroupInlineBlockNote.plugin** | group | Inline group mention in editor | Admin | ✅ |

### Areas/Locations

**Folder**: `area/`

| Component | Props | Usage | Services | Status |
|-----------|-------|-------|----------|--------|
| **AreaChip** | area, onSelect | Compact area display | Web, Admin | ✅ |
| **AreaPageContent** | area | Area detail page | Web | ✅ |
| **AreasMap** | areas | Map showing areas | Web | ⚠️ |
| **AreaInlineBlockNote.plugin** | area | Inline area mention in editor | Admin | ✅ |

### Keywords

**Folder**: `keywords/`

| Component | Props | Usage | Services | Status |
|-----------|-------|-------|----------|--------|
| **KeywordNode** | keyword, position | Keyword in graph | Web | ✅ |
| **KeywordInlineBlockNote.plugin** | keyword | Inline keyword in editor | Admin | ✅ |

### Relations

**Folder**: (likely in Common or nested)

| Component | Props | Usage | Services | Status |
|-----------|-------|-------|----------|--------|
| **RelationInlineBlockNote.plugin** | relation | Inline relation in editor | Admin | ✅ |
| **NetworkLink** | source, target | Link in network graph | Web | ✅ |
| **NetworkNode** | node | Node in network graph | Web | ✅ |

---

## XI. Editor Components

**Folder**: `Common/BlockNote/`, editor plugins (`.plugin.tsx`)  
**Purpose**: Block-based rich text editor integration

| Component | Props | Usage | Services | Status |
|-----------|-------|-------|----------|--------|
| **Editor** | value, onChange | Main BlockNote editor | Admin | ⚠️ |
| **EditorSchema** | | Editor schema definition | Admin | ✅ |
| **BlockNoteEditorContext** | | React context for editor | Admin | ✅ |
| **BlockQuote** | children | Block quote element | Web, Admin | ✅ |
| **LinkBlock.plugin** | | Inline link plugin | Admin | ✅ |
| **MediaBlock.plugin** | | Media insert plugin | Admin | ✅ |
| **TOCPlugin** | | Table of contents plugin | Admin | ✅ |
| **InlineRelationsBoxPlugin** | | Inline relations plugin | Admin | ✅ |
| **MarkdownContent** | content | Markdown display | Web | ✅ |
| **MarkdownRenderer** | markdown | Render markdown to React | Web | ✅ |

---

## XII. Icons & Branding

**Folder**: `Common/Icons/`  
**Purpose**: Custom icon components

| Component | Props | Usage | Services | Status |
|-----------|-------|-------|----------|--------|
| **FAIcon** | icon, size | Font Awesome icon wrapper | Web, Admin | ✅ |
| **EventIcon** | type | Event type icon | Web, Admin | ✅ |
| **FlagIcon** | country | Country flag icon | Web | ✅ |
| **GithubIcon** | size | GitHub logo | Web | ✅ |
| **InstagramIcon** | size | Instagram logo | Web | ✅ |
| **TelegramIcon** | size | Telegram logo | Web | ✅ |

---

## XIII. UI Controls & Interactive

**Folder**: `Common/`, `Input/`, `sliders/`  
**Purpose**: Buttons, sliders, switches, interactive elements

| Component | Props | Usage | Services | Status |
|-----------|-------|-------|----------|--------|
| **Button** (variants) | variant, onClick | Standard button | Web, Admin | ✅ |
| **EditButton** | onEdit | Quick edit button | Admin | ✅ |
| **EditEventButton** | event, onSave | Event edit button | Admin | ✅ |
| **DonateButton** | onDonate | Donation CTA | Web | ✅ |
| **SuggestLinkButton** | onSuggest | Suggest content link | Web | ✅ |
| **Slider** | min, max, value, onChange | Numeric slider | Web, Admin | ✅ |
| **SearchFiltersBox** | filters, onChange | Advanced search filters | Web, Admin | ✅ |
| **ShareButtons** | url | Social share buttons | Web | ✅ |
| **Popover** | open, onClose, children | Popover dialog | Web, Admin | ✅ |

---

## XIV. Utility & Display

**Folder**: `Common/`  
**Purpose**: Text processing, content display, loaders

| Component | Props | Usage | Services | Status |
|-----------|-------|-------|----------|--------|
| **Loader** | isLoading | Loading spinner | Web, Admin | ✅ |
| **FullSizeLoader** | isLoading | Full-page loader | Web, Admin | ✅ |
| **EllipsedContent** | content, maxLines | Truncated text with ellipsis | Web, Admin | ✅ |
| **ErrorDisplay** | error | Error message display | Admin | ✅ |
| **ErrorBox** | error, onDismiss | Dismissible error box | Web, Admin | ✅ |
| **TOC** | content | Table of contents generator | Web | ✅ |
| **ThemeSwitcher** | isDark, onChange | Dark/light mode toggle | Web, Admin | ✅ |

---

## XV. Admin-Only Components

**Folder**: `admin/`  
**Purpose**: Components specific to admin interface

| Component | Props | Usage | Services | Status |
|-----------|-------|-------|----------|--------|
| *Pending inventory* | | | Admin | ⚠️ |

---

## XVI. Special/Experimental Components

**Folder**: `GeoCustom/`  
**Purpose**: Geographic and custom visualizations

| Component | Props | Usage | Services | Status |
|-----------|-------|-------|----------|--------|
| **GeoCustom** | geo, data | Custom geographic visualization | Web | ⚠️ |

---

## Component Status Legend

| Status | Meaning | Action Required |
|--------|---------|-----------------|
| ✅ | Complete & stable | None |
| ⚠️ | In progress or needs review | Needs testing |
| ❌ | Broken or deprecated | Remove or fix |
| 🔄 | In refactoring | Wait for completion |

---

## Component Status Tracking

See `COMPONENT_STATUS.md` for detailed tracking of:
- Dark mode support
- Accessibility (WCAG AA)
- Responsive design
- TypeScript types
- Storybook stories
- JSDoc documentation

---

## Deprecated Components

(None currently documented - update as components are retired)

---

## Component Consolidation Opportunities

Components that could potentially be merged or standardized:

1. **Event Cards**: `EventCard`, `EventSlimCard`, `EventCardGrid`
   - Consider: Single parameterized component with density variants

2. **Graph Components**: Multiple visualization types
   - Consider: Generic graph component with type switching

3. **Entity Chips**: `ActorChip`, `AreaChip`, similar patterns
   - Consider: Generic `EntityChip` component

4. **Icon Components**: Multiple icon wrappers
   - Consider: Single icon wrapper component

---

## New Component Checklist

When adding a new component:

- [ ] Created in appropriate folder (see category structure above)
- [ ] Named following conventions (see `NAMING_CONVENTIONS.md`)
- [ ] Added to this inventory
- [ ] Added to `COMPONENT_STATUS.md`
- [ ] Created Storybook story (`Component.stories.tsx`)
- [ ] Added JSDoc comments
- [ ] TypeScript props interface defined
- [ ] Dark mode tested
- [ ] Accessibility tested (WCAG AA)
- [ ] Responsive design tested

---

## Component Search by Use Case

### I need a component to display...

**...a person**
→ `ActorCard`, `ActorChip`, or `Avatar`

**...an organization**
→ `GroupNode`, `GroupBoxNode`, or entity card pattern

**...a location**
→ `AreaChip` or `AreasMap`

**...a fact-check/event**
→ `EventCard`, `EventSlimCard`, or `EventCardGrid`

**...a link/resource**
→ `LinkCard`

**...an error**
→ `ErrorBox` or `ErrorDisplay`

**...a loading state**
→ `Loader` or `FullSizeLoader`

**...a chart/graph**
→ Choose from Graph folder based on data type

**...a form input**
→ `DatePicker`, `DateRangePicker`, `BlockNoteInput`, or `MapInput`

**...a menu**
→ `Menu` or `ContextMenu`

**...a list**
→ `List`, `ExpandableList`, or custom with `ListItem`

---

## Services & Component Availability

### lies.exposed (Public Web)
Primary consumers: Display, visualization, content cards, galleries

**Key components**: EventCard, ActorCard, graphs, galleries, social sharing

### admin.lies.exposed (Admin)
Primary consumers: Forms, tables, editors, controls, workflows

**Key components**: Editor, DatePicker, SearchFiltersBox, tables, modals

---

## Folder Structure Reference

```
packages/@liexp/ui/src/components/
├── Common/              (26 shared components)
├── actors/             (7 actor-specific)
├── area/               (4 location-specific)
├── Cards/              (5 card types)
├── Chat/               (10 chat interface)
├── Counters/           (4 metric displays)
├── events/             (9 event-specific)
├── FullSizeSection/    (2 layout)
├── Gallery/            (2 gallery)
├── GeoCustom/          (1 custom geo)
├── Graph/              (14 visualization)
├── groups/             (4 group-specific)
├── Header/             (navigation)
├── Image/              (2 image display)
├── Input/              (5 inputs)
├── keywords/           (1 keyword)
├── lists/              (3 list types)
├── Media/              (3 media types)
├── Modal/              (2 modal)
├── mui/                (MUI wrappers)
├── sliders/            (2 sliders)
├── stories/            (4 storybook)
├── Table/              (2 table)
├── Video/              (1 video)
├── admin/              (admin-specific)
└── [plugins & utilities]
```

---

**Last Updated**: February 2026  
**Version**: 1.0-DRAFT  
**Maintained by**: Design System Team

For detailed component documentation, see individual Storybook stories in `services/storybook/`.
