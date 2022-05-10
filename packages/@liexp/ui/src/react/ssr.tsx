import * as fs from "fs";
import * as path from "path";
import { dom } from "@fortawesome/fontawesome-svg-core";
import { GetLogger } from "@liexp/core/logger";
import { CssBaseline } from "@mui/material";
import { ThemeProvider, Theme, StyledEngineProvider } from "@mui/material/styles";
import { ServerStyleSheets } from "@mui/styles";
import * as express from "express";
import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import {
  dehydrate,
  Hydrate,
  QueryClient,
  QueryClientProvider
} from "react-query";
import { StaticRouter } from "react-router-dom/server";
import { HelmetProvider } from "../components/SEO";
import { ECOTheme } from "../theme";


declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}


const ssrLog = GetLogger("ssr");

export const getServer = (
  app: express.Express,
  App: React.ComponentType,
  publicDir: string,
  routes: Array<{
    path: string;
    route: React.FC;
    queries: (
      params: any
    ) => Array<{ queryKey: string[]; queryFn: (params: any) => Promise<any> }>;
  }>
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

        const queryClient = new QueryClient({
          defaultOptions: {
            queries: {
              notifyOnChangeProps: ["data"],
            },
          },
        });

        const routeQueries = routes
          .filter((r) => r.path === req.route.path)
          .flatMap((r) => r.queries(req.params));

        void Promise.all(
          routeQueries.map((r) => {
            // console.log('route queries', r);
            return queryClient.fetchQuery(r.queryKey, r.queryFn);
          })
        )
          .then(() => {
            const dehydratedState = dehydrate(queryClient);

            const sheets = new ServerStyleSheets();
            const html = ReactDOMServer.renderToString(
              sheets.collect(
                <HelmetProvider context={helmetContext}>
                  <QueryClientProvider client={queryClient}>
                    <Hydrate state={dehydratedState}>
                      <StyledEngineProvider injectFirst>
                        <ThemeProvider theme={ECOTheme}>
                          <CssBaseline />
                          <StaticRouter location={req.url}>
                            <App />
                          </StaticRouter>
                        </ThemeProvider>
                      </StyledEngineProvider>
                    </Hydrate>
                  </QueryClientProvider>
                </HelmetProvider>
              )
            );

            if (context.url) {
              return next();
            } else {
              // Grab the CSS from the sheets.
              const css = sheets.toString();
              const h = helmetContext.helmet as any;

              const fontawesomeCss = dom.css();
              const head = `
            ${h.title.toString()}
            ${h.meta.toString()}
            ${h.script.toString()}
          `;

              res.setHeader("Content-Type", "text/html").send(
                data
                  .replace("<head>", `<head ${h.htmlAttributes.toString()}>`)
                  .replace('<meta id="helmet-head" />', head)
                  .replace(
                    '<style id="jss-server-side"></style>',
                    `<style id="jss-server-side">${css}</style>`
                  )
                  .replace("<body>", `<body ${h.bodyAttributes.toString()}>`)
                  .replace(
                    '<style id="font-awesome-css"></style>',
                    `<style id="font-awesome-css">${fontawesomeCss}</style>`
                  )
                  .replace(
                    '<div id="root"></div>',
                    `
                  <div id="root">${html}</div>
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

  routes.forEach((r) => {
    app.get(r.path, requestHandler);
  });

  app.use(express.static(publicDir));

  return app;
};
