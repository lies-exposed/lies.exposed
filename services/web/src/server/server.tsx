/**
 * Web Server
 *
 * From the example https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-react
 *
 */

// other imports
import * as fs from "fs";
import * as path from "path";
import { createViteServerHelper } from "@liexp/backend/lib/express/vite-server-helper.js";
import { GetLogger } from "@liexp/core/lib/logger/index.js";
import { getServer } from "@liexp/ui/lib/react/ssr.js";
import { APIRESTClient } from "@ts-endpoint/react-admin";
import D from "debug";
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

  const indexFile = isProduction
    ? path.resolve(outputDir, "client/index.html")
    : path.resolve(cwd, "index.html");

  const serverEntryPath = isProduction
    ? path.resolve(outputDir, "server/entry.js")
    : "/src/server/entry.tsx";

  // ============================================================
  // Create Vite Server Helper with SSR Support
  // ============================================================

  const { app, serverEntry, getTemplate, transformTemplate } =
    await createViteServerHelper({
      logger: webSrvLog,
      isProduction,
      viteConfig: {
        appType: "custom", // SSR mode
        base,
        configFile: path.resolve(process.cwd(), "vite.config.ts"),
      },
      staticConfig: {
        buildPath: outputDir,
        clientPath: isProduction ? path.resolve(outputDir, "client") : cwd, // Development: align with indexFile location at project root
        indexFile,
      },
      templateConfig: {
        serverEntry: () => Promise.resolve(serverEntryPath), // Always provide the entry path
        getTemplate: isProduction
          ? async () => {
              const templateFile = fs.readFileSync(indexFile, "utf8");
              const html = templateFile.replace(
                "<!--web-analytics-->",
                `<script data-goatcounter="https://liexp.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>`,
              );
              return Promise.resolve(html);
            }
          : async () => {
              // Development mode - read template file, Vite will handle transformation
              const templateFile = fs.readFileSync(indexFile, "utf8");
              return Promise.resolve(templateFile);
            },
        transformTemplate: (t: string) => t,
      },
      expressConfig: {
        compression: isProduction,
      },
      errorConfig: {
        exposeErrorDetails: !isProduction,
        onRequestError: (e) => {
          webSrvLog.error.log("app error", e);
        },
      },
    });

  // ============================================================
  // Setup SSR Server
  // ============================================================

  // Verify required SSR dependencies are available
  if (!getTemplate || !serverEntry || !transformTemplate) {
    throw new Error(
      "SSR configuration incomplete: missing required template or server entry functions",
    );
  }

  const server = getServer({
    app,
    routes,
    getTemplate,
    serverEntry,
    apiProvider: { ssr: ssrApiProvider, client: apiProvider },
    transformTemplate,
    onRequestError: (e) => {
      webSrvLog.error.log("app error", e);
    },
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
