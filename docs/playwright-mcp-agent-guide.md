# Playwright MCP Agent Guide

This guide is designed for AI agents (Claude, GitHub Copilot, or any other AI agent tool) who need to automate UI testing and browser interactions in this project.

## What is Playwright MCP?

Playwright MCP is a browser automation service running in Docker that enables you to:
- Navigate to web applications
- Interact with forms (type text, click buttons, submit)
- Capture screenshots for visual verification
- Extract text and attributes from page elements
- Execute custom JavaScript
- Wait for page changes and navigation

## When to Use Playwright MCP

Use Playwright MCP when you need to:
- Test that UI changes work correctly
- Verify application layouts and responsiveness
- Test form submissions and interactions
- Create visual records of application state
- Automate UI-based testing workflows
- Test mobile responsiveness at different viewport sizes

## Prerequisites

Playwright MCP must be running in Docker. The service is configured in `docker-compose.yml` and starts automatically with:

```bash
docker compose up
```

Or explicitly:

```bash
docker compose up playwright-mcp.liexp.dev
```

**Verify it's running:**
```bash
docker ps | grep playwright-mcp.liexp.dev
```

You should see the container with status `Up`.

## CRITICAL: Docker Network URLs

**This is the most important configuration detail.**

When accessing services from Playwright MCP (running inside Docker), you MUST use the internal Docker network URLs:

| Service | Correct URL | ❌ Do NOT use |
|---------|-------------|-------------|
| Admin UI | `http://admin.liexp.dev` | `http://localhost:3002` |
| Web UI | `http://web.liexp.dev` | `http://localhost:3000` |
| API | `http://api.liexp.dev` | `http://localhost:3001` |

### Why This Matters

Playwright MCP runs inside the Docker network where services register with their internal DNS names. Using `localhost` will fail because it refers to the Playwright container itself, not the host machine.

**If you see connection errors:**
1. Check your URL matches the table above (no `localhost`)
2. Verify the service is running: `docker ps`
3. Check logs: `docker logs admin.liexp.dev`

## Test Credentials

Use these credentials for testing authentication:

```
Username: playwright@lies.exposed
Password: PlaywrightTest123!@#
```

These accounts are available in the development environment for testing purposes.

## Available Tools

### navigate(url)
Navigate to a URL.

```
navigate("http://admin.liexp.dev")
```

Other examples:
```
navigate("http://web.liexp.dev")
navigate("http://admin.liexp.dev/actors/list")
```

### screenshot()
Capture a screenshot of the current page.

```
screenshot()
```

This creates an image showing the current viewport state. Use it to verify:
- Layout and positioning
- Element visibility
- Button/form appearance
- Responsive design at different sizes

### click(selector)
Click an element on the page.

```
click("button[type='submit']")
click("a.logout-button")
```

**Selector examples:**
- Button by type: `button[type='submit']`
- By class: `button.primary-action`
- By name attribute: `button[name='save']`
- By text content: `button:has-text('Save')`

### fill(selector, text)
Type text into a form field.

```
fill("input[type='email']", "playwright@lies.exposed")
fill("input[type='password']", "PlaywrightTest123!@#")
```

**Tips:**
- `fill()` automatically clears existing content first
- Works on `<input>` and `<textarea>` elements
- Use CSS selectors to identify the field

### getElementText(selector)
Extract text content from an element.

```
getElementText("h1")
getElementText(".error-message")
getElementText("button.status")
```

Returns the text content for verification or assertion.

### getAttribute(selector, attribute)
Get an attribute value from an element.

```
getAttribute("img.logo", "src")
getAttribute("a.learn-more", "href")
getAttribute("input[name='email']", "placeholder")
```

Returns the attribute value or null if not found.

### inspect()
List all elements on the current page.

```
inspect()
```

This returns a structured view of the page DOM. Use it when:
- You're unsure of correct selectors
- You want to understand page structure
- You need to find elements before interacting

### goBack()
Navigate to the previous page.

```
goBack()
```

Equivalent to browser back button.

### waitForNavigation()
Wait for page navigation to complete.

```
click("a.next-page")
waitForNavigation()
screenshot()
```

Use this after actions that trigger page navigation (clicking links, submitting forms). Without it, you may interact with elements before the new page loads.

### evaluate(code)
Execute custom JavaScript code in page context.

```
evaluate("document.title")
evaluate("window.innerWidth")
evaluate("document.querySelectorAll('button').length")
```

Returns the JavaScript expression result. Use for:
- Getting page metadata (title, URL)
- Querying computed styles
- Counting elements
- Checking page state

## Example Workflows

### Workflow 1: Login and Verify Dashboard

Login to the admin interface and verify successful authentication.

```
navigate("http://admin.liexp.dev")
screenshot()

fill("input[type='email']", "playwright@lies.exposed")
fill("input[type='password']", "PlaywrightTest123!@#")
click("button[type='submit']")

waitForNavigation()
screenshot()

# Verify dashboard title
getElementText("h1")
```

**Expected result:** Successfully logged in, dashboard visible.

### Workflow 2: Test Form Submission

Navigate to a form, fill fields, submit, and verify success.

```
navigate("http://admin.liexp.dev/actors/create")
screenshot()

fill("input[name='fullName']", "Test Actor")
fill("textarea[name='biography']", "Test biography content")
fill("input[name='color']", "#FF5733")

click("button[type='submit']")
waitForNavigation()

screenshot()
getElementText(".success-message")
```

**Expected result:** Form submitted, success message displayed.

### Workflow 3: Test Mobile Responsiveness

Navigate to a page and verify it displays correctly on mobile viewport.

