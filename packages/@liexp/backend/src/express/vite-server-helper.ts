import * as fs from "fs";
import * as path from "path";
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
    expressConfig.beforeViteMiddleware(app);
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

    if (staticConfig.clientPath) {
      // SSR: Serve client files from specific path
      app.use(
        viteConfig.base,
        sirv(staticConfig.clientPath, {
          extensions: staticConfig.extensions ?? [],
        }),
      );
    } else {
      // SPA: Serve all files from build path
      app.use(
        viteConfig.base,
        sirv(staticConfig.buildPath, {
          extensions: staticConfig.extensions ?? [],
        }),
      );
    }

    // Template handling for production
    if (templateConfig) {
      serverEntry = templateConfig.serverEntry;

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
    } else {
      // SPA fallback - serve index.html for all routes
      app.get("*", (_req: express.Request, res: express.Response) => {
        res.sendFile(path.resolve(staticConfig.indexFile));
      });
    }
  } else {
    // Development: Vite dev server
    logger.info.log("Setting up Vite dev server in middleware mode");

    const { createServer: createViteServer } = await import("vite");

    viteInstance = await createViteServer({
      server: { ...viteConfig.serverOptions, middlewareMode: true },
      appType: viteConfig.appType,
      configFile: viteConfig.configFile,
      base: viteConfig.base,
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
    expressConfig.afterViteMiddleware(app);
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
