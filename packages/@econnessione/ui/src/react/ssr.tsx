import * as fs from "fs";
import * as path from "path";
import { GetLogger } from "@econnessione/core/logger";
import { ServerStyleSheets, ThemeProvider } from "@material-ui/core/styles";
import * as express from "express";
import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import { Helmet } from "react-helmet";
import { StaticRouter } from "react-router";
import { ECOTheme } from "../theme";
import { CssBaseline } from "@material-ui/core";

const ssrLog = GetLogger("ssr");

export const getServer = (
  app: express.Express,
  App: React.ComponentType,
  publicDir: string,
  routes: Array<{ path: string; route: React.FC }>
): express.Express => {
  const requestHandler = (
    req: express.Request,
    res: express.Response
  ): void => {
    const indexFile = path.resolve(publicDir, "./index.html");

    fs.readFile(indexFile, "utf8", (err, data) => {
      if (err) {
        ssrLog.error.log("Something went wrong: %O", err);
        return res.status(500).send("Oops, better luck next time!");
      }

      const context = {
        url: undefined,
      };
      const sheets = new ServerStyleSheets();
      const html = ReactDOMServer.renderToString(
        sheets.collect(
          <React.StrictMode>
            <CssBaseline />
            <ThemeProvider theme={ECOTheme}>
              <StaticRouter location={req.url} context={context}>
                <App />
              </StaticRouter>
            </ThemeProvider>
          </React.StrictMode>
        )
      );

      if (context.url) {
        return res.redirect(context.url);
      } else {
        // Grab the CSS from the sheets.
        const css = sheets.toString();
        const helmet = Helmet.renderStatic();
        return res.setHeader("Content-Type", "text/html").send(
          data
            .replace(
              "</head>",
              [helmet.meta, helmet.title, helmet.script]
                .map((m) => m.toString())
                .join("")
                .concat("</head>")
            )
            .replace(
              '<style id="jss-server-side"></style>',
              `<style id="jss-server-side">${css}</style>`
            )
            .replace('<div id="root"></div>', `<div id="root">${html}</div>`)
        );
      }
    });
  };

  routes.forEach((r) => {
    app.get(r.path, requestHandler);
  });

  app.use(express.static(publicDir));

  return app;
};
