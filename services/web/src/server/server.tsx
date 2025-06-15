/**
 * Web Server
 *
 * From the example https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-react
 *
 */

// other imports
import * as fs from "fs";
import * as path from "path";
import { GetLogger } from "@liexp/core/lib/logger/index.js";
import { getServer } from "@liexp/ui/lib/react/ssr.js";
import { type ServerRenderer } from "@liexp/ui/lib/react/vite/render.js";
import { APIRESTClient } from "@ts-endpoint/react-admin";
import compression from "compression";
import D from "debug";
import express from "express";
import sirv from "sirv";
import { routes } from "../client/routes.js";

const webSrvLog = GetLogger("web");

export const run = async (base: string): Promise<void> => {
  D.enable(process.env.VITE_DEBUG ?? "@liexp:*:error");

  webSrvLog.debug.log("Running with process.env %O", base, process.env);

  webSrvLog.info.log("Server running (base %s)", base);

  const isProduction = process.env.VITE_NODE_ENV === "production";

  const ssrApiProvider = APIRESTClient({
    url: process.env.VITE_SSR_API_URL,
  });

  const apiProvider = APIRESTClient({
    url: process.env.VITE_API_URL,
  });

  const cwd = process.cwd();

  const outputDir = isProduction
    ? path.resolve(cwd, "build")
    : path.resolve(cwd, "src");

  const app = express();

  const indexFile = isProduction
    ? path.resolve(outputDir, "client/index.html")
    : path.resolve(cwd, "index.html");

  let serverEntry;
  let getTemplate;
  let transformTemplate;
  let onRequestError;
  // let routes;

  if (isProduction) {
    serverEntry = () => import(path.resolve(outputDir, "server/entry.js"));
    const templateFile = fs.readFileSync(indexFile, "utf8");

    getTemplate = (url: string, originalUrl: string) =>
      Promise.resolve(
        templateFile.replace(
          "<!--web-analytics-->",
          `<script data-goatcounter="https://liexp.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>`,
        ),
      );

    transformTemplate = (template: string) => template;
    onRequestError = (e: any) => {
      webSrvLog.error.log("app error", e);
    };

    app.use(compression());
    app.use(base, sirv(path.resolve(outputDir, "client"), { extensions: [] }));
  } else {
    const { createServer: createViteServer } = await import("vite");

    const vite = await createViteServer({
      server: { middlewareMode: true },
      configFile: path.resolve(process.cwd(), "vite.config.ts"),
      appType: "custom",
      base,
    });

    serverEntry = () =>
      vite.ssrLoadModule("/src/server/entry.tsx", {
        fixStacktrace: true,
      }) as Promise<{
        render: ServerRenderer;
        configuration: any;
      }>;

    app.use(vite.middlewares);

    getTemplate = (url: string, originalUrl: string): Promise<string> => {
      const templateFile = fs.readFileSync(indexFile, "utf8");
      return vite.transformIndexHtml(url, templateFile, originalUrl);
    };

    transformTemplate = (t: string) => t;

    onRequestError = (e: any) => {
      vite.ssrFixStacktrace(e);
    };
  }

  const server = getServer({
    app,
    routes,
    getTemplate,
    serverEntry,
    apiProvider: { ssr: ssrApiProvider, client: apiProvider },
    transformTemplate,
    onRequestError,
  });

  server.on("error", (e) => {
    webSrvLog.error.log("app error", e);
  });

  const port = process.env.VIRTUAL_PORT
    ? parseInt(process.env.VIRTUAL_PORT)
    : 3000;

  server.listen(port, process.env.VIRTUAL_HOST, (error) => {
    if (error) {
      throw error;
    }

    webSrvLog.info.log(
      "Server listening on %s:%s",
      process.env.VIRTUAL_HOST,
      port,
    );
  });
};

run("/").catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});

process.on("uncaughtException", (e) => {
  // eslint-disable-next-line no-console
  console.error("Process uncaught exception", e);

  process.exit(1);
});
