import * as fs from "fs";
import * as path from "path";
import { CacheProvider } from "@emotion/react";
import createEmotionServer from "@emotion/server/create-instance";
import { dom } from "@fortawesome/fontawesome-svg-core";
import { GetLogger } from "@liexp/core/logger";
import * as express from "express";
import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import {
  dehydrate,
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from "react-query";
import { StaticRouter } from "react-router-dom/server";
import { HelmetProvider } from "../components/SEO";
import { CssBaseline, ThemeProvider } from "../components/mui";
import { ECOTheme } from "../theme";
import createEmotionCache from "./createEmotionCache";

const ssrLog = GetLogger("ssr");

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
  const requestHandler = (
    req: express.Request,
    res: express.Response,
    next: () => void
  ): void => {
    const indexFile = path.resolve(publicDir, "./index.html");

    fs.readFile(indexFile, "utf8", (err, data) => {
      if (err) {
        ssrLog.error.log("Something went wrong: %O", err);
        res.status(500).send("Oops, better luck next time!");
      } else {
        const context = {
          url: undefined,
        };
        const helmetContext = {
          helmet: undefined,
        };

        const cache = createEmotionCache();
        const { extractCriticalToChunks, constructStyleTagsFromChunks } =
          createEmotionServer(cache);

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
            const dehydratedState = dehydrate(queryClient);

            // const sheets = new ServerStyleSheets();

            const html = ReactDOMServer.renderToString(
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
              </StaticRouter>
            );

            // Grab the CSS from emotion
            const emotionChunks = extractCriticalToChunks(html);
            const emotionCss = constructStyleTagsFromChunks(emotionChunks);

            if (context.url) {
              return next();
            } else {
              // Grab the CSS from the sheets.
              const css = emotionCss;
              const h = helmetContext.helmet as any;

              const fontawesomeCss = dom.css();
              const head = `
            ${h.title.toString()}
            ${h.meta.toString().replace("/>", "/>\n")}
            ${h.script.toString()}
          `;

              res.setHeader("Content-Type", "text/html").send(
                data
                  .replace("<head>", `<head ${h.htmlAttributes.toString()}>`)
                  .replace('<meta id="helmet-head"/>', head)
                  .replace("<body>", `<body ${h.bodyAttributes.toString()}>`)
                  .replace(
                    '<style id="font-awesome-css"></style>',
                    `<style type="text/css">${fontawesomeCss}</style>`
                  )
                  .replace('<style id="css-server-side"></style>', css)
                  .replace(
                    '<div id="root"></div>',
                    `<div id="root">${html}</div>
                      <script>
                        window.__REACT_QUERY_STATE__ = ${JSON.stringify(
                          dehydratedState
                        )};
                      </script>
                    `
                  )
              );
            }

            queryClient.clear();
          })
          .catch((e) => {
            res.status(500).send(e.message);

            queryClient.clear();
          });
      }
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
