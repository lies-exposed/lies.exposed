import { Writable } from "node:stream";
import createEmotionServer from "@emotion/server/create-instance";
import { config, dom } from "@fortawesome/fontawesome-svg-core";
import * as fp from "@liexp/core/lib/fp/index.js";
import { type Logger } from "@liexp/core/lib/logger/index.js";
import { type EndpointsQueryProvider } from "@liexp/shared/lib/providers/EndpointQueriesProvider/index.js";
import { type APIRESTClient } from "@liexp/shared/lib/providers/api-rest.provider.js";
import { QueryClient, dehydrate } from "@tanstack/react-query";
import type * as express from "express";
import type ReactDOMServer from "react-dom/server";
import { type Configuration } from "../../context/ConfigurationContext.js";
import { ECOTheme } from "../../theme/index.js";
import createEmotionCache from "../createEmotionCache.js";
import { type AsyncDataRoute } from "../types.js";

const ABORT_DELAY = 10 * 1000;

config.autoAddCss = false;

interface ServerRendererProps {
  url: string;
  apiProvider: APIRESTClient;
  logger: any;
  dehydratedState: any;
  cache: any;
  helmetContext: any;
  queryClient: any;
  theme: any;
}

export type ServerRenderer = (
  props: ServerRendererProps,
  options: ReactDOMServer.RenderToPipeableStreamOptions,
) => ReactDOMServer.PipeableStream;

interface SSRRequestHandlerOpts {
  Q: EndpointsQueryProvider;
  apiProvider: APIRESTClient;
  getTemplate: (url: string, originalUrl: string) => Promise<string>;
  transformTemplate: (template: string) => string;
  serverEntry: () => Promise<{
    render: ServerRenderer;
    configuration: Configuration;
  }>;
  queries: AsyncDataRoute["queries"][];
  onError: (e: any) => void;
}

export const requestHandler =
  (
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
  ) =>
  async (
    req: express.Request,
    res: express.Response,
    next: () => void,
  ): Promise<void> => {
    const url = req.originalUrl;
    const baseRoute = url.replace(req.baseUrl, "");
    logger.debug.log("Request url %s (%s)", url, baseRoute);

    logger.info.log("reading template from url %s", url);
    const template = await getTemplate(url, req.originalUrl);

    const { render, configuration } = await serverEntry();

    const helmetContext = {
      helmet: undefined,
    };

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          notifyOnChangeProps: ["data"],
          refetchOnMount: false,
        },
      },
    });

    try {
      await Promise.all(
        queries.map((qFn) =>
          qFn(Q, configuration)(req.params, req.query).catch((e) => {
            logger.error.log("Query error %O", e);
            return [];
          }),
        ),
      ).then((queries) => {
        const routeQueries = queries.flatMap((r) => r);
        logger.debug.log("Route queries %O", routeQueries);
        return Promise.all(
          routeQueries.map((r) => {
            logger.debug.log("Prefetch query %O", r.queryKey);
            return queryClient.prefetchQuery(r);
          }),
        );
      });

      let didError = false;
      const dehydratedState = dehydrate(queryClient);

      const cache = createEmotionCache();

      const {
        extractCriticalToChunks,
        constructStyleTagsFromChunks,
        renderStylesToNodeStream,
      } = createEmotionServer(cache);

      let body = "";

      // Simple stream wrapper for writing `backHTML` before closing the stream.
      const resStream = new Writable({
        write(chunk, _encoding, cb) {
          const content = chunk.toString("utf8");

          body += content;

          cb();
        },
        final() {
          try {
            logger.debug.log("Sending data to client");
            const h = helmetContext.helmet as any;

            const htmlAttributes = h.htmlAttributes.toString();
            const head = `
                      ${h.title.toString()}
                      ${h.meta.toString().replace("/>", "/>\n")}
                      ${h.script.toString()}
                    `;

            // const emotionCss = extractCritical(body);
            // console.log(emotionCss);
            // console.log(body);

            const chunks = extractCriticalToChunks(body);
            const styles = constructStyleTagsFromChunks(chunks);

            const fontawesomeCss = dom.css();

            const transformedTemplate = fp.pipe(
              template
                .replace("<head>", `<head ${htmlAttributes}>`)
                .replace("<!--helmet-head-->", head)
                .replace(
                  "<!--fontawesome-css-->",
                  `<style type="text/css">${fontawesomeCss}</style>`,
                )
                .replace("<!--emotion-css-->", styles)
                .replace("<!--app-html-->", body),
              (t) => {
                try {
                  return t.replace(
                    "<!--ssr-data-->",
                    `<script>
                      window.__REACT_QUERY_STATE__ = ${JSON.stringify(dehydratedState)}
                    </script>`,
                  );
                } catch (e) {
                  logger.error.log("Failed to hydrate state: %O", e);
                  return t;
                }
              },
              transformTemplate,
            );

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
          apiProvider,
          url: baseRoute,
          logger,
          helmetContext,
          cache,
          dehydratedState,
          theme: ECOTheme,
          queryClient,
        },
        {
          // Executed when the shell render resulted in error
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

              pipe(renderStylesToNodeStream().pipe(resStream));
            } catch (e) {
              didError = true;
            }
          },
        },
      );

      // Abort when the stream takes too long.
      setTimeout(() => {
        logger.debug.log("Request timeout %d", ABORT_DELAY);
        if (didError) {
          logger.debug.log("Error thrown");
          abort();
        }
      }, ABORT_DELAY);
    } catch (e: any) {
      logger.error.log("Caught error %O", e);
      // If an error is caught, let Vite fix the stack trace so it maps back
      // to your actual source code.
      onError(e);
      next();
    } finally {
      queryClient.clear();
    }
  };
