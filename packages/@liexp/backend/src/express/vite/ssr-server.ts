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
import type {
  SsrServerConfig,
  SsrServerResult,
  TemplateConfig,
} from "./types.js";
import { createViteDevServer } from "./vite-dev.js";

/**
 * Sets up static file serving for SSR in production
 *
 * Serves client files from a separate clientPath directory.
 */
export const setupSsrStaticServing = (
  app: express.Express,
  clientPath: string,
  base: string,
  extensions: string[],
  logger: Logger,
): void => {
  logger.info.log("Setting up SSR static file serving from %s", clientPath);
  logger.info.log("Client path exists: %s", fs.existsSync(clientPath));

  app.use(
    base,
    sirv(clientPath, {
      extensions,
    }),
  );

  logger.info.log("✓ SSR static file middleware registered");
};

export interface SsrTemplateHandlers {
  serverEntry: () => Promise<unknown>;
  getTemplate: (url: string, originalUrl?: string) => Promise<string>;
  transformTemplate: (template: string) => string;
}

/**
 * Creates SSR template handlers for production
 */
export const createSsrProductionTemplateHandlers = (
  templateConfig: TemplateConfig,
  indexFile: string,
  logger: Logger,
): SsrTemplateHandlers => {
  let serverEntry: (() => Promise<unknown>) | undefined;
  let getTemplate:
    | ((url: string, originalUrl?: string) => Promise<string>)
    | undefined;

  // Load the server entry module in production
  if (templateConfig.serverEntry) {
    const getEntry = templateConfig.serverEntry;
    // In production, we need to import the built module (ES modules)
    serverEntry = async () => {
      const entry = await getEntry();
      return import(entry);
    };
  }

  if (fs.existsSync(indexFile)) {
    if (templateConfig.getTemplate) {
      // Use custom template resolver directly; it may implement its own caching.
      getTemplate = templateConfig.getTemplate;
    } else {
      const templateFile = fs.readFileSync(indexFile, "utf8");
      getTemplate = (_url: string, _originalUrl?: string) => {
        return Promise.resolve(templateFile);
      };
    }
  }

  const transformTemplate = templateConfig.transformTemplate ?? ((t) => t);

  if (!serverEntry) {
    logger.warn.log("No serverEntry configured for SSR");
    serverEntry = () => Promise.resolve({});
  }

  if (!getTemplate) {
    logger.warn.log("No template found at %s", indexFile);
    getTemplate = () => Promise.resolve("");
  }

  return {
    serverEntry,
    getTemplate,
    transformTemplate,
  };
};

/**
 * Creates SSR template handlers for development (with Vite HMR)
 */
export const createSsrDevTemplateHandlers = async (
  templateConfig: TemplateConfig,
  indexFile: string,
  vite: ViteDevServer,
  logger: Logger,
): Promise<SsrTemplateHandlers> => {
  let serverEntry: (() => Promise<unknown>) | undefined;
  let getTemplate:
    | ((url: string, originalUrl?: string) => Promise<string>)
    | undefined;

  // Resolve the server entry path from configuration
  if (templateConfig.serverEntry) {
    const entry = await templateConfig.serverEntry();
    serverEntry = () => vite.ssrLoadModule(entry, { fixStacktrace: true });
  }

  if (fs.existsSync(indexFile)) {
    if (templateConfig.getTemplate) {
      // Delegate template generation entirely to the custom handler
      getTemplate = async (url: string, originalUrl?: string) => {
        const template = await templateConfig.getTemplate!(url, originalUrl);
        return vite.transformIndexHtml(url, template, originalUrl);
      };
    } else {
      // Read and cache the template once at startup for reuse
      const templateFile = fs.readFileSync(indexFile, "utf8");
      getTemplate = (url: string, originalUrl?: string) => {
        return vite.transformIndexHtml(url, templateFile, originalUrl);
      };
    }
  }

  const transformTemplate = templateConfig.transformTemplate ?? ((t) => t);

  if (!serverEntry) {
    logger.warn.log("No serverEntry configured for SSR");
    serverEntry = () => Promise.resolve({});
  }

  if (!getTemplate) {
    logger.warn.log("No template found at %s", indexFile);
    getTemplate = () => Promise.resolve("");
  }

  return {
    serverEntry,
    getTemplate,
    transformTemplate,
  };
};

/**
 * Creates an SSR server with Express + Vite integration
 *
 * In development, uses Vite dev server for HMR and SSR module loading.
 * In production, serves client files and loads pre-built server entry.
 */
export const createSsrServer = async (
  config: SsrServerConfig,
): Promise<SsrServerResult> => {
  const {
    service,
    logger,
    isProduction,
    viteConfig,
    staticConfig,
    templateConfig,
    expressConfig,
    errorConfig,
  } = config;

  const app = express();
  let viteInstance: ViteDevServer | undefined;
  let templateHandlers: SsrTemplateHandlers;

  // Setup common Express middleware
  setupExpressMiddleware(app, expressConfig, logger, service);

  if (isProduction) {
    // Production: Static file serving
    logger.info.log("Index file path: %s", staticConfig.indexFile);
    logger.info.log(
      "Index file exists: %s",
      fs.existsSync(staticConfig.indexFile),
    );

    setupSsrStaticServing(
      app,
      staticConfig.clientPath,
      viteConfig.base,
      staticConfig.extensions ?? [],
      logger,
    );

    templateHandlers = createSsrProductionTemplateHandlers(
      templateConfig,
      staticConfig.indexFile,
      logger,
    );
  } else {
    // Development: Vite dev server with HMR support
    const { vite } = await createViteDevServer(
      {
        ...viteConfig,
        appType: "custom",
        hmr: viteConfig.hmr,
      },
      logger,
    );
    viteInstance = vite;
    app.use(vite.middlewares);

    templateHandlers = await createSsrDevTemplateHandlers(
      templateConfig,
      staticConfig.indexFile,
      vite,
      logger,
    );
  }

  // Register post-Vite middleware
  setupAfterViteMiddleware(app, expressConfig, logger);

  // Error handler (must be last)
  setupErrorHandler(app, errorConfig, isProduction, logger, viteInstance);

  return {
    app,
    vite: viteInstance,
    serverEntry: templateHandlers.serverEntry,
    getTemplate: templateHandlers.getTemplate,
    transformTemplate: templateHandlers.transformTemplate,
  };
};