```
navigate("http://admin.liexp.dev")
screenshot()

# Verify key elements are visible
inspect()

# Check button sizes and spacing
getElementText("button.primary")
getAttribute("button.primary", "class")
```

**Things to verify:**
- No horizontal scrolling needed
- Touch targets (buttons) are at least 32px
- Text is readable
- Layout doesn't break

### Workflow 4: Test List Navigation

Navigate through pages in a list or table.

```
navigate("http://admin.liexp.dev/actors")
screenshot()

# Click next page button
click("button.next-page")
waitForNavigation()
screenshot()

# Verify we're on page 2
getElementText(".pagination-info")
```

**Expected result:** Navigate to next page successfully.

### Workflow 5: Test Responsive Design

Test the same page at different viewport widths.

```
# Test at mobile viewport (375px)
navigate("http://admin.liexp.dev")
screenshot()

# Verify mobile layout - no horizontal overflow
# Check that header menu is accessible
# Verify buttons are touch-friendly

# You can check viewport size with:
evaluate("window.innerWidth")
```

## Troubleshooting

### Connection Refused

**Error:** "Failed to connect to http://admin.liexp.dev"

**Solutions:**
1. Check URL is correct (no `localhost`):
   - ✅ `http://admin.liexp.dev`
   - ❌ `http://localhost:3002`

2. Verify service is running:
   ```bash
   docker ps | grep admin.liexp.dev
   ```

3. Check logs:
   ```bash
   docker logs admin.liexp.dev
   ```

### Element Not Found

**Error:** "Cannot find element matching selector 'button.save'"

**Solutions:**
1. Use `inspect()` to see all page elements
2. Verify element exists and is visible (not hidden with `display: none`)
3. Check CSS selector syntax
4. Use `waitForNavigation()` if element appears after page load

### Form Field Not Filling

**Error:** `fill()` executes but field stays empty

**Solutions:**
1. Verify field is `<input>` or `<textarea>` element
2. Try clicking first, then filling:
   ```
   click("input[name='field']")
   fill("input[name='field']", "value")
   ```
3. Check for custom input handlers or validation

### Navigation Not Completing

**Error:** `waitForNavigation()` times out

**Solutions:**
1. Verify the action triggered navigation (check with screenshot)
2. Check service logs for backend errors:
   ```bash
   docker logs api.liexp.dev
   ```
3. Verify page actually navigated to expected URL

### Screenshot Looks Wrong

**Issues:** Blurry, cut off, or incomplete

**Solutions:**
1. Always use `waitForNavigation()` after navigation
2. Ensure page fully loaded before screenshot
3. Verify viewport matches expectations (mobile vs desktop)
4. Check for overlays or modals blocking content

## Debugging and Diagnostics

### View What's on the Page

```
# See all elements
inspect()

# Get a visual screenshot
screenshot()
```

### Check Docker Services

```bash
# See all running containers
docker ps

# Look for these services:
# - playwright-mcp.liexp.dev
# - admin.liexp.dev
# - web.liexp.dev
# - api.liexp.dev
```

### Check Service Logs

```bash
# View logs for a service
docker logs admin.liexp.dev

# Follow logs in real-time (Ctrl+C to stop)
docker logs -f admin.liexp.dev

# View Playwright MCP logs
docker logs playwright-mcp.liexp.dev
```

### Test Network Connectivity

```bash
# Check if admin service is reachable from Docker network
docker exec playwright-mcp.liexp.dev curl http://admin.liexp.dev

# If successful, you'll see HTML output
# If failed, there's a Docker network issue
```

### Inspect Docker Network

```bash
# List Docker networks
docker network ls

# Inspect the lies-exposed network
docker network inspect lies-exposed_reverseproxy
```

## Best Practices

1. **Always wait after navigation**
   ```
   click("link")
   waitForNavigation()
   screenshot()
   ```

2. **Use specific selectors**
   - ✅ Good: `button[type='submit']`, `input[name='email']`
   - ❌ Bad: `button:nth-child(3)` (breaks with layout changes)

3. **Verify with screenshots**
   - Take screenshots after major actions
   - Compare expected vs actual UI state

4. **Remember Docker URLs**
   - ✅ `http://admin.liexp.dev`
   - ❌ `http://localhost:3002`

5. **Focus on one task per workflow**
   - Each workflow should test one feature
   - Makes it easier to debug failures

6. **Check logs when stuck**
   - Service logs often explain why actions failed
   - Check both Playwright and application logs

7. **Use inspect() to explore**
   - When unsure about selectors, use `inspect()`
   - Understand page structure before writing selectors

## Mobile Testing Specifics

When testing mobile responsiveness at 375x667 (iPhone SE size):

1. Header should remain accessible
2. Buttons should be at least 32px tall/wide
3. Forms should fit viewport without horizontal scroll
4. Text should be readable without zooming
5. Touch targets should be well-spaced

**Test mobile layout:**
```
navigate("http://admin.liexp.dev")
screenshot()

# Verify header is visible and functional
click("button.menu-toggle")
screenshot()

# Verify form buttons are visible
navigate("http://admin.liexp.dev/actors/edit/1")
screenshot()

# Check button sizes
getAttribute("button[type='submit']", "style")
```

## Related Documentation

- `docs/playwright-mcp.md` - Technical reference documentation
- `AGENTS.md` - Project conventions and patterns for AI agents
- `docker-compose.yml` - Service configuration

## Summary

Key points to remember:
1. **Use Docker internal URLs** (`http://admin.liexp.dev`, not `localhost`)
2. **Always wait for navigation** before interacting with new content
3. **Take screenshots** to verify UI state
4. **Use selectors carefully** - test with `inspect()` first
5. **Check logs** when troubleshooting
6. **Test one feature at a time** in focused workflows
