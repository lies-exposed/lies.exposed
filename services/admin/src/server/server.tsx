/**
 * Admin Web Server with Agent Proxy
 *
 * Serves the admin frontend (Vite SPA) and provides API proxy routes
 * for agent service calls with M2M authentication.
 *
 * Architecture:
 * - In development: Uses Vite dev server with full HMR support
 * - In production: Serves static built files
 * - API routes (/api/*) are handled before Vite middleware
 * - Vite handles HTML serving and SPA fallback in development
 *
 * HMR Note:
 * For full HMR support in development, we create the HTTP server first
 * and pass it to Vite so it can attach its WebSocket server for HMR.
 */

import { loadAndParseENV } from "@liexp/core/lib/env/utils.js";
import { GetLogger } from "@liexp/core/lib/logger/index.js";
import { ENVParser } from "@liexp/shared/lib/utils/env.utils.js";
import { Schema } from "effect";
import { createApp } from "./createApp.js";
import { AdminProxyENV } from "./io/ENV.js";

const logger = GetLogger("admin-server");

export const run = async (base: string): Promise<void> => {
  logger.info.log("Starting admin server (base: %s)", base);

  // Load and validate environment
  const envDecodeResult = loadAndParseENV(
    ENVParser(Schema.decodeUnknownEither(AdminProxyENV)),
  )(process.cwd());

  if (envDecodeResult._tag === "Left") {
    logger.error.log(
      "Invalid environment configuration: %O",
      envDecodeResult.left,
    );
    throw new Error("Failed to load environment configuration");
  }

  const env = envDecodeResult.right;
  const isProduction = env.NODE_ENV === "production";

  // ============================================================
  // Create HTTP Server First (for HMR WebSocket attachment)
  // ============================================================
  // In development, we need to create the HTTP server before the Express app
  // so that Vite can attach its HMR WebSocket server to it.
  // In production, this step is still valid but HMR is not used.

  // let httpServer: http.Server | undefined;

  if (!isProduction) {
    // // Create HTTP server first for HMR WebSocket attachment
    // httpServer = http.createServer();
    // logger.info.log("✓ HTTP server created for HMR WebSocket attachment");
  }

  // ============================================================
  // Create Express App with Vite
  // ============================================================

  const app = await createApp({
    env,
    serviceRoot: process.cwd(),
    isProduction,
    // httpServer,
  });

  // ============================================================
  // Start Server
  // ============================================================

  // Production: Use Express's built-in server
  const server = app.listen(env.SERVER_PORT, env.SERVER_HOST, () => {
    logger.info.log(
      "✓ Server listening on http://%s:%d",
      env.SERVER_HOST,
      env.SERVER_PORT,
    );
  });

  // Set socket timeout for streaming responses
  // Default is 0 (no timeout), set to 4 minutes to allow up to 3 minutes of streaming
  // Plus buffer for request/response overhead
  server.setTimeout(240000); // 4 minutes

  server.on("error", (e) => {
    logger.error.log("Server error: %O", e);
    process.exit(1);
  });
};

// ============================================================
// Entry Point
// ============================================================

void run("/").catch((e) => {
  logger.error.log("Failed to start server: %O", e);
  process.exit(1);
});

// ============================================================
// Process Error Handlers
// ============================================================

process.on("uncaughtException", (e) => {
  logger.error.log("Process uncaught exception: %O", e);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error.log("Unhandled rejection at: %O, reason: %O", promise, reason);
  process.exit(1);
});
