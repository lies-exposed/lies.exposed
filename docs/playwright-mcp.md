# Playwright MCP Documentation

The Playwright MCP server runs in Docker and provides browser automation tools for UI testing and debugging.

## Starting the Server

```bash
docker compose up playwright-mcp.liexp.dev
```

It starts automatically with `docker compose up`.

## Available Tools

- **navigate(url)** - Go to a URL
- **screenshot()** - Capture page screenshot
- **click(selector)** - Click an element
- **fill(selector, text)** - Type text into a field
- **getElementText(selector)** - Extract element text
- **getAttribute(selector, attribute)** - Get element attributes
- **inspect()** - List all elements on page
- **goBack()** - Navigate to previous page
- **waitForNavigation()** - Wait for page load
- **evaluate(code)** - Execute JavaScript on page

## Test URLs (Inside Docker Network)

- **Admin UI**: http://admin.liexp.dev
- **Web UI**: http://web.liexp.dev
- **API**: http://api.liexp.dev

## Test Credentials

```
Username: testadmin@lies.exposed
Password: TestAdmin123!@#
```

## How to Use

1. Ensure the Playwright MCP server is running in Docker
2. Use Playwright MCP tools in your automation tasks to interact with local services
3. Common workflow:
   - Navigate to a URL
   - Take screenshots for visual verification
   - Inspect page structure
   - Interact with forms/buttons
   - Wait for navigation/changes
   - Verify results

### Example Workflow

```
1. navigate("http://admin.liexp.dev")
2. screenshot() -> inspect login page
3. fill("input[type='email']", "testadmin@lies.exposed")
4. fill("input[type='password']", "TestAdmin123!@#")
5. click("button[type='submit']")
6. waitForNavigation()
7. screenshot() -> verify dashboard loaded
```

## Debugging

```bash
# View logs
docker compose logs playwright-mcp.liexp.dev -f

# Restart service
docker compose restart playwright-mcp.liexp.dev
```
