import * as fs from "fs";
import * as path from "path";
import { dom } from "@fortawesome/fontawesome-svg-core";
import { GetLogger } from "@liexp/core/logger";
import { CssBaseline } from "@material-ui/core";
import { ServerStyleSheets, ThemeProvider } from "@material-ui/core/styles";
import * as express from "express";
import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import { Helmet } from "react-helmet";
import { StaticRouter } from "react-router";
import { ECOTheme } from "../theme";

const ssrLog = GetLogger("ssr");

export const getServer = (
  app: express.Express,
  App: React.ComponentType,
  helmet: typeof Helmet,
  publicDir: string,
  routes: Array<{ path: string; route: React.FC }>
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
        return res.status(500).send("Oops, better luck next time!");
      }

      const context = {
        url: undefined,
      };
      const sheets = new ServerStyleSheets();
      const html = ReactDOMServer.renderToString(
        sheets.collect(
          <React.StrictMode>
            <ThemeProvider theme={ECOTheme}>
              <CssBaseline />
              <StaticRouter location={req.url} context={context}>
                <App />
              </StaticRouter>
            </ThemeProvider>
          </React.StrictMode>
        )
      );

      if (context.url) {
        return next();
      } else {
        // Grab the CSS from the sheets.
        const css = sheets.toString();
        const h = helmet.renderStatic();
        const fontawesomeCss = dom.css();
        const head = [h.title, h.meta, h.script]
          .map((m) => m.toString())
          .join("\n");

        return res
          .setHeader("Content-Type", "text/html")
          .send(
            data
              .replace("<head>", `<head ${h.htmlAttributes.toString()}>`)
              .replace('<meta id="helmet-head"/>', head)
              .replace(
                '<style id="jss-server-side"></style>',
                `<style id="jss-server-side">${css}</style>`
              )
              .replace("<body>", `<body ${h.bodyAttributes.toString()}>`)
              .replace(
                '<style id="font-awesome-css"></style>',
                `<style id="font-awesome-css">${fontawesomeCss}</style>`
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
