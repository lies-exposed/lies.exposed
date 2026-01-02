import * as fs from "fs";
import { type Logger } from "@liexp/core/lib/logger/index.js";
import compression from "compression";
import express from "express";
import sirv from "sirv";

export interface ViteServerConfig {
  /** Application type for Vite server */
  appType: "spa" | "custom";
  /** Base path for the application */
  base: string;
  /** Custom vite config file path (optional) */
  configFile?: string;
  /** Additional vite server options */
  serverOptions?: Record<string, any>;
  /** Custom cache directory for Vite (useful for tests) */
  cacheDir?: string;
}

export interface StaticFileConfig {
  /** Path to build directory */
  buildPath: string;
  /** Path to client files (for SSR apps) */
  clientPath?: string;
  /** Absolute path to index.html file */
  indexFile: string;
  /** Extensions to serve (default: []) */
  extensions?: string[];
}

export interface TemplateConfig {
  /** Function to get template content */
  getTemplate?: (url: string, originalUrl?: string) => Promise<string>;
  /** Function to transform template */
  transformTemplate?: (template: string) => string;
  /** Function to load server entry module */
  serverEntry?: () => Promise<any>;
}

export interface ServerHelperConfig {
  /** Logger instance */
  logger: Logger;
  /** Whether running in production mode */
  isProduction: boolean;
  /** Vite server configuration */
  viteConfig: ViteServerConfig;
  /** Static file serving configuration */
  staticConfig: StaticFileConfig;
  /** Template configuration (for SSR) */
  templateConfig?: TemplateConfig;
  /** Express app configuration */
  expressConfig: {
    /** Enable compression middleware */
    compression?: boolean;
    /** Body parser limits */
    bodyLimit?: string;
    /** Additional middleware to register before Vite */
    beforeViteMiddleware?: (app: express.Express) => void;
    /** Additional middleware to register after Vite */
    afterViteMiddleware?: (app: express.Express) => void;
  };
  /** Error handling configuration */
  errorConfig?: {
    /** Custom error handler */
    onRequestError?: (error: unknown) => void;
    /** Whether to expose error details in production */
    exposeErrorDetails?: boolean;
  };
}

export interface ViteServerHelper {
  /** Express application instance */
  app: ReturnType<typeof express>;
  /** Vite dev server instance (only in development) */
  vite?: any;
  /** Server entry loader function */
  serverEntry?: () => Promise<any>;
  /** Template getter function */
  getTemplate?: (url: string, originalUrl?: string) => Promise<string>;
  /** Template transformer function */
  transformTemplate?: (template: string) => string;
}

/**
 * Creates a configured Express + Vite server for both SPA and SSR applications
 */
