# Mobile Responsiveness

Reference notes for the mobile-responsive implementation across the admin and web services.

---

## Docker / Build Workflow

When making code changes you **do not** need to rebuild the Docker image. Rebuild only the TypeScript output:

```bash
pnpm build          # full project
pnpm admin build    # admin service only
pnpm ui build       # @liexp/ui package only
pnpm web build      # web service only
```

Only rebuild the Docker image when:
- New dependencies were added to `pnpm-lock.yaml`
- Docker environment configuration changed
- A clean build from scratch is required

---

## Key Fixes Applied

### 1. MUI Toolbar height on mobile

**Problem:** `MuiToolbar` had `flexDirection: "column"` stacking all header elements vertically, consuming excessive space on mobile.

**Fix** (`packages/@liexp/ui/src/theme/index.ts`):
- Changed `MuiToolbar` to `flexDirection: "row"` on all viewports
- Added `minHeight: 48px` / `height: 48px` at `theme.breakpoints.down("sm")`

Result: header compresses from 64px (desktop) to 48px (mobile), title font shrinks to 12px, `menuLeft` (GitHub, Telegram, Donate) hides on mobile.

### 2. EditForm overflow blocking Save/Delete buttons

**Problem:** `overflow: "hidden"` on two containers in `EditForm.tsx` prevented users from scrolling to reach action buttons on mobile.

**Fix** (`packages/@liexp/ui/src/components/admin/common/EditForm.tsx`):
- Outer container: `overflow: "hidden"` → `overflow: "visible"`
- Form grid: `overflow: "hidden"` → `overflow: "auto"`

### 3. Actor Edit Form responsive layout

**File:** `services/admin/src/pages/actors/ActorEdit.tsx`

Generals tab grid:
```tsx
<Grid size={{ xs: 12, md: 8 }}>   {/* main: full-width on mobile, 66% on desktop */}
<Grid size={{ xs: 12, md: 4 }}>   {/* avatar/color: full-width on mobile, 33% on desktop */}
<Grid size={{ xs: 12, sm: 6 }}>   {/* date fields: stacked on mobile, side-by-side on tablet */}
```

Relations tab grid:
```tsx
<Grid size={{ xs: 12, md: 6 }}>   {/* forms */}
<Grid size={{ xs: 12, md: 6 }} sx={{ minHeight: { xs: 300, md: 600 } }}>  {/* family tree */}
```

ColorInput (`packages/@liexp/ui/src/components/admin/common/inputs/ColorInput.tsx`):
```tsx
<Stack
  direction={isMobile ? "column" : "row"}
  spacing={isMobile ? 1 : 2}
  alignItems={isMobile ? "stretch" : "center"}
  style={{ padding: isMobile ? "8px 12px" : "10px 20px" }}
>
```

### 4. Actor list columns on mobile (web service)

Event card grids use `columns={{ xs: 12, sm: 6, md: 4 }}` so cards stack full-width on mobile instead of rendering as narrow side-by-side columns.

---

## MUI Breakpoints Reference

| Name | Range | Typical device |
|------|-------|----------------|
| xs   | 0–599px | Phone portrait |
| sm   | 600–959px | Phone landscape / small tablet |
| md   | 960px+ | Tablet landscape / desktop |

---

## Open Issues

See [`links-overflow.md`](./links-overflow.md) for outstanding mobile overflow issues on the Links admin page.
