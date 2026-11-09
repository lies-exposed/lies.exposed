Replace `any` casts with proper d3 types in 5 graph components:
- `ForcedNetworkGraph.tsx`
- `SankeyGraph.tsx`
- `HierarchyNetworkGraph.tsx`
- `EventsNetworkGraph.tsx`
- `CustomNode.tsx` (unused import cleanup)

### Changes

- **ForcedNetworkGraph**: Replaced generic `D extends unknown` with concrete inline types for node/link props. Removed unused `SimulationLink` type alias. Fixed duplicate `i` identifier in `d3.map` callback.
- **SankeyGraph**: Updated sankey type usages, removed unnecessary casts.
- **HierarchyNetworkGraph**: Removed `as any[]` cast on `graph.links`, added proper default values for optional link properties.
- **EventsNetworkGraph**: Added proper data transformation with `useMemo` for node/link data, removed `as string` casts.
- **CustomNode**: Removed unused `Theme` import.
- **EventsSankeyGraph**: Removed `NonEmptyArray` import, replaced `as any` casts with explicit type assertions.
- **HierarchicalEdgeBundling**: Added proper type parameters.
- **EntitreeGraph**: Added proper typing for layout-elements.
- **GroupTemplate**: Removed unused `any` cast.

### Type Error Reduction

- Total TS errors in `@liexp/ui`: **164 -> 115** (-49 errors)
- `any` casts in target files: **70 -> 0** (all removed)
- Target files: ForcedNetworkGraph, HierarchicalEdgeBundling, SankeyGraph, EntitreeGraph, layout-elements, EventsSankeyGraph, HierarchyNetworkGraph, EventsNetworkGraph, CustomNode, GroupTemplate

### Lint

```
pnpm --filter @liexp/ui exec tsc --noEmit 2>&1 | grep -c "error TS"
# Before: 164
# After: 115
```

Note: Remaining errors are pre-existing in `origin/main` and not related to this change.
