import * as fs from "fs";
import { type Logger } from "@liexp/core/lib/logger/index.js";
import express from "express";
import sirv from "sirv";
import type { ViteDevServer } from "vite";
import {
  setupAfterViteMiddleware,
  setupErrorHandler,
  setupExpressMiddleware,
} from "./middleware.js";
import type { SpaServerConfig, SpaServerResult } from "./types.js";
import { createViteDevServer } from "./vite-dev.js";

/**
 * Sets up static file serving for SPA in production
 *
 * Uses sirv with `single: true` for SPA fallback handling.
 */
export const setupSpaStaticServing = (
  app: express.Express,
  buildPath: string,
  base: string,
  extensions: string[],
  logger: Logger,
): void => {
  logger.info.log(
    "Setting up production static file serving from %s",
    buildPath,
  );
  logger.info.log("Build path exists: %s", fs.existsSync(buildPath));

  const sirvOptions = {
    extensions,
    single: true, // This handles SPA fallback automatically
    dev: false, // Production mode
    etag: true, // Enable ETag headers
    maxAge: 31536000, // Cache for 1 year in production
    immutable: true, // Mark assets as immutable in production
  };

  logger.info.log("sirv options: %O", sirvOptions);

  const sirvMiddleware = sirv(buildPath, sirvOptions);

  // For root base path, use sirv directly without path prefix
  if (base === "/" || base === "") {
    app.use((req, res, next) => {
      logger.debug.log(
        "sirv middleware handling: %s %s (original: %s)",
        req.method,
        req.path,
        req.originalUrl,
      );
      sirvMiddleware(req, res, next);
    });
  } else {
    app.use(base, (req, res, next) => {
      logger.debug.log(
        "sirv middleware handling: %s %s (original: %s)",
        req.method,
        req.path,
        req.originalUrl,
      );
      sirvMiddleware(req, res, next);
    });
  }

  logger.info.log("✓ Static file middleware registered");
};

/**
 * Sets up SPA fallback route for client-side routing
 *
 * This catches any routes not handled by static files or API routes
 * and serves index.html for client-side routing.
 */
export const setupSpaFallback = (
  app: express.Express,
  indexFile: string,
  logger: Logger,
): void => {
  app.get("/*splat", (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith("/api/")) {
      logger.debug.log("SPA fallback: skipping API route %s", req.path);
      return next();
    }

    // Serve index.html for all other routes (client-side routing)
    logger.info.log("SPA fallback: serving index.html for %s", req.path);
    res.sendFile(indexFile, (err) => {
      if (err) {
        logger.error.log("SPA fallback: error serving index.html: %O", err);
        next(err);
      }
    });
  });

  logger.info.log("✓ SPA fallback route registered (catch-all)");
};

/**
 * Creates a SPA server with Express + Vite integration
 *
 * In development, uses Vite dev server for HMR.
 * In production, serves static files with SPA fallback.
 */
export const createSpaServer = async (
  config: SpaServerConfig,
): Promise<SpaServerResult> => {
  const {
    service,
    logger,
    isProduction,
    viteConfig,
    staticConfig,
    expressConfig,
    errorConfig,
  } = config;

  const app = express();
  let viteInstance: ViteDevServer | undefined;

  // Setup common Express middleware
  setupExpressMiddleware(app, expressConfig, logger, service);

  if (isProduction) {
    // Production: Static file serving with SPA fallback
    logger.info.log("Index file path: %s", staticConfig.indexFile);
    logger.info.log(
      "Index file exists: %s",
      fs.existsSync(staticConfig.indexFile),
    );

    setupSpaStaticServing(
      app,
      staticConfig.buildPath,
      viteConfig.base,
      staticConfig.extensions ?? [],
      logger,
    );
  } else {
    // Development: Vite dev server
    const { vite } = await createViteDevServer(
      { ...viteConfig, appType: "spa" },
      logger,
    );
    viteInstance = vite;
    app.use(vite.middlewares);
  }

  // Register post-Vite middleware
  setupAfterViteMiddleware(app, expressConfig, logger);

  // SPA fallback route (production only, must be after static serving)
  if (isProduction) {
    setupSpaFallback(app, staticConfig.indexFile, logger);
  }

  // Error handler (must be last)
  setupErrorHandler(app, errorConfig, isProduction, logger, viteInstance);

  return {
    app,
    vite: viteInstance,
  };
};
