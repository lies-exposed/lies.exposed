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

import * as path from "path";
import { loadAndParseENV } from "@liexp/core/lib/env/utils.js";
import { GetLogger } from "@liexp/core/lib/logger/index.js";
import { ENVParser } from "@liexp/shared/lib/utils/env.utils.js";
import compression from "compression";
import cors from "cors";
import { Schema } from "effect";
import express, {
  type Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import sirv from "sirv";
import { makeAdminProxyContext } from "./context/index.js";
import { AdminProxyENV } from "./io/ENV.js";
import { registerAgentProxyRoutes } from "./routes/agent-proxy.routes.js";

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

  logger.debug.log("Environment loaded: %O", {
    SERVER_PORT: env.SERVER_PORT,
    SERVER_HOST: env.SERVER_HOST,
    AGENT_URL: env.AGENT_URL,
    NODE_ENV: env.NODE_ENV,
    isProduction,
  });

  // Initialize context (JWT, M2M, Agent client)
  const contextTE = makeAdminProxyContext(env);
  const contextResult = await contextTE();

  if (contextResult._tag === "Left") {
    logger.error.log("Failed to initialize context: %O", contextResult.left);
    throw new Error("Context initialization failed");
  }

  const ctx = contextResult.right;
  logger.info.log("Context initialized successfully");

  // Initialize Express app
  const app = express();

  // CORS (allow admin frontend)
  app.use(
    cors({
      origin: env.VITE_PUBLIC_URL ?? "http://admin.liexp.dev",
      credentials: true,
      methods: ["POST", "GET", "OPTIONS"],
    }),
  );

  // Body parsers
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Compression
  app.use(compression());

  // ============================================================
  // API Routes (must be registered BEFORE Vite middleware)
  // ============================================================

  // Global health check
  app.get("/api/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "admin-web",
      timestamp: new Date().toISOString(),
    });
  });

  // Agent proxy routes at /api/proxy/agent
  const proxyRouter = express.Router() as Router;
  registerAgentProxyRoutes(proxyRouter, ctx);
  app.use("/api/proxy/agent", proxyRouter);

  // ============================================================
  // Frontend Serving (Vite dev server or static files)
  // ============================================================

  if (isProduction) {
    // Production: serve pre-built static files
    const buildPath = path.resolve(process.cwd(), "build");
    logger.info.log("Serving production build from %s", buildPath);

    // Serve static assets
    app.use(base, sirv(buildPath, { extensions: [] }));

    // SPA fallback - serve index.html for all other routes
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(buildPath, "index.html"));
    });
  } else {
    // Development: use Vite dev server with HMR
    logger.info.log("Starting Vite dev server in middleware mode");

    const { createServer: createViteServer } = await import("vite");

    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa", // Vite handles HTML serving and SPA fallback
      base,
    });

    // Vite's middleware handles:
    // - HMR WebSocket
    // - Source file transformation
    // - Static asset serving
    // - HTML serving and SPA fallback
    app.use(vite.middlewares);

    logger.info.log("Vite dev server initialized with HMR enabled");
  }

  // ============================================================
  // Error Handler (must be last)
  // ============================================================

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error.log("Express error: %O", err);
    res.status(500).json({
      error: "Internal server error",
      message: isProduction ? "Something went wrong" : err.message,
    });
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
