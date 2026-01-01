import { createSpaServer } from "./vite/spa-server.js";
import { createSsrServer } from "./vite/ssr-server.js";
import type {
  ServerHelperConfig,
  SsrServerConfig,
  ViteServerHelper,
} from "./vite/types.js";

/**
 * Creates a configured Express + Vite server for both SPA and SSR applications
 *
 * This is a backward-compatible facade that delegates to `createSpaServer` or
 * `createSsrServer` based on the `appType` configuration.
 *
 * For new code, consider using the specific functions directly:
 * - `createSpaServer` for SPA applications
 * - `createSsrServer` for SSR applications
 */
export const createViteServerHelper = async (
  config: ServerHelperConfig,
): Promise<ViteServerHelper> => {
  const { viteConfig, staticConfig, templateConfig } = config;

  // SSR mode: appType is "custom" or has clientPath configured
  if (viteConfig.appType === "custom" || staticConfig.clientPath) {
    // Validate SSR configuration
    if (!staticConfig.clientPath) {
      throw new Error(
        "SSR mode requires staticConfig.clientPath to be configured",
      );
    }

    if (!templateConfig) {
      throw new Error("SSR mode requires templateConfig to be configured");
    }

    const ssrConfig: SsrServerConfig = {
      service: config.service,
      logger: config.logger,
      isProduction: config.isProduction,
      viteConfig: { ...viteConfig, appType: "custom" },
      staticConfig: {
        ...staticConfig,
        clientPath: staticConfig.clientPath,
      },
      templateConfig,
      expressConfig: config.expressConfig,
      errorConfig: config.errorConfig,
    };

    return createSsrServer(ssrConfig);
  }

  // SPA mode: appType is "spa" and no clientPath
  const result = await createSpaServer({
    service: config.service,
    logger: config.logger,
    isProduction: config.isProduction,
    viteConfig: { ...viteConfig, appType: "spa" },
    staticConfig: {
      buildPath: staticConfig.buildPath,
      indexFile: staticConfig.indexFile,
      extensions: staticConfig.extensions,
    },
    expressConfig: config.expressConfig,
    errorConfig: config.errorConfig,
  });

  return {
    app: result.app,
    vite: result.vite,
    // SPA mode doesn't have these, but we include undefined for type compatibility
    serverEntry: undefined,
    getTemplate: undefined,
    transformTemplate: undefined,
  };
};

/**
 * Type helper for creating server configurations
 */
export const createServerConfig = (
  config: ServerHelperConfig,
): ServerHelperConfig => config;
