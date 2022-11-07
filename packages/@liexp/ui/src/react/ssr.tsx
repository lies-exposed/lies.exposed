import { CacheProvider } from "@emotion/react";
import createEmotionServer from "@emotion/server/create-instance";
import { dom } from "@fortawesome/fontawesome-svg-core";
import { GetLogger } from "@liexp/core/logger";
import * as express from "express";
import * as fs from "fs";
import { Writable } from "node:stream";
import * as path from "path";
import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import {
  dehydrate,
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from "react-query";
import { StaticRouter } from "react-router-dom/server";
import { CssBaseline, ThemeProvider } from "../components/mui";
import { HelmetProvider } from "../components/SEO";
import { ECOTheme } from "../theme";
import createEmotionCache from "./createEmotionCache";

const ssrLog = GetLogger("ssr");

const ABORT_DELAY = 10 * 1000;

export const getServer = (
  app: express.Express,
  App: React.ComponentType,
  publicDir: string,
  routes: Array<{
    path: string;
    route: React.FC;
    queries: (
      params: any,
      query: any
    ) => Promise<
      Array<{ queryKey: string[]; queryFn: (params: any) => Promise<any> }>
    >;
  }>
  // webpackConfig: webpack.Configuration
): express.Express => {
  const indexFile = path.resolve(publicDir, "./index.html");

  const indexHTML = fs.readFileSync(indexFile, "utf8");

  const requestHandler = (
    req: express.Request,
    res: express.Response,
    next: () => void
  ): void => {
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

    void Promise.all(
      routes
        .filter((r) => r.path === req.route.path)
        .map((r) => r.queries(req.params, req.query))
    )
      .then((queries) => {
        const routeQueries = queries.flatMap((r) => r);
        // eslint-disable-next-line no-console
        console.log("route queries", routeQueries);

        return Promise.all(
          routeQueries.map((r) => {
            return queryClient.prefetchQuery(r.queryKey, r.queryFn);
          })
        );
      })
      .then(() => {
        let didError = false;
        const dehydratedState = dehydrate(queryClient);

        const cache = createEmotionCache();
        const { renderStylesToNodeStream } = createEmotionServer(cache);

        // Simple stream wrapper for writing `backHTML` before closing the stream.
        const resStream = new Writable({
          write(chunk, _encoding, cb) {
            res.write(chunk, cb);
          },
          final() {
            const h = helmetContext.helmet as any;

            const fontawesomeCss = dom.css();
            const head = `
                    ${h.title.toString()}
                    ${h.meta.toString().replace("/>", "/>\n")}
                    ${h.script.toString()}
                  `;

            res.end(
              indexHTML
                .replace("<head>", `<head ${h.htmlAttributes.toString()}>`)
                .replace('<meta id="helmet-head"/>', head)
                .replace("<body>", `<body ${h.bodyAttributes.toString()}>`)
                .replace(
                  '<style id="font-awesome-css"></style>',
                  `<style type="text/css">${fontawesomeCss}</style>`
                )
                .replace(
                  "<!-- SSR DATA -->",
                  `<script>
                        window.__REACT_QUERY_STATE__ = ${JSON.stringify(
                          dehydratedState
                        )};
                      </script>
                      `
                )
            );
          },
        });
        const { pipe, abort } = ReactDOMServer.renderToPipeableStream(
          <StaticRouter location={req.url}>
            <HelmetProvider context={helmetContext}>
              <QueryClientProvider client={queryClient}>
                <Hydrate state={dehydratedState}>
                  <CacheProvider value={cache}>
                    <ThemeProvider theme={ECOTheme}>
                      <CssBaseline enableColorScheme />
                      <App />
                    </ThemeProvider>
                  </CacheProvider>
                </Hydrate>
              </QueryClientProvider>
            </HelmetProvider>
          </StaticRouter>,
          {
            // Executed when the shell render resulted in error
            onError(x) {
              didError = true;
              ssrLog.error.log(`Error %O`, x);
            },
            onShellError(err) {
              didError = true;

              ssrLog.error.log(`Shell Error %O`, err);
            },
            onAllReady() {
              ssrLog.debug.log("On all ready");
            },
            onShellReady() {
              ssrLog.debug.log("On shell ready");

              res
                .status(didError ? 500 : 200)
                .setHeader("Content-Type", "text/html; charset=utf-8");

              stream.pipe(resStream);
            },
          }
        );

        const stream = pipe(renderStylesToNodeStream());

        // Abort when the stream takes too long.
        setTimeout(() => {
          abort();
        }, ABORT_DELAY);
      })
      .catch((e) => {
        ssrLog.error.log("Error %O", e);
        res.status(500).send(e.message);
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

  routes.forEach((r) => {
    app.get(r.path, requestHandler);
  });

  app.use(
    express.static(publicDir, {
      index: false,
    })
  );

  return app;
};
