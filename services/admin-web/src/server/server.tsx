/**
 * Admin Web Server with Agent Proxy
 *
 * Serves the admin frontend (Vite) and provides a proxy for
 * agent service calls with M2M authentication.
 *
 * Based on web service server pattern (services/web/src/server/server.tsx)
 */

import * as path from "path";
import { GetLogger } from "@liexp/core/lib/logger/index.js";
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

  const isProduction = process.env.NODE_ENV === "production";

  // Decode and validate environment
  const envDecodeResult = Schema.decodeUnknownEither(AdminProxyENV)(
    process.env,
  );

  if (envDecodeResult._tag === "Left") {
    logger.error.log(
      "Invalid environment configuration: %O",
      envDecodeResult.left,
    );
    throw new Error("Failed to load environment configuration");
  }

  const env = envDecodeResult.right;

  logger.debug.log("Environment loaded: %O", {
    SERVER_PORT: env.SERVER_PORT,
    SERVER_HOST: env.SERVER_HOST,
    AGENT_URL: env.AGENT_URL,
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
      origin: process.env.VITE_PUBLIC_URL ?? "http://admin.liexp.dev",
      credentials: true,
      methods: ["POST", "GET", "OPTIONS"],
    }),
  );

  // JSON body parser
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Compression
  app.use(compression());

  // Register proxy routes at /api/proxy/agent
  const proxyRouter = express.Router() as Router;
  registerAgentProxyRoutes(proxyRouter, ctx);
  app.use("/api/proxy/agent", proxyRouter);

  // Global health check
  app.get("/api/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "admin-web",
      timestamp: new Date().toISOString(),
    });
  });

  // Serve frontend (Vite dev or production static)
  const cwd = process.cwd();
  const outputDir = isProduction
    ? path.resolve(cwd, "build")
    : path.resolve(cwd, "src");

  if (isProduction) {
    // Production: serve static files
    logger.info.log("Serving production build from %s", outputDir);
    app.use(base, sirv(path.resolve(outputDir, "client"), { extensions: [] }));

    // Fallback to index.html for SPA
    const indexFile = path.resolve(outputDir, "client/index.html");
    app.get("*", (_req, res) => {
      res.sendFile(indexFile);
    });
  } else {
    // Development: use Vite dev middleware
    logger.info.log("Using Vite dev middleware");

    const { createServer: createViteServer } = await import("vite");

    const vite = await createViteServer({
      server: { middlewareMode: true },
      configFile: path.resolve(cwd, "vite.config.ts"),
      appType: "spa",
      base,
    });

    app.use(vite.middlewares);
  }

  // Error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error.log("Express error: %O", err);
    res.status(500).json({
      error: "Internal server error",
      message: isProduction ? "Something went wrong" : err.message,
    });
  });

  // Start server
  const server = app.listen(env.SERVER_PORT, env.SERVER_HOST, () => {
    logger.info.log(
      "Server listening on %s:%d",
      env.SERVER_HOST,
      env.SERVER_PORT,
    );
  });

  server.on("error", (e) => {
    logger.error.log("Server error: %O", e);
    process.exit(1);
  });
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  run("/").catch((e) => {
    logger.error.log("Failed to start server: %O", e);
    process.exit(1);
  });
}

process.on("uncaughtException", (e) => {
  logger.error.log("Process uncaught exception: %O", e);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error.log("Unhandled rejection at: %O, reason: %O", promise, reason);
  process.exit(1);
});
