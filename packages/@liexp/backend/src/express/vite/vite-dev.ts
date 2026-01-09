import { type Logger } from "@liexp/core/lib/logger/index.js";
import type { HmrOptions, ViteDevServer } from "vite";
import type { HmrConfig, ViteServerConfig } from "./types.js";

export interface ViteDevServerResult {
  /** Vite dev server instance */
  vite: ViteDevServer;
}

/**
 * Builds HMR configuration for Vite middleware mode
 *
 * In middleware mode, Vite needs to attach its HMR WebSocket server to
 * the existing HTTP server for proper hot module replacement.
 */
const buildHmrConfig = (
  hmrConfig: HmrConfig | boolean | undefined,
  logger: Logger,
): HmrOptions | boolean | undefined => {
  // If explicitly disabled, return false
  if (hmrConfig === false) {
    logger.info.log("HMR disabled by configuration");
    return false;
  }

  // If just `true` or undefined, let Vite handle defaults
  if (hmrConfig === true || hmrConfig === undefined) {
    logger.info.log("HMR enabled with default configuration");
    return true;
  }

  // Build HMR options from config
  const hmrOptions: HmrOptions = {};

  if (hmrConfig.server) {
    hmrOptions.server = hmrConfig.server;
    logger.info.log("HMR WebSocket attached to provided HTTP server");
  }

  if (hmrConfig.host) {
    hmrOptions.host = hmrConfig.host;
    logger.info.log("HMR host: %s", hmrConfig.host);
  }

  if (hmrConfig.clientPort) {
    hmrOptions.clientPort = hmrConfig.clientPort;
    logger.info.log("HMR client port: %d", hmrConfig.clientPort);
  }

  if (hmrConfig.protocol) {
    hmrOptions.protocol = hmrConfig.protocol;
    logger.info.log("HMR protocol: %s", hmrConfig.protocol);
  }

  return hmrOptions;
};

/**
 * Creates a Vite development server in middleware mode
 *
 * This server is shared between SPA and SSR modes in development.
 * In production, this function is not called.
 *
 * For full HMR support in middleware mode, pass an HTTP server via
 * `config.hmr.server`. This allows Vite to attach its WebSocket
 * server to your existing HTTP server.
 */
export const createViteDevServer = async (
  config: ViteServerConfig,
  logger: Logger,
): Promise<ViteDevServerResult> => {
  logger.info.log("Setting up Vite dev server in middleware mode");

  const { createServer: createViteServer } = await import("vite");

  const hmrConfig = buildHmrConfig(config.hmr, logger);

  const vite = await createViteServer({
    server: {
      ...config.serverOptions,
      middlewareMode: true,
      hmr: hmrConfig,
    },
    appType: config.appType,
    configFile: config.configFile,
    base: config.base,
    cacheDir: config.cacheDir,
    // When using a custom cache directory, disable deps optimization to avoid
    // conflicts with existing cache directories (e.g., from Docker containers)
    optimizeDeps: config.cacheDir
      ? { noDiscovery: true, include: [] }
      : undefined,
  });

  logger.info.log("Vite dev server initialized with %s mode", config.appType);

  return { vite };
};
