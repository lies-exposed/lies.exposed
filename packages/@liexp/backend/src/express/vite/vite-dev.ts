import { type Logger } from "@liexp/core/lib/logger/index.js";
import type { ViteDevServer } from "vite";
import type { ViteServerConfig } from "./types.js";

export interface ViteDevServerResult {
  /** Vite dev server instance */
  vite: ViteDevServer;
}

/**
 * Creates a Vite development server in middleware mode
 *
 * This server is shared between SPA and SSR modes in development.
 * In production, this function is not called.
 */
export const createViteDevServer = async (
  config: ViteServerConfig,
  logger: Logger,
): Promise<ViteDevServerResult> => {
  logger.info.log("Setting up Vite dev server in middleware mode");

  const { createServer: createViteServer } = await import("vite");

  const vite = await createViteServer({
    server: { ...config.serverOptions, middlewareMode: true },
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
