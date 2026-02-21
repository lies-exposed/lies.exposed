import createEmotionServer from "@emotion/server/create-instance";
import { config, dom } from "@fortawesome/fontawesome-svg-core";
import {
  createSSRHandler,
  type ServerRenderer,
  type ServerRendererProps,
} from "@liexp/backend/lib/express/vite/ssr-handler.js";
import { type Logger } from "@liexp/core/lib/logger/index.js";
import { type Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { type QueryProviderCustomQueries } from "@liexp/shared/lib/providers/EndpointQueriesProvider/overrides.js";
import { type Configuration } from "@liexp/ui/lib/context/ConfigurationContext.js";
import createEmotionCache from "@liexp/ui/lib/react/createEmotionCache.js";
import { type AsyncDataRoute } from "@liexp/ui/lib/react/types.js";
import { ECOThemeDark } from "@liexp/ui/lib/theme/index.js";
import { QueryClient, dehydrate } from "@tanstack/react-query";
import { type APIRESTClient } from "@ts-endpoint/react-admin";
import { type EndpointsQueryProvider } from "@ts-endpoint/tanstack-query";
import type * as express from "express";

config.autoAddCss = false;

/**
 * Extended server renderer props with API provider
 */
interface AppServerRendererProps extends ServerRendererProps<
  typeof ECOThemeDark,
  ReturnType<typeof createEmotionCache>
> {
  apiProvider: APIRESTClient;
}

/**
 * App-specific server renderer type
 */
export type AppServerRenderer = (
  props: AppServerRendererProps,
  options: Parameters<ServerRenderer>[1],
) => ReturnType<ServerRenderer>;

/**
 * Options for creating the SSR request handler
 */
interface SSRRequestHandlerOpts {
  Q: EndpointsQueryProvider<Endpoints, QueryProviderCustomQueries>;
  apiProvider: APIRESTClient;
  getTemplate: (url: string, originalUrl: string) => Promise<string>;
  transformTemplate: (template: string) => string;
  serverEntry: () => Promise<{
    render: AppServerRenderer;
    configuration: Configuration;
  }>;
  queries: AsyncDataRoute["queries"][];
  onError: (e: unknown) => void;
}

/**
 * Creates an SSR request handler for the lies.exposed web application
 *
 * This wraps the generic createSSRHandler from @liexp/backend with
 * application-specific configuration (theme, cache, queries).
 */
export const requestHandler = (
  logger: Logger,
  {
    Q,
    apiProvider,
    queries,
    getTemplate,
    serverEntry,
    transformTemplate,
    onError,
  }: SSRRequestHandlerOpts,
): express.RequestHandler => {
  // Wrap queries to match the generic interface
  const wrappedQueries = queries.map(
    (queryFn) =>
      async (
        params: express.Request["params"],
        query: express.Request["query"],
        configuration: Configuration,
      ) => {
        try {
          const results = await queryFn(Q, configuration)(params, query);
          // Cast to match the generic interface (via unknown to satisfy type checker)
          return results as unknown as {
            queryKey: unknown[];
            queryFn: () => Promise<unknown>;
          }[];
        } catch (e) {
          logger.error.log("Query error %O", e);
          return [];
        }
      },
  );

  // Wrap server entry to inject apiProvider
  const wrappedServerEntry = async () => {
    const { render, configuration } = await serverEntry();
    return {
      render: (
        props: ServerRendererProps<
          typeof ECOThemeDark,
          ReturnType<typeof createEmotionCache>
        >,
        options: Parameters<ServerRenderer>[1],
      ) => {
        // Inject apiProvider into props
        return render({ ...props, apiProvider }, options);
      },
      configuration,
    };
  };

  return createSSRHandler({
    logger,
    getTemplate,
    transformTemplate,
    serverEntry: wrappedServerEntry,
    queries: wrappedQueries,
    onError,
    createQueryClient: () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            notifyOnChangeProps: ["data"],
            refetchOnMount: false,
          },
        },
      }) as {
        prefetchQuery: (query: {
          queryKey: unknown[];
          queryFn: () => Promise<unknown>;
        }) => Promise<void>;
        clear: () => void;
      },
    dehydrateQueryClient: (queryClient) =>
      dehydrate(queryClient as QueryClient),
    createCache: createEmotionCache,
    createStyleServer: (cache) => {
      const emotionServer = createEmotionServer(cache);
      return {
        extractCriticalToChunks: (html: string) =>
          emotionServer.extractCriticalToChunks(html) as unknown,
        constructStyleTagsFromChunks: (chunks: unknown) =>
          emotionServer.constructStyleTagsFromChunks(
            chunks as Parameters<
              typeof emotionServer.constructStyleTagsFromChunks
            >[0],
          ),
        renderStylesToNodeStream: emotionServer.renderStylesToNodeStream,
      };
    },
    theme: ECOThemeDark,
    getAdditionalCss: () => dom.css(),
  });
};
