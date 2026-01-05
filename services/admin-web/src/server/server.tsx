/**
 * Admin Web Server with Agent Proxy
 *
 * Serves the admin frontend (Vite SPA) and provides API proxy routes
 * for agent service calls with M2M authentication.
 *
 * Architecture:
 * - In development: Uses Vite dev server with HMR
 * - In production: Serves static built files
 * - API routes (/api/*) are handled before Vite middleware
 * - Vite handles HTML serving and SPA fallback in development
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

  const app = await createApp({
    env,
    serviceRoot: process.cwd(),
    isProduction,
  });

  // ============================================================
  // Start Server
  // ============================================================

  const server = app.listen(env.SERVER_PORT, env.SERVER_HOST, () => {
    logger.info.log(
      "✓ Server listening on http://%s:%d",
      env.SERVER_HOST,
      env.SERVER_PORT,
    );

    if (!isProduction) {
      logger.info.log("✓ Vite HMR enabled");
      logger.info.log("✓ API proxy available at /api/proxy/agent/*");
    }
  });

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
