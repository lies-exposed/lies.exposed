/**
 * Admin Web App Factory
 *
 * Provides a factory function to create the Express app for testing
 * and standalone usage without starting the HTTP server.
 */

import * as fs from "fs";
import type http from "http";
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

interface AdminWebAppConfig {
  env: AdminProxyENV;
  serviceRoot: string;
  isProduction?: boolean;
  /** HTTP server for HMR WebSocket attachment (required for full HMR in dev) */
  httpServer?: http.Server;
}

export const createApp = async (
  config: AdminWebAppConfig,
): Promise<Express> => {
  const {
    env,
    serviceRoot,
    isProduction = env.NODE_ENV === "production",
  } = config;
  logger.info.log("Creating admin web app");

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
  // /prod/admin/
  // ├── build/
  // │   ├── index.html (from Vite)
  // │   ├── assets/ (from Vite)
  // │   └── server/
  // │       └── server.js (current running file)
  // ├── node_modules/
  // └── package.json
  //
  // serviceRoot = /prod/admin
  // So build path = /prod/admin/build
  const buildPath = path.resolve(serviceRoot, "build");
  const indexFile = path.resolve(buildPath, "index.html");

  // Log detailed debugging information
  logger.info.log("Environment: %s", env.NODE_ENV);
  logger.info.log("Service root: %s", serviceRoot);
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
    service: "admin",
    logger,
    isProduction,
    viteConfig: {
      appType: "spa",
      base: "/",
      configFile: path.resolve(serviceRoot, "vite.config.ts"),
      serverOptions: {
        host: env.SERVER_HOST,
        port: env.SERVER_PORT,
      },
      // Use a separate cache directory for tests to avoid conflicts with Docker
      cacheDir:
        env.NODE_ENV === "test"
          ? path.resolve(serviceRoot, "node_modules/.vite-test")
          : undefined,
      // HMR configuration: enable in development with correct port (24679 to avoid conflicts)
      // Disabled in production since there's no hot reloading needed
      // Note: Don't set `host` - server binds to serverOptions.host (0.0.0.0),
      // and client auto-detects from page URL (admin.liexp.dev)
      hmr:
        env.NODE_ENV === "production"
          ? false
          : {
              port: 24679,
              clientPort: 24679,
            },
    },
    staticConfig: {
      buildPath,
      indexFile,
    },
    expressConfig: {
      compression: {
        enabled: true,
        // Disable compression for SSE streams because compression buffering can delay event delivery to clients, breaking the real-time nature of Server-Sent Events
        filter: (_req, res) => {
          // Don't compress SSE responses
          const contentType = res.getHeader("Content-Type");
          if (contentType?.toString().includes("text/event-stream")) {
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
