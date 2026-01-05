import * as fs from "fs";
import { fileURLToPath } from "node:url";
import * as path from "path";
import { GetLogger, type Logger } from "@liexp/core/lib/logger/index.js";
import { fc } from "@liexp/test/lib/index.js";
import type * as e from "express";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import supertest from "supertest";
import type TestAgent from "supertest/lib/agent.js";
import { type AdminProxyENV } from "../src/server/io/ENV.js";
import {URL} from '@liexp/shared/lib/io/http/Common/URL.js'
import { AuthPermission } from "@liexp/shared/io/http/auth/permissions/index.js";
import {createApp} from '../src/server/createApp.js'

// Get service root directory (resolves to services/admin-web/)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVICE_ROOT = path.resolve(__dirname, "..");

export interface AdminAppTest {
  app: e.Express;
  req: TestAgent<supertest.Test>;
  logger: Logger;
  env: AdminProxyENV;
}

let adminAppTest: AdminAppTest | undefined = undefined;
let mswServer: ReturnType<typeof setupServer> | undefined = undefined;

// MSW API Handlers for agent service mock
const createAgentApiHandlers = () => [
  // Agent chat message mock
  http.post("http://mock-agent/api/v1/chat/message", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      data: {
        id: fc.sample(fc.uuid(), 1)[0],
        message: `Mock response to: ${(body as any)?.content || "unknown"}`,
        timestamp: new Date().toISOString(),
        modelUsed: "mock-model",
        tokensUsed: fc.sample(fc.integer({ min: 10, max: 100 }), 1)[0],
      },
    });
  }),

  // Catch-all for other agent API calls
  http.get("http://mock-agent/api/*", () => {
    return HttpResponse.json({
      data: null,
      message: "Mock agent endpoint",
    });
  }),

  http.post("http://mock-agent/api/*", () => {
    return HttpResponse.json({
      data: null,
      message: "Mock agent endpoint",
    });
  }),
];

export const createAdminServerTest = async (
  isProduction = false,
): Promise<AdminAppTest> => {
  const logger = GetLogger("admin-test");

  logger.info.log("Creating admin server test (production: %s)", isProduction);

  // Set up MSW server for mocking agent service
  if (!mswServer) {
    mswServer = setupServer(...createAgentApiHandlers());

    // Start MSW server
    mswServer.listen({
      onUnhandledRequest: "warn", // Allow non-mocked requests to pass through
    });

    logger.info.log("MSW server started for agent API mocking");
  }

  // Create mock environment
  const mockEnv: AdminProxyENV = {
    NODE_ENV: isProduction ? "production" : "development",
    DEBUG: "@liexp:*,-@liexp:debug",
    VITE_PUBLIC_URL: "http://admin.liexp.test",
    SERVER_PORT: 0, // Use random port for tests
    SERVER_HOST: "127.0.0.1",
    JWT_SECRET: "test-jwt-secret-for-admin-tests",
    AGENT_API_URL: "http://mock-agent/api/v1" as unknown as URL,
    SERVICE_CLIENT_ID: fc.sample(fc.uuid(), 1)[0] as any,
    SERVICE_CLIENT_USER_ID: fc.sample(fc.uuid(), 1)[0] as any,
    SERVICE_CLIENT_PERMISSIONS: ["admin:read", "admin:create"] as AuthPermission[],
    RATE_LIMIT_WINDOW_MS: 60000,
    RATE_LIMIT_MAX_REQUESTS: 100,
  };

  // Ensure test files exist for production mode
  if (isProduction) {
    const cwd = process.cwd();
    const buildDir = path.resolve(cwd, "build");
    const indexFile = path.resolve(buildDir, "index.html");

    // Create test build structure if it doesn't exist
    if (!fs.existsSync(indexFile)) {
      fs.mkdirSync(buildDir, { recursive: true });
      fs.writeFileSync(
        indexFile,
        `<!DOCTYPE html>
<html>
<head>
  <title>Admin Web App - Production Test</title>
  <link rel="icon" type="image/svg+xml" href="/vite.svg" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/assets/index.js"></script>
</body>
</html>`,
      );
    }
  }

  // Verify the TypeScript source server entry exists (used by both development and production)
  const srcDir = path.resolve(SERVICE_ROOT, "src", "server");
  const serverEntry = path.resolve(srcDir, "server.tsx");
  if (!fs.existsSync(serverEntry)) {
    throw new Error(
      `Server entry source file not found at ${serverEntry}. ` +
        `Make sure the TypeScript source file exists.`,
    );
  }

  // Note: Development mode uses the existing index.html file
  // No need to create a mock file since it already exists
  
  // Mock JWT verification for testing
  const originalVerifyJWT = process.env.NODE_ENV;
  process.env.NODE_ENV = isProduction ? "production" : "development";
  
  const app = await createApp(mockEnv);
  
  // Restore environment
  if (originalVerifyJWT !== undefined) {
    process.env.NODE_ENV = originalVerifyJWT;
  }

  const adminTest: AdminAppTest = {
    app,
    req: supertest(app),
    logger,
    env: mockEnv,
  };

  return adminTest;
};

export const GetAdminAppTest = async (
  isProduction = false,
): Promise<AdminAppTest> => {
  adminAppTest ??= await createAdminServerTest(isProduction);
  return adminAppTest;
};

export const closeAdminAppTest = async (): Promise<void> => {
  if (adminAppTest) {
    adminAppTest.logger.info.log("Admin test app cleaned up");
    adminAppTest = undefined;
  }

  if (mswServer) {
    mswServer.close();
    mswServer = undefined;
  }

  return Promise.resolve();
};