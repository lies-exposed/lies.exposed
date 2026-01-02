// Types
export type {
  BaseServerConfig,
  ErrorConfig,
  ExpressConfig,
  ServerHelperConfig,
  SpaServerConfig,
  SpaServerResult,
  SsrServerConfig,
  SsrServerResult,
  StaticFileConfig,
  TemplateConfig,
  ViteServerConfig,
  ViteServerHelper,
} from "./types.js";

// Middleware utilities
export {
  setupAfterViteMiddleware,
  setupErrorHandler,
  setupExpressMiddleware,
} from "./middleware.js";

// Vite dev server
export { createViteDevServer, type ViteDevServerResult } from "./vite-dev.js";

// SPA server
export {
  createSpaServer,
  setupSpaFallback,
  setupSpaStaticServing,
} from "./spa-server.js";

// SSR server
export {
  createSsrDevTemplateHandlers,
  createSsrProductionTemplateHandlers,
  createSsrServer,
  setupSsrStaticServing,
  type SsrTemplateHandlers,
} from "./ssr-server.js";

// SSR request handler
export {
  createSSRHandler,
  type ServerEntryModule,
  type ServerRenderer,
  type ServerRendererProps,
  type SSRHandlerConfig,
  type SSRQueryFunction,
  type TemplateTransformContext,
  type TemplateTransformHooks,
} from "./ssr-handler.js";
