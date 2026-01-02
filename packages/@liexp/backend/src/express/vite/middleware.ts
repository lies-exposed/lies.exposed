import { type Logger } from "@liexp/core/lib/logger/index.js";
import compression from "compression";
import express from "express";
import type { ViteDevServer } from "vite";
import type { ErrorConfig, ExpressConfig } from "./types.js";

/**
 * Sets up common Express middleware (compression, body parsing, custom hooks)
 */
export const setupExpressMiddleware = (
  app: express.Express,
  config: ExpressConfig,
  logger: Logger,
): void => {
  // Compression middleware - only enable when explicitly requested
  if (config.compression === true) {
    app.use(compression());
  }

  // Body parser configuration
  if (config.bodyLimit) {
    app.use(express.json({ limit: config.bodyLimit }));
    app.use(express.urlencoded({ extended: true, limit: config.bodyLimit }));
  }

  // Register pre-Vite middleware
  if (config.beforeViteMiddleware) {
    logger.info.log("Registering beforeViteMiddleware");
    config.beforeViteMiddleware(app);
    logger.info.log("✓ beforeViteMiddleware registered");
  }
};

/**
 * Registers post-Vite middleware hooks
 */
export const setupAfterViteMiddleware = (
  app: express.Express,
  config: ExpressConfig,
  logger: Logger,
): void => {
  if (config.afterViteMiddleware) {
    logger.info.log("Registering afterViteMiddleware");
    config.afterViteMiddleware(app);
    logger.info.log("✓ afterViteMiddleware registered");
  }
};

/**
 * Sets up Express error handling middleware
 */
export const setupErrorHandler = (
  app: express.Express,
  errorConfig: ErrorConfig | undefined,
  isProduction: boolean,
  logger: Logger,
  viteInstance?: ViteDevServer,
): void => {
  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      logger.error.log("Express error: %O", err);

      if (errorConfig?.onRequestError) {
        errorConfig.onRequestError(err);
      }

      // In development with Vite, let Vite handle stack trace fixing
      if (viteInstance?.ssrFixStacktrace) {
        viteInstance.ssrFixStacktrace(err);
      }

      const exposeDetails = errorConfig?.exposeErrorDetails ?? !isProduction;
      res.status(500).json({
        error: "Internal server error",
        message: exposeDetails ? err.message : "Something went wrong",
      });
    },
  );
};