export const createViteServerHelper = async (
  config: ServerHelperConfig,
): Promise<ViteServerHelper> => {
  const {
    logger,
    isProduction,
    viteConfig,
    staticConfig,
    templateConfig,
    expressConfig,
    errorConfig,
  } = config;

  const app = express();

  // ============================================================
  // Express Middleware Setup
  // ============================================================

  // Compression middleware - only enable when explicitly requested
  if (expressConfig.compression === true) {
    app.use(compression());
  }

  if (expressConfig.bodyLimit) {
    app.use(express.json({ limit: expressConfig.bodyLimit }));
    app.use(
      express.urlencoded({ extended: true, limit: expressConfig.bodyLimit }),
    );
  }

  // Register pre-Vite middleware
  if (expressConfig.beforeViteMiddleware) {
    logger.info.log("Registering beforeViteMiddleware");
    expressConfig.beforeViteMiddleware(app);
    logger.info.log("✓ beforeViteMiddleware registered");
  }

  // ============================================================
  // Development vs Production Setup
  // ============================================================

  let viteInstance: any = undefined;
  let serverEntry: (() => Promise<any>) | undefined;
  let getTemplate:
    | ((url: string, originalUrl?: string) => Promise<string>)
    | undefined;
  let transformTemplate: ((template: string) => string) | undefined;

  if (isProduction) {
    // Production: Static file serving
    logger.info.log(
      "Setting up production static file serving from %s",
      staticConfig.buildPath,
    );
    logger.info.log("Index file path: %s", staticConfig.indexFile);
    logger.info.log(
      "Index file exists: %s",
      fs.existsSync(staticConfig.indexFile),
    );
    logger.info.log(
      "Build path exists: %s",
      fs.existsSync(staticConfig.buildPath),
    );

    if (staticConfig.clientPath) {
      // SSR: Serve client files from specific path
      app.use(
        viteConfig.base,
        sirv(staticConfig.clientPath, {
          extensions: staticConfig.extensions ?? [],
        }),
      );
    } else {
      // SPA: Serve static files and fallback to index.html
      logger.info.log(
        "Setting up sirv middleware with base: '%s'",
        viteConfig.base,
      );
      logger.info.log(
        "Build path exists: %s",
        fs.existsSync(staticConfig.buildPath),
      );

      const sirvOptions = {
        extensions: staticConfig.extensions ?? [],
        single: true, // This handles SPA fallback automatically
        dev: false, // Production mode
        etag: true, // Enable ETag headers
        maxAge: 31536000, // Cache for 1 year in production
        immutable: true, // Mark assets as immutable in production
      };

      logger.info.log("sirv options: %O", sirvOptions);

      const sirvMiddleware = sirv(staticConfig.buildPath, sirvOptions);

      // For root base path, use sirv directly without path prefix
      if (viteConfig.base === "/" || viteConfig.base === "") {
        // Add debug wrapper around sirv
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
        // Add debug wrapper around sirv with base path
        app.use(viteConfig.base, (req, res, next) => {
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
    }

    // Template handling for production
    if (templateConfig) {
      // Load the server entry module in production
      if (templateConfig.serverEntry) {
        const entry = await templateConfig.serverEntry();

        // In production, we need to import the built module (ES modules)
        serverEntry = () => import(entry);
      }

      if (fs.existsSync(staticConfig.indexFile)) {
        if (templateConfig.getTemplate) {
          // Use custom template resolver directly; it may implement its own caching.
          getTemplate = templateConfig.getTemplate;
        } else {
          const templateFile = fs.readFileSync(staticConfig.indexFile, "utf8");
          getTemplate = (_url: string, _originalUrl?: string) => {
            return Promise.resolve(templateFile);
          };
        }
      }

      transformTemplate = templateConfig.transformTemplate ?? ((t) => t);
    }
    // Static files served via sirv middleware with SPA fallback route registered below
  } else {
    // Development: Vite dev server
    logger.info.log("Setting up Vite dev server in middleware mode");

    const { createServer: createViteServer } = await import("vite");

    viteInstance = await createViteServer({
      server: { ...viteConfig.serverOptions, middlewareMode: true },
      appType: viteConfig.appType,
      configFile: viteConfig.configFile,
      base: viteConfig.base,
      cacheDir: viteConfig.cacheDir,
      // When using a custom cache directory, disable deps optimization to avoid
      // conflicts with existing cache directories (e.g., from Docker containers)
      optimizeDeps: viteConfig.cacheDir
        ? { noDiscovery: true, include: [] }
        : undefined,
    });

    app.use(viteInstance.middlewares);

    // Template handling for development
    if (templateConfig?.serverEntry) {
      // Resolve the server entry path from configuration or use default
      const entry = await templateConfig.serverEntry();

      serverEntry = () =>
        viteInstance.ssrLoadModule(entry, { fixStacktrace: true });

      if (fs.existsSync(staticConfig.indexFile)) {
        if (templateConfig.getTemplate) {
          // Delegate template generation entirely to the custom handler
          getTemplate = async (url: string, originalUrl?: string) => {
            const template = await templateConfig.getTemplate!(
              url,
              originalUrl,
            );
            return viteInstance.transformIndexHtml(url, template, originalUrl);
          };
        } else {
          // Read and cache the template once at startup for reuse
          const templateFile = fs.readFileSync(staticConfig.indexFile, "utf8");
          getTemplate = (url: string, originalUrl?: string) => {
            return viteInstance.transformIndexHtml(
              url,
              templateFile,
              originalUrl,
            );
          };
        }
      }

      transformTemplate = templateConfig.transformTemplate ?? ((t) => t);
    }

    logger.info.log(
      "Vite dev server initialized with %s mode",
      viteConfig.appType,
    );
  }

  // Register post-Vite middleware
  if (expressConfig.afterViteMiddleware) {
    logger.info.log("Registering afterViteMiddleware");
    expressConfig.afterViteMiddleware(app);
    logger.info.log("✓ afterViteMiddleware registered");
  }

  // ============================================================
  // SPA Fallback Route (must be last before error handler)
  // ============================================================

  // For SPA apps in production, add explicit fallback to serve index.html
  // This catches any routes not handled by static files or API routes
  if (
    isProduction &&
    viteConfig.appType === "spa" &&
    !staticConfig.clientPath
  ) {
    app.get("/*splat", (req, res, next) => {
      // Skip API routes
      if (req.path.startsWith("/api/")) {
        logger.debug.log("SPA fallback: skipping API route %s", req.path);
        return next();
      }

      // Serve index.html for all other routes (client-side routing)
      logger.info.log("SPA fallback: serving index.html for %s", req.path);
      res.sendFile(staticConfig.indexFile, (err) => {
        if (err) {
          logger.error.log("SPA fallback: error serving index.html: %O", err);
          next(err);
        }
      });
    });

    logger.info.log("✓ SPA fallback route registered (catch-all)");
  }

  // ============================================================
  // Error Handler
  // ============================================================

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

  return {
    app,
    vite: viteInstance,
    serverEntry,
    getTemplate,
    transformTemplate,
  };
};

/**
 * Type helper for creating server configurations
 */
export const createServerConfig = (
  config: ServerHelperConfig,
): ServerHelperConfig => config;
