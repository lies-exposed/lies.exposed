import { type Logger } from "@liexp/core/lib/logger/index.js";
import type express from "express";
import type { ViteDevServer } from "vite";

/**
 * Vite server configuration options
 */
export interface ViteServerConfig {
  /** Application type for Vite server */
  appType: "spa" | "custom";
  /** Base path for the application */
  base: string;
  /** Custom vite config file path (optional) */
  configFile?: string;
  /** Additional vite server options */
  serverOptions?: Record<string, unknown>;
  /** Custom cache directory for Vite (useful for tests) */
  cacheDir?: string;
}

/**
 * Static file serving configuration
 */
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

/**
 * Template configuration for SSR applications
 */
export interface TemplateConfig {
  /** Function to get template content */
  getTemplate?: (url: string, originalUrl?: string) => Promise<string>;
  /** Function to transform template */
  transformTemplate?: (template: string) => string;
  /** Function to load server entry module path */
  serverEntry?: () => Promise<string>;
}

/**
 * Express middleware configuration
 */
export interface ExpressConfig {
  /** Enable compression middleware (boolean or config object with filter) */
  compression?:
    | boolean
    | {
        enabled: boolean;
        filter?: (req: express.Request, res: express.Response) => boolean;
      };
  /** Body parser limits */
  bodyLimit?: string;
  /** Additional middleware to register before Vite */
  beforeViteMiddleware?: (app: express.Express) => void;
  /** Additional middleware to register after Vite */
  afterViteMiddleware?: (app: express.Express) => void;
}

/**
 * Error handling configuration
 */
export interface ErrorConfig {
  /** Custom error handler */
  onRequestError?: (error: unknown) => void;
  /** Whether to expose error details in production */
  exposeErrorDetails?: boolean;
}

/**
 * Base configuration shared by SPA and SSR servers
 */
export interface BaseServerConfig {
  service: string;
  /** Logger instance */
  logger: Logger;
  /** Whether running in production mode */
  isProduction: boolean;
  /** Express app configuration */
  expressConfig: ExpressConfig;
  /** Error handling configuration */
  errorConfig?: ErrorConfig;
}

/**
 * Configuration for SPA server (no template handling)
 */
export interface SpaServerConfig extends BaseServerConfig {
  /** Vite server configuration (must be "spa" appType) */
  viteConfig: Omit<ViteServerConfig, "appType"> & { appType?: "spa" };
  /** Static file serving configuration */
  staticConfig: Omit<StaticFileConfig, "clientPath">;
}

/**
 * Configuration for SSR server (with template handling)
 */
export interface SsrServerConfig extends BaseServerConfig {
  /** Vite server configuration (must be "custom" appType) */
  viteConfig: Omit<ViteServerConfig, "appType"> & { appType?: "custom" };
  /** Static file serving configuration (clientPath required for SSR) */
  staticConfig: StaticFileConfig & { clientPath: string };
  /** Template configuration (required for SSR) */
  templateConfig: TemplateConfig;
}

/**
 * Full configuration for the unified server helper (backward compatible)
 */
export interface ServerHelperConfig extends BaseServerConfig {
  /** Vite server configuration */
  viteConfig: ViteServerConfig;
  /** Static file serving configuration */
  staticConfig: StaticFileConfig;
  /** Template configuration (for SSR) */
  templateConfig?: TemplateConfig;
}

/**
 * Result of creating a Vite server helper
 */
export interface ViteServerHelper {
  /** Express application instance */
  app: ReturnType<typeof express>;
  /** Vite dev server instance (only in development) */
  vite?: ViteDevServer;
  /** Server entry loader function */
  serverEntry?: () => Promise<unknown>;
  /** Template getter function */
  getTemplate?: (url: string, originalUrl?: string) => Promise<string>;
  /** Template transformer function */
  transformTemplate?: (template: string) => string;
}

/**
 * Result of creating a SPA server (subset of ViteServerHelper)
 */
export interface SpaServerResult {
  /** Express application instance */
  app: ReturnType<typeof express>;
  /** Vite dev server instance (only in development) */
  vite?: ViteDevServer;
}

/**
 * Result of creating an SSR server (full ViteServerHelper)
 */
export type SsrServerResult = ViteServerHelper;
