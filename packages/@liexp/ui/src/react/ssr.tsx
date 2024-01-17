import * as fs from "fs";
import { Writable } from "node:stream";
import * as path from "path";
import { CacheProvider } from "@emotion/react";
import { dom } from "@fortawesome/fontawesome-svg-core";
import { GetLogger } from "@liexp/core/lib/logger/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import {
  CreateQueryProvider,
  QueryProviderCustomQueries,
  type EndpointsQueryProvider,
} from "@liexp/shared/lib/providers/EndpointQueriesProvider/index.js";
import { fromEndpoints } from "@liexp/shared/lib/providers/EndpointsRESTClient/EndpointsRESTClient.js";
import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
  dehydrate,
} from "@tanstack/react-query";
import * as express from "express";
import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router-dom/server.js";
import { apiProvider } from "../client/api.js";
import { HelmetProvider } from "../components/SEO.js";
import { CssBaseline, ThemeProvider } from "../components/mui/index.js";
import { ECOTheme } from "../theme/index.js";
import createEmotionCache from "./createEmotionCache.js";

const ssrLog = GetLogger("ssr");

const ABORT_DELAY = 10 * 1000;

interface BaseRoute {
  path: string;
  route: React.FC;
}
type RedirectRoute = BaseRoute & { redirect: string };
type AsyncDataRoute = BaseRoute & {
  queries: (
    Q: EndpointsQueryProvider,
  ) => (
    params: any,
    query: any,
  ) => Promise<
    Array<{ queryKey: string[]; queryFn: (params: any) => Promise<any> }>
  >;
};
export type ServerRoute = RedirectRoute | AsyncDataRoute;

const isRedirectRoute = (r: ServerRoute): r is RedirectRoute => {
  return (r as any).redirect;
};
export const getServer = (
  app: express.Express,
  App: React.ComponentType,
  publicDir: string,
  env: {
    NODE_ENV: "production" | "development";
  },
  routes: ServerRoute[],
  // webpackConfig: webpack.Configuration
): express.Express => {
  const indexFile = path.resolve(publicDir, "./index.html");

  const indexHTML = fs
    .readFileSync(indexFile, "utf8")
    .split('<div id="root">')[0];

  const Q = CreateQueryProvider(
    fromEndpoints(apiProvider)(Endpoints),
    QueryProviderCustomQueries,
  );

  const requestHandler =
    (r: AsyncDataRoute) =>
    (req: express.Request, res: express.Response, next: () => void): void => {
      const helmetContext = {
        helmet: undefined,
      };

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            notifyOnChangeProps: ["data"],
          },
        },
      });

      void r
        .queries(Q)(req.params, req.query)
        .then((queries) => {
          const routeQueries = queries.flatMap((r) => r);
          return Promise.all(
            routeQueries.map((r) => {
              ssrLog.debug.log("Prefetch query %O", r.queryKey);
              return queryClient.prefetchQuery(r);
            }),
          );
        })
        .then(() => {
          let didError = false;
          const dehydratedState = dehydrate(queryClient);

          const cache = createEmotionCache();

          let body = "";

          // Simple stream wrapper for writing `backHTML` before closing the stream.
          const resStream = new Writable({
            write(chunk, _encoding, cb) {
              const content = chunk.toString("utf8");

              body += content;

              cb();
            },
            final() {
              const h = helmetContext.helmet as any;

              const fontawesomeCss = dom.css();
              const head = `
                    ${h.title.toString()}
                    ${h.meta.toString().replace("/>", "/>\n")}
                    ${h.script.toString()}
                  `;

              // const { extractCritical } = createEmotionServer(cache);

              // const emotionCss = extractCritical(body);
              // console.log(emotionCss);

              res.write(
                indexHTML
                  .replace("<head>", `<head ${h.htmlAttributes.toString()}>`)
                  .replace('<meta id="helmet-head"/>', head)
                  .replace("<body>", `<body ${h.bodyAttributes.toString()}>`)
                  .replace(
                    '<style id="font-awesome-css"></style>',
                    `<style type="text/css">${fontawesomeCss}</style>`,
                  )
                  // .replace('<style id="css-server-side"></style>', emotionCss.css)
                  .concat('<div id="root">')
                  .concat(body),
              );

              res.end(
                `</div>
                <script>
                  window.__REACT_QUERY_STATE__ = ${JSON.stringify(
                    dehydratedState,
                  )};
                </script>
              </body>
            </html>`,
              );
            },
          });

          const { pipe, abort } = ReactDOMServer.renderToPipeableStream(
            <StaticRouter location={req.url}>
              <HelmetProvider context={helmetContext}>
                <QueryClientProvider client={queryClient}>
                  <HydrationBoundary state={dehydratedState}>
                    <CacheProvider value={cache}>
                      <ThemeProvider theme={ECOTheme}>
                        <CssBaseline enableColorScheme />
                        {env.NODE_ENV === "development" ? (
                          <App />
                        ) : (
                          <React.Suspense>
                            <App />
                          </React.Suspense>
                        )}
                      </ThemeProvider>
                    </CacheProvider>
                  </HydrationBoundary>
                </QueryClientProvider>
              </HelmetProvider>
            </StaticRouter>,
            {
              // Executed when the shell render resulted in error
              onError(x) {
                ssrLog.error.log(`Error caught %O`, x);
                didError = true;
              },
              onShellError(err) {
                didError = true;
                ssrLog.error.log(`Shell error caught %O`, err);
              },
              onAllReady() {
                ssrLog.debug.log("On all ready");
              },
              onShellReady() {
                const status = didError ? 500 : 200;

                ssrLog.debug.log("Send response %d", status);

                res
                  .status(status)
                  .setHeader("Content-Type", "text/html; charset=utf-8");

                pipe(resStream);
              },
            },
          );

          // const stream = pipe(renderStylesToNodeStream());

          // Abort when the stream takes too long.
          setTimeout(() => {
            ssrLog.debug.log("Request timeout %d", ABORT_DELAY);
            if (didError) {
              ssrLog.debug.log("Error thrown");
              abort();
            }
          }, ABORT_DELAY);
        })
        .catch((e) => {
          ssrLog.error.log("Caught error %O", e);
          res.status(500).end(e.message);
        })
        .finally(() => {
          queryClient.clear();
        });
    };

  // if (process.env.NODE_ENV === "development") {
  //   app.use(
  //     webpackDevServer(webpack(webpackConfig), {
  //       publicPath: webpackConfig.output?.publicPath,
  //     })
  //   );
  // }

  app.use(
    express.static(publicDir, {
      index: false,
    }),
  );

  routes.forEach((r) => {
    if (isRedirectRoute(r)) {
      app.get(r.path, (req, res) => {
        // TODO: very opinionated and not really versatile
        res.redirect(r.redirect.replace(":id", req.params.id));
        return res;
      });
    } else {
      app.get(r.path, requestHandler(r));
    }
  });

  return app;
};
