/**
 * Admin Web App Factory
 *
 * Provides a factory function to create the Express app for testing
 * and standalone usage without starting the HTTP server.
 */

import * as fs from "fs";
import * as path from "path";
import { createViteServerHelper } from "@liexp/backend/lib/express/vite-server-helper.js";
import { GetLogger } from "@liexp/core/lib/logger/index.js";
import cors from "cors";
import express from "express";
import type { Express } from "express";
import { makeAdminProxyContext } from "./context/index.js";
import type { AdminProxyENV } from "./io/ENV.js";
import { registerAgentProxyRoutes } from "./routes/agent-proxy.routes.js";

const logger = GetLogger("admin-createApp");

export const createApp = async (env: AdminProxyENV): Promise<Express> => {
  logger.info.log("Creating admin web app");

  const isProduction = env.NODE_ENV === "production";

  // Initialize context (JWT, M2M, Agent client)
  const contextTE = makeAdminProxyContext(env);
  const contextResult = await contextTE();

  if (contextResult._tag === "Left") {
    logger.error.log("Failed to initialize context: %O", contextResult.left);
    throw new Error("Context initialization failed");
  }

  const ctx = contextResult.right;
  logger.debug.log("Context initialized successfully");

  // ============================================================
  // Create Vite Server Helper
  // ============================================================

  // In production Docker, the structure is:
  // /prod/admin-web/
  // ├── build/
  // │   ├── index.html (from Vite)
  // │   ├── assets/ (from Vite)
  // │   └── server/
  // │       └── server.js (current running file)
  // ├── node_modules/
  // └── package.json
  //
  // process.cwd() = /prod/admin-web
  // So build path = /prod/admin-web/build
  const buildPath = path.resolve(process.cwd(), "build");
  const indexFile = path.resolve(buildPath, "index.html");

  // Log detailed debugging information
  logger.info.log("Environment: %s", env.NODE_ENV);
  logger.info.log("Process cwd: %s", process.cwd());
  logger.info.log(
    "__dirname equivalent: %s",
    path.dirname(new URL(import.meta.url).pathname),
  );
  logger.info.log("Build path: %s", buildPath);
  logger.info.log("Index file: %s", indexFile);

  // Check if paths exist
  logger.info.log("Build path exists: %s", fs.existsSync(buildPath));
  logger.info.log("Index file exists: %s", fs.existsSync(indexFile));

  // List build directory contents if it exists
  if (fs.existsSync(buildPath)) {
    try {
      const buildContents = fs.readdirSync(buildPath);
      logger.info.log("Build directory contents: %O", buildContents);
    } catch (e) {
      logger.error.log("Error reading build directory: %O", e);
    }
  } else {
    logger.error.log("Build directory does not exist!");
  }

  const { app } = await createViteServerHelper({
    service: "admin-web",
    logger,
    isProduction,
    viteConfig: {
      appType: "spa",
      base: "/",
      configFile: path.resolve(process.cwd(), "vite.config.ts"),
      serverOptions: {
        host: env.SERVER_HOST,
        port: env.SERVER_PORT,
      },
      // Use a separate cache directory for tests to avoid conflicts with Docker
      cacheDir:
        process.env.NODE_ENV === "test"
          ? path.resolve(process.cwd(), "node_modules/.vite-test")
          : undefined,
    },
    staticConfig: {
      buildPath,
      indexFile,
    },
    expressConfig: {
      compression: {
        enabled: true,
        // Disable compression for SSE streams to allow real-time streaming
        filter: (_req, res) => {
          // Don't compress SSE responses
          if (res.getHeader("Content-Type") === "text/event-stream") {
            return false;
          }
          // Default compression filter for everything else
          return true;
        },
      },
      bodyLimit: "10mb",
      beforeViteMiddleware: (app) => {
        logger.info.log("Registering beforeViteMiddleware");

        // CORS (allow admin frontend)
        app.use(
          cors({
            origin: env.VITE_PUBLIC_URL ?? "http://admin.liexp.dev",
          }),
        );

        // Agent proxy routes at /api/proxy/agent
        const proxyRouter = express.Router();
        registerAgentProxyRoutes(proxyRouter, ctx);
        app.use("/api/proxy/agent", proxyRouter);

        logger.info.log("✓ beforeViteMiddleware registered");
      },
    },
    errorConfig: {
      exposeErrorDetails: !isProduction,
    },
  });

  logger.info.log("Admin web app created successfully");
  return app;
};
