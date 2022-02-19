import * as fs from "fs";
import * as path from "path";
import { GetLogger } from "@econnessione/core/logger";
import { ServerStyleSheets, ThemeProvider } from "@material-ui/core/styles";
import * as express from "express";
import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import { ECOTheme } from "../theme";
import { Helmet } from "react-helmet";

const ssrLog = GetLogger("ssr");

export const getServer = (
  app: express.Express,
  App: React.ComponentType,
  publicDir: string
): express.Express => {
  app.get("/", (req, res) => {
    const indexFile = path.resolve(publicDir, "./index.html");

    fs.readFile(indexFile, "utf8", (err, data) => {
      if (err) {
        ssrLog.error.log("Something went wrong: %O", err);
        return res.status(500).send("Oops, better luck next time!");
      }

      const sheets = new ServerStyleSheets();
      const html = ReactDOMServer.renderToString(
        sheets.collect(
          <ThemeProvider theme={ECOTheme}>
            <App />
          </ThemeProvider>
        )
      );
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
    });
  });

  app.use(express.static(publicDir));

  return app;
};
