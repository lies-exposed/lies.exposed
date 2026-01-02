# Web Service E2E Tests

This directory contains End-to-End tests for the web service that test the new Vite server helper implementation.

## Test Structure

### Test Files

- **`WebAppTest.ts`** - Main test helper for creating web server instances
- **`web-server.e2e.test.ts`** - Core server functionality tests (development mode)
- **`web-server-production.e2e.test.ts`** - Production-specific server tests
- **`vite-server-helper.e2e.test.ts`** - Vite server helper integration tests
- **`testSetup.ts`** - Global test configuration

### Test Categories

#### Basic Server Functionality
- Health check endpoints
- Root route serving
- SPA routing fallback
- Error handling

#### Static File Serving
- Asset serving with correct headers
- Missing file handling
- Content-type detection

#### Server-Side Rendering (SSR)
- HTML structure validation
- Meta tag inclusion
- Route-specific rendering
- Template transformations

#### Production Mode Features
- Static file serving from build directory
- Compression configuration
- Error message sanitization
- Performance characteristics

#### Vite Integration
- Development server features
- HMR functionality
- File transformation
- Base path configuration

## Running Tests

### Prerequisites

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Build the project (for production tests):
   ```bash
   pnpm build:app-server
   ```

### Test Commands

```bash
# Run all E2E tests
pnpm test:e2e

# Run tests in watch mode
pnpm test:e2e:watch

# Run with coverage
pnpm test:e2e:coverage
```

### Individual Test Suites

```bash
# Development mode tests
npx vitest run test/web-server.e2e.test.ts

# Production mode tests
npx vitest run test/web-server-production.e2e.test.ts

# Vite helper tests
npx vitest run test/vite-server-helper.e2e.test.ts
```

## Test Environment

The tests create isolated server instances with:

- **Mock API providers** for external dependencies
- **Test-specific middleware** for debugging
- **Temporary HTML templates** for consistent testing
- **Dynamic port allocation** to avoid conflicts

## Configuration

### Environment Variables

Tests set the following environment variables:

- `NODE_ENV=test`
- `VITE_NODE_ENV=test`
- `VITE_DEBUG=@liexp:*:error`
- `VITE_API_URL=http://localhost:3001/v1`
- `VITE_SSR_API_URL=http://localhost:3001/v1`

### Test Timeouts

- Test timeout: 30 seconds
- Hook timeout: 30 seconds

## Test Patterns

Following the project's testing guidelines:

### ✅ Good Practices
- Test specific expected outcomes: `expect(status).toBe(200)`
- Use descriptive test names
- Test both development and production modes
- Verify error handling and edge cases

### ❌ Avoid
- Negative assertions: `expect(status).not.toBe(500)`
- Testing what should NOT happen
- Hardcoded ports or URLs
- Shared state between tests

## Debugging

### Enable Debug Logging

Set the `VITE_DEBUG` environment variable:

```bash
VITE_DEBUG="@liexp:*" pnpm test:e2e
```

### Test-Specific Debugging

Each test instance includes a logger accessible via `Test.logger`:

```typescript
Test.logger.info.log("Custom debug message");
```

## Extending Tests

### Adding New Test Cases

1. Follow existing patterns in test files
2. Use the `WebAppTest` helper for server setup
3. Clean up resources in `afterAll` hooks
4. Test both success and error scenarios

### Testing New Features

1. Add tests to appropriate category
2. Use mock data and providers
3. Verify both functional and non-functional requirements
4. Include edge cases and error conditions

## Troubleshooting

### Common Issues

1. **Port conflicts**: Tests use dynamic port allocation to avoid conflicts
2. **File not found**: Tests create temporary files as needed
3. **Timeout errors**: Increase test timeout if needed
4. **Build required**: Production tests require running `pnpm build:app-server`

### Getting Help

Check the logs for detailed error information:

```bash
VITE_DEBUG="@liexp:*" pnpm test:e2e --reporter=verbose
```