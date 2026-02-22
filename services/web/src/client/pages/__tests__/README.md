# Mobile Responsiveness Tests

This directory contains Playwright E2E tests for validating mobile responsiveness fixes in the lies.exposed web application.

## Test File Overview

### `responsive.spec.ts`

Comprehensive Playwright E2E test suite that validates the following responsive design fixes:

1. **Responsive Media Grid**
   - 1 column on mobile (375px)
   - 2 columns on tablet (768px)
   - 3+ columns on desktop (1440px)

2. **Responsive Graph Heights**
   - 300px or less on mobile
   - 400px+ on desktop

3. **Responsive Card Spacing**
   - 32px or less on mobile
   - 48px+ on desktop

4. **Responsive Page Templates**
   - Full-width layout on mobile
   - Sidebar layout on desktop (when applicable)

5. **Header Menu Text Truncation**
   - Text truncation on mobile
   - Full text display on desktop

6. **Layout Overflow Prevention**
   - No horizontal scrolling on any viewport size
   - Images scale responsively

## Test Structure

The test suite includes the following test groups:

- **Index Page Loading Across Viewports** - Verifies page loads at 375px, 768px, 1440px
- **Media Grid Responsiveness** - Tests grid column count at different breakpoints
- **Graph Container Responsiveness** - Validates graph heights for different viewports
- **Card Spacing Responsiveness** - Checks spacing between card elements
- **Page Layout Template Responsiveness** - Validates layout switching between mobile/desktop
- **Header Menu Text Truncation** - Tests menu behavior at different widths
- **Layout Overflow Prevention** - Ensures no horizontal overflow at any size
- **Responsive Image Scaling** - Validates image responsive behavior

## Prerequisites

### 1. Docker Services Running

The test requires the Docker development environment to be running:

```bash
# From repository root
docker compose up -d
```

This starts:
- `web.liexp.dev` - Web application service (port 3000)
- `api.liexp.dev` - API service (port 3001)
- Database and other supporting services

Verify web service is running:
```bash
docker ps | grep web.liexp.dev
```

### 2. Playwright Browser Dependencies

Install Playwright browsers:

```bash
cd services/web
pnpm exec playwright install
```

Or from repository root:
```bash
pnpm --filter web exec playwright install
```

### 3. Network Connectivity

**CRITICAL**: The tests use Docker network URLs, not localhost:

- ✅ Correct: `http://web.liexp.dev`
- ❌ Wrong: `http://localhost:3000`

The Docker compose setup provides DNS resolution for these service names within the Docker network.

## Running the Tests

### Run All Responsive Tests

```bash
cd services/web
pnpm test:e2e
```

Or from repository root:
```bash
pnpm --filter web test:e2e
```

### Run Specific Test Group

```bash
cd services/web
pnpm test:e2e -- --grep "Media Grid Responsiveness"
```

### Run Tests with Watch Mode

```bash
cd services/web
pnpm test:e2e -- --watch
```

### Run Tests with UI

```bash
cd services/web
pnpm test:e2e -- --ui
```

This opens Playwright's UI mode for interactive debugging.

### Run Specific Viewport Tests

```bash
cd services/web
pnpm test:e2e -- --grep "mobile viewport"
```

## Test Configuration

### Viewport Sizes

The tests use realistic device sizes:

| Device | Width | Height | Name |
|--------|-------|--------|------|
| Mobile | 375px | 667px | iPhone SE |
| Tablet | 768px | 1024px | iPad |
| Desktop | 1440px | 900px | 1440p Monitor |

These can be customized in the `VIEWPORTS` object in `responsive.spec.ts`.

### Timeout Settings

- Default element wait: 10 seconds
- Default navigation timeout: 10 seconds

These can be adjusted in the `beforeEach` hook if needed.

### Base URL

The test base URL is:
```typescript
const TEST_BASE_URL = "http://web.liexp.dev";
```

This must match your Docker service setup. If running with different URLs, update this constant.

## Test Coverage

### What Gets Tested

✅ Page loading and rendering at different viewport sizes
✅ No horizontal scrolling/overflow at any size
✅ Grid column count adjusts by breakpoint
✅ Graph/chart heights scale appropriately
✅ Card spacing changes responsively
✅ Layout templates adapt (full-width vs sidebar)
✅ Header menu adapts to space constraints
✅ Images scale responsively

### What's Not Tested

- ❌ JavaScript interactions (click, form submission)
- ❌ API calls and data loading
- ❌ Functionality of interactive components
- ❌ Browser-specific rendering quirks

These are covered by other test suites (unit tests, integration tests).

## Debugging Failed Tests

### Common Issues

#### 1. Connection Refused Error
```
Error: connect ECONNREFUSED 127.0.0.1:3000
```

**Solution**: Ensure Docker services are running and use correct URL:
```bash
docker compose up -d
# Check in test: http://web.liexp.dev (not localhost)
```

#### 2. Timeout Waiting for Element
```
error: Timeout 10000ms exceeded when waiting for locator
```

**Solution**: Increase timeout or wait for page load:
```bash
page.setDefaultTimeout(15000);
await page.goto(url, { waitUntil: "networkidle" });
```

#### 3. Element Not Found
```
Error: Failed to find matching element
```

**Solution**: Adjust CSS selectors in test. Common selectors:
- `[class*='grid']` - Elements with "grid" in class name
- `[class*='card']` - Elements with "card" in class name
- `[role='article']` - Article role elements

#### 4. Screenshot Differences

If visual comparison tests are added, images are saved to:
```
services/web/test-results/
```

View screenshots to debug visual regressions.

## Adding New Tests

To add new responsive tests:

1. Add test under appropriate `describe` block
2. Use standard Playwright locator syntax
3. Set viewport using `page.setViewportSize()`
4. Verify behavior with `expect()` assertions
5. Use `page.evaluate()` for computed styles

Example:
```typescript
it("should do something responsive", async () => {
  if (!page) throw new Error("Page not initialized");

  await page.setViewportSize({
    width: VIEWPORTS.mobile.width,
    height: VIEWPORTS.mobile.height,
  });

  await page.goto(`${TEST_BASE_URL}/`, { waitUntil: "networkidle" });

  const element = page.locator("[class*='my-element']");
  await expect(element).toBeVisible();

  // Add assertion
  expect(someValue).toBe(expectedValue);
});
```

## Documentation

- [Playwright API](https://playwright.dev/docs/api/class-page)
- [Vitest Docs](https://vitest.dev/)
- [Project Playwright MCP Guide](../../../docs/playwright-mcp-agent-guide.md)

## Notes

- Tests use Chromium browser (default in Playwright)
- Each test gets a fresh page instance
- Browser is closed after each test (afterEach hook)
- Tests are independent and can run in parallel

## CI/CD Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Responsive Tests
  run: pnpm --filter web test:e2e
  env:
    CI: true
```

Note: CI environments must have Docker available and services running.
