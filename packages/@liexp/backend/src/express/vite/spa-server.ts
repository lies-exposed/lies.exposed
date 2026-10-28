import * as fs from "fs";
import * as path from "path";
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

  // Serve index.html with no-cache headers BEFORE sirv.
  // Without this, browsers cache index.html forever (immutable: true + 1yr
  // maxAge on sirv), so after a deployment the browser keeps the old
  // index.html that references stale chunk hashes — causing
  // "error loading dynamically imported module" TypeError.
  // Assets (JS/CSS chunks) have content hashes and are cached forever by
  // sirv; only index.html needs no-cache.
  if (base === "/" || base === "") {
    app.use((req, res, next) => {
      if (req.path === "/" || req.path === "/index.html") {
        res.set({
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        });
      }
      next();
    });
  } else {
    app.use((req, res, next) => {
      if (req.path === base || `${req.path}/index.html` === base) {
        res.set({
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        });
      }
      next();
    });
  }

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
  const indexRoot = path.dirname(indexFile);
  const indexFilename = path.basename(indexFile);

  app.get("/{*splat}", (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith("/api/")) {
      logger.debug.log("SPA fallback: skipping API route %s", req.path);
      return next();
    }

    // Serve index.html for all other routes (client-side routing).
    // Use { root } option so Express's `send` module resolves the file
    // relative to the build directory rather than treating the absolute
    // path as a URL-relative path (which would cause a 404).
    //
    // CRITICAL: Set no-cache headers on index.html so browsers always
    // re-fetch it on deployment. Without this, browsers cache index.html
    // forever (due to immutable asset caching), and stale index.html
    // references old chunk hashes that no longer exist — causing
    // "error loading dynamically imported module" TypeError.
    // Assets (JS/CSS chunks) have content hashes in filenames and are
    // cached forever by sirv; only index.html needs no-cache.
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    logger.info.log("SPA fallback: serving index.html for %s", req.path);
    res.sendFile(indexFilename, { root: indexRoot }, (err) => {
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
    // Development: Vite dev server with HMR support
    const { vite } = await createViteDevServer(
      {
        ...viteConfig,
        appType: "spa",
        hmr: viteConfig.hmr,
      },
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
