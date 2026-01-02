import * as fs from "fs";
import * as path from "path";
import { GetLogger, type Logger } from "@liexp/core/lib/logger/index.js";
import { fc, Media, Event } from "@liexp/test/lib/index.js";
import type * as e from "express";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import supertest from "supertest";
import type TestAgent from "supertest/lib/agent.js";
import { createApp, type WebAppConfig } from "../src/server/server.js";

export interface WebAppTest {
  app: e.Express;
  req: TestAgent<supertest.Test>;
  logger: Logger;
}

let webAppTest: WebAppTest | undefined = undefined;
let mswServer: ReturnType<typeof setupServer> | undefined = undefined;

// MSW API Handlers with realistic data using arbitraries
const createApiHandlers = () => [
  // GitHub API mock
  http.get("https://api.github.com/repos/:user/:repo", () => {
    return HttpResponse.json({
      data: {
        stars: fc.sample(fc.integer({ min: 10, max: 10000 }), 1)[0],
        forks: fc.sample(fc.integer({ min: 1, max: 1000 }), 1)[0],
        watchers: fc.sample(fc.integer({ min: 1, max: 500 }), 1)[0],
        issues: fc.sample(fc.integer({ min: 0, max: 100 }), 1)[0],
      },
    });
  }),

  // Page content mock
  http.get("http://mock-api/v1/pages/:path", ({ params }) => {
    const page = fc.sample(
      fc.record({
        id: fc.uuid(),
        title: fc.lorem({ maxCount: 5 }),
        content: fc.lorem({ maxCount: 50 }),
        path: fc.constant(params.path as string),
        published: fc.boolean(),
        createdAt: fc.date().map((d) => d.toISOString()),
        updatedAt: fc.date().map((d) => d.toISOString()),
      }),
      1,
    )[0];

    return HttpResponse.json({
      data: page,
    });
  }),

  // Keyword distribution mock
  http.get("http://mock-api/v1/keywords/distribution", () => {
    const keywords = fc.sample(
      fc.array(
        fc.record({
          id: fc.uuid(),
          tag: fc.lorem({ maxCount: 2 }),
          color: fc
            .hexaString({ minLength: 6, maxLength: 6 })
            .map((hex) => `#${hex}`),
          count: fc.integer({ min: 1, max: 100 }),
          createdAt: fc.date().map((d) => d.toISOString()),
          updatedAt: fc.date().map((d) => d.toISOString()),
        }),
        { minLength: 5, maxLength: 20 },
      ),
      1,
    )[0];

    return HttpResponse.json({
      data: keywords,
      total: keywords.length,
    });
  }),

  // Events search mock
  http.get("http://mock-api/v1/events", () => {
    const events = fc.sample(
      fc.array(
        Event.EventTypeArb.chain((type) => Event.getEventArbitrary(type)),
        { minLength: 0, maxLength: 10 },
      ),
      1,
    )[0];

    return HttpResponse.json({
      data: events,
      total: events.length,
    });
  }),

  // Media mock using Media arbitraries
  http.get("http://mock-api/v1/media", () => {
    const mediaItems = fc.sample(
      fc.array(Media.MediaArb, { minLength: 0, maxLength: 10 }),
      1,
    )[0];

    return HttpResponse.json({
      data: mediaItems,
      total: mediaItems.length,
    });
  }),

  // Catch-all for other API calls
  http.get("http://mock-api/v1/*", () => {
    return HttpResponse.json({
      data: null,
      total: 0,
    });
  }),

  // http.get("*", (req) => {
  //   console.log(req.request, req.params);
  //   return HttpResponse.error();
  // }),
];

export const createWebServerTest = async (
  isProduction = false,
): Promise<WebAppTest> => {
  const logger = GetLogger("web-test");

  logger.info.log("Creating web server test (production: %s)", isProduction);

  // Set up MSW server for production mode to mock API calls
  if (!mswServer) {
    mswServer = setupServer(...createApiHandlers());

    // Start MSW server
    mswServer.listen({
      onUnhandledRequest: "warn", // Allow non-mocked requests to pass through
    });

    logger.info.log("MSW server started for API mocking");
  }

  // Ensure test files exist for production mode
  if (isProduction) {
    const cwd = process.cwd();
    const buildDir = path.resolve(cwd, "build");
    const clientDir = path.resolve(buildDir, "client");
    const indexFile = path.resolve(clientDir, "index.html");

    // Create test build structure if it doesn't exist
    if (!fs.existsSync(indexFile)) {
      fs.mkdirSync(clientDir, { recursive: true });
      fs.writeFileSync(
        indexFile,
        `<!DOCTYPE html>
<html>
<head>
  <title>Test Web App - Production</title>
</head>
<body>
  <div id="root"></div>
  <!--web-analytics-->
  <script type="module" src="/assets/index.js"></script>
</body>
</html>`,
      );
    }
  }

  // Verify the TypeScript source server entry exists (used by both development and production)
  const cwd = process.cwd();
  const srcDir = path.resolve(cwd, "src", "server");
  const serverEntry = path.resolve(srcDir, "entry.tsx");
  if (!fs.existsSync(serverEntry)) {
    throw new Error(
      `Server entry source file not found at ${serverEntry}. ` +
        `Make sure the TypeScript source file exists.`,
    );
  }

  // Note: Development mode uses the existing index.html file
  // No need to create a mock file since it already exists

  const config: WebAppConfig = {
    base: "/",
    isProduction,
    // Use mock API for both dev and production tests - MSW handles the mocking
    ssrApiUrl: "http://mock-api/v1",
    apiUrl: "http://mock-api/v1",
  };

  const app = await createApp(config);

  const webTest: WebAppTest = {
    app,
    req: supertest(app),
    logger,
  };

  return webTest;
};

export const GetWebAppTest = async (
  isProduction = false,
): Promise<WebAppTest> => {
  webAppTest ??= await createWebServerTest(isProduction);
  return webAppTest;
};

export const closeWebAppTest = async (): Promise<void> => {
  if (webAppTest) {
    webAppTest.logger.info.log("Test app cleaned up");
    webAppTest = undefined;
  }

  if (mswServer) {
    mswServer.close();
    mswServer = undefined;
  }

  return Promise.resolve();
};
