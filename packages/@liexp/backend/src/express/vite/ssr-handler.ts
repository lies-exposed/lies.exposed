import { Writable } from "node:stream";
import { type Logger } from "@liexp/core/lib/logger/index.js";
import type * as express from "express";
import type ReactDOMServer from "react-dom/server";
import type { HelmetServerState } from "react-helmet-async";

const DEFAULT_ABORT_DELAY = 10 * 1000;

/**
 * Props passed to the server renderer component
 */
export interface ServerRendererProps<TTheme = unknown, TCache = unknown> {
  url: string;
  logger: Logger;
  dehydratedState: unknown;
  cache: TCache;
  helmetContext: { helmet: HelmetServerState };
  queryClient: unknown;
  theme: TTheme;
}

/**
 * Server renderer function type
 */
export type ServerRenderer<TTheme = unknown, TCache = unknown> = (
  props: ServerRendererProps<TTheme, TCache>,
  options: ReactDOMServer.RenderToPipeableStreamOptions,
) => ReactDOMServer.PipeableStream;

/**
 * Server entry module shape
 */
export interface ServerEntryModule<
  TTheme = unknown,
  TCache = unknown,
  TConfig = unknown,
> {
  render: ServerRenderer<TTheme, TCache>;
  configuration: TConfig;
}

/**
 * Query function type for prefetching data
 */
export type SSRQueryFunction<TConfig = unknown> = (
  params: express.Request["params"],
  query: express.Request["query"],
  config: TConfig,
) => Promise<{ queryKey: unknown[]; queryFn: () => Promise<unknown> }[]>;

/**
 * Template transformation hooks
 */
export interface TemplateTransformHooks {
  /**
   * Extract and inject CSS from rendered HTML
   * @returns CSS style tags to inject
   */
  extractStyles?: (html: string) => string;

  /**
   * Additional template transformations
   */
  transformHtml?: (html: string, context: TemplateTransformContext) => string;
}

export interface TemplateTransformContext {
  helmet: HelmetServerState;
  dehydratedState: unknown;
  body: string;
}

/**
 * Configuration for SSR request handler
 */
export interface SSRHandlerConfig<
  TTheme = unknown,
  TCache = unknown,
  TConfig = unknown,
> {
  /** Logger instance */
  logger: Logger;

  /** Function to get HTML template */
  getTemplate: (url: string, originalUrl: string) => Promise<string>;

  /** Function to transform the final template */
  transformTemplate: (template: string) => string;

  /** Function to load server entry module */
  serverEntry: () => Promise<ServerEntryModule<TTheme, TCache, TConfig>>;

  /** Query functions for prefetching data */
  queries: SSRQueryFunction<TConfig>[];

  /** Error handler */
  onError: (error: unknown) => void;

  /** Create a new QueryClient instance */
  createQueryClient: () => {
    prefetchQuery: (query: {
      queryKey: unknown[];
      queryFn: () => Promise<unknown>;
    }) => Promise<void>;
    clear: () => void;
  };

  /** Dehydrate QueryClient state */
  dehydrateQueryClient: (queryClient: unknown) => unknown;

  /** Create emotion/style cache */
  createCache: () => TCache;

  /** Create emotion server for extracting styles */
  createStyleServer: (cache: TCache) => {
    extractCriticalToChunks: (html: string) => unknown;
    constructStyleTagsFromChunks: (chunks: unknown) => string;
    renderStylesToNodeStream: () => NodeJS.ReadWriteStream;
  };

  /** Theme to use for rendering */
  theme: TTheme;

  /** Additional CSS to inject (e.g., FontAwesome) */
  getAdditionalCss?: () => string;

  /** Abort delay in milliseconds (default: 10000) */
  abortDelay?: number;
}

/**
 * Creates an SSR request handler for Express
 *
 * This is a generic handler that can be configured with application-specific
 * theme, cache, and configuration. It integrates with the Vite server helper's
 * template functions.
 *
 * @example
 * ```typescript
 * const handler = createSSRHandler({
 *   logger,
 *   getTemplate,
 *   transformTemplate,
 *   serverEntry,
 *   queries: [homePageQueries, articleQueries],
 *   onError: (e) => console.error(e),
 *   createQueryClient: () => new QueryClient(),
 *   dehydrateQueryClient: dehydrate,
 *   createCache: createEmotionCache,
 *   createStyleServer: createEmotionServer,
 *   theme: MyTheme,
 * });
 *
 * app.get('*', handler);
 * ```
 */
export const createSSRHandler = <
  TTheme = unknown,
  TCache = unknown,
  TConfig = unknown,
