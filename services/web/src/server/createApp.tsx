import * as fs from "fs";
import * as path from "path";
import { createViteServerHelper } from "@liexp/backend/lib/express/vite-server-helper.js";
import { GetLogger } from "@liexp/core/lib/logger/index.js";
import { APIRESTClient } from "@ts-endpoint/react-admin";
import D from "debug";
import { routes } from "../client/routes.js";
import { getServer } from "./ssr.js";

export const webSrvLog = GetLogger("web");

export interface WebAppConfig {
  base: string;
  isProduction?: boolean;
  ssrApiUrl?: string;
  apiUrl?: string;
}

export const createApp = async (config: WebAppConfig) => {
  const {
    base,
    isProduction = process.env.VITE_NODE_ENV === "production",
    ssrApiUrl = process.env.VITE_SSR_API_URL,
    apiUrl = process.env.VITE_API_URL,
  } = config;

  D.enable(process.env.VITE_DEBUG ?? "@liexp:*:error");

  webSrvLog.debug.log("Creating app with config %O", config);
  webSrvLog.info.log(
    "Creating app (base %s, production: %s)",
    base,
    isProduction,
  );

  const ssrApiProvider = APIRESTClient({ url: ssrApiUrl });
  const apiProvider = APIRESTClient({ url: apiUrl });

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

  let templateFile: string | undefined;

  // ============================================================
  // Create Vite Server Helper with SSR Support
  // ============================================================
  const { app, serverEntry, getTemplate, transformTemplate } =
    await createViteServerHelper({
      service: "web",
      logger: webSrvLog,
      isProduction,
      viteConfig: {
        appType: "custom", // SSR mode
        base,
        configFile: path.resolve(process.cwd(), "vite.config.ts"),
        // Use a separate cache directory for tests to avoid conflicts with Docker
        cacheDir:
          process.env.NODE_ENV === "test"
            ? path.resolve(process.cwd(), "node_modules/.vite-test")
            : undefined,
      },
      staticConfig: {
        buildPath: outputDir,
        clientPath: isProduction ? path.resolve(outputDir, "client") : cwd,
        indexFile,
      },
      templateConfig: {
        serverEntry: () => Promise.resolve(serverEntryPath),
        getTemplate: isProduction
          ? async () => {
              templateFile ??= fs
                .readFileSync(indexFile, "utf8")
                .replace(
                  "<!--web-analytics-->",
                  `<script data-goatcounter="https://liexp.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>`,
                );

              return Promise.resolve(templateFile);
            }
          : async () => {
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
    // Cast serverEntry from generic type to specific type
    serverEntry: serverEntry as Parameters<typeof getServer>[0]["serverEntry"],
    apiProvider: { ssr: ssrApiProvider, client: apiProvider },
    transformTemplate,
    onRequestError: (e) => {
      webSrvLog.error.log("app error", e);
    },
  });

  return server;
};
