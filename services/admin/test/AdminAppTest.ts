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
import { AdminProxyENV } from "../src/server/io/ENV.js";
import { createApp } from "../src/server/createApp.js";
import { Schema } from "effect";

// Get service root directory (resolves to services/admin/)
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
const createAgentApiHandlers = (env: AdminProxyENV) => [
  // Agent chat message mock
  http.post(`${env.AGENT_API_URL}/chat/message`, async ({ request }) => {
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
  http.get(`${env.AGENT_API_URL.replace(/\/api\/v\d+$/, "")}/api/*`, () => {
    return HttpResponse.json({
      data: null,
      message: "Mock agent endpoint",
    });
  }),

  http.post(`${env.AGENT_API_URL.replace(/\/api\/v\d+$/, "")}/api/*`, () => {
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

  // Load and validate environment from process.env first
  const envResult = Schema.decodeUnknownEither(AdminProxyENV)({
    ...process.env,
    // Override/ensure test-specific values
    NODE_ENV: isProduction ? "production" : "development",
    DEBUG: "@liexp:*,-@liexp:debug",
    VIRTUAL_HOST: "127.0.0.1",
    VITE_PUBLIC_URL: "http://admin.liexp.test",
    SERVER_HOST: "127.0.0.1",
    JWT_SECRET: "test-jwt-secret-for-admin-tests",
    AGENT_API_URL: "http://localhost.local:3000/api/v1",
    SERVER_PORT: "0", // Use random port for tests
    SERVICE_CLIENT_ID: fc.sample(fc.uuid(), 1)[0],
    SERVICE_CLIENT_USER_ID: fc.sample(fc.uuid(), 1)[0],
    SERVICE_CLIENT_PERMISSIONS: ["admin:read", "admin:create"].join(","),
    RATE_LIMIT_WINDOW_MS: "60000",
    RATE_LIMIT_MAX_REQUESTS: "100",
  });

  if (envResult._tag === "Left") {
    throw new Error(
      `Failed to validate admin environment: ${JSON.stringify(envResult.left)}`,
    );
  }

  const validatedEnv = envResult.right;

  // Set up MSW server for mocking agent service (after env is validated)
  if (!mswServer) {
    mswServer = setupServer(...createAgentApiHandlers(validatedEnv));

    // Start MSW server
    mswServer.listen({
      onUnhandledRequest: "warn", // Allow non-mocked requests to pass through
    });

    logger.info.log("MSW server started for agent API mocking");
  }

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
  <title>Admin - lies.exposed</title>
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

  const app = await createApp({
    env: validatedEnv,
    serviceRoot: SERVICE_ROOT,
    isProduction,
  });

  const adminTest: AdminAppTest = {
    app,
    req: supertest(app),
    logger,
    env: validatedEnv,
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