>(
  config: SSRHandlerConfig<TTheme, TCache, TConfig>,
): express.RequestHandler => {
  const {
    logger,
    getTemplate,
    transformTemplate,
    serverEntry,
    queries,
    onError,
    createQueryClient,
    dehydrateQueryClient,
    createCache,
    createStyleServer,
    theme,
    getAdditionalCss,
    abortDelay = DEFAULT_ABORT_DELAY,
  } = config;

  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ): Promise<void> => {
    const url = req.originalUrl;
    const baseRoute = url.replace(req.baseUrl, "");
    logger.debug.log("Request url %s (%s)", url, baseRoute);

    logger.info.log("reading template from url %s", url);
    const template = await getTemplate(url, req.originalUrl);

    const queryClient = createQueryClient();

    const helmetContext = {
      helmet: undefined,
    } as unknown as ServerRendererProps["helmetContext"];

    try {
      const { render, configuration } = await serverEntry();

      // Prefetch all queries
      await Promise.all(
        queries.map((queryFn) =>
          queryFn(req.params, req.query, configuration).catch((e) => {
            logger.error.log("Query error %O", e);
            return [];
          }),
        ),
      )
        .then((queryResults) => {
          const routeQueries = queryResults.flatMap((r) => r);
          logger.debug.log("Route queries %O", routeQueries);
          return Promise.all(
            routeQueries.map((r) => {
              logger.debug.log("Prefetch query %O", r.queryKey);
              return queryClient.prefetchQuery(r);
            }),
          );
        })
        .catch((e) => {
          logger.error.log("Prefetch error %O", e);
          throw e;
        });

      let didError = false;
      const dehydratedState = dehydrateQueryClient(queryClient);
      const cache = createCache();
      const styleServer = createStyleServer(cache);

      let body = "";

      // Stream wrapper for collecting rendered HTML
      const resStream = new Writable({
        write(chunk, _encoding, cb) {
          body += chunk.toString("utf8");
          cb();
        },
        final() {
          try {
            logger.debug.log("Sending data to client %O", helmetContext);
            const h = helmetContext.helmet ?? {
              htmlAttributes: "",
              title: "<title>App</title>",
              meta: "",
              script: "",
            };

            const htmlAttributes = h.htmlAttributes.toString();
            const head = `
              ${h.title.toString()}
              ${h.meta.toString().replace("/>", "/>\n")}
              ${h.script?.toString() ?? ""}
            `;

            const chunks = styleServer.extractCriticalToChunks(body);
            const styles = styleServer.constructStyleTagsFromChunks(chunks);
            const additionalCss = getAdditionalCss?.() ?? "";

            let transformedTemplate = template
              .replace("<head>", `<head ${htmlAttributes}>`)
              .replace("<!--helmet-head-->", head)
              .replace(
                "<!--fontawesome-css-->",
                additionalCss
                  ? `<style type="text/css">${additionalCss}</style>`
                  : "",
              )
              .replace("<!--emotion-css-->", styles)
              .replace("<!--app-html-->", body);

            try {
              transformedTemplate = transformedTemplate.replace(
                "<!--ssr-data-->",
                `<script>
                  window.__REACT_QUERY_STATE__ = ${JSON.stringify(dehydratedState)}
                </script>`,
              );
            } catch (e) {
              logger.error.log("Failed to hydrate state: %O", e);
            }

            transformedTemplate = transformTemplate(transformedTemplate);

            res.write(transformedTemplate);
          } catch (e) {
            didError = true;
            logger.error.log("Error caught %O", e);
            res.write(JSON.stringify(e));
          }

          res.end();
        },
      });

      const { pipe, abort } = render(
        {
          url: baseRoute,
          logger,
          helmetContext,
          cache,
          dehydratedState,
          theme,
          queryClient,
        },
        {
          onError(x, errorInfo) {
            logger.error.log(`Error caught %O (%O)`, x, errorInfo);
            didError = true;
          },
          onShellError(err) {
            didError = true;
            logger.error.log(`Shell error caught %O`, err);
          },
          onAllReady() {
            logger.debug.log("On all ready");
          },
          onShellReady() {
            const status = didError ? 500 : 200;

            try {
              logger.info.log("Send response %d", status);

              res
                .status(status)
                .setHeader("Content-Type", "text/html; charset=utf-8");

              pipe(styleServer.renderStylesToNodeStream().pipe(resStream));
            } catch (_e) {
              didError = true;
            }
          },
        },
      );

      // Abort when the stream takes too long
      setTimeout(() => {
        logger.debug.log(
          "%s %s Request timeout %d (error %s)",
          req.method,
          req.url,
          abortDelay,
          didError,
        );
        if (didError) {
          logger.info.log("Error thrown");
          abort();
        }
      }, abortDelay);
    } catch (e: unknown) {
      logger.error.log("Caught error %O", e);
      onError(e);
      next();
    } finally {
      queryClient.clear();
    }
  };
};
