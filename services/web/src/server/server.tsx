/**
 * Web Server
 *
 * From the example https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-react
 *
 */
import * as http from "http";
import { fileURLToPath } from "node:url";
import * as path from "path";
import { createApp, webSrvLog } from "./createApp.js";

// Get service root directory (resolves to services/web/)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVICE_ROOT = path.resolve(__dirname, "../..");

const run = async (base: string): Promise<void> => {
  const port = process.env.VIRTUAL_PORT
    ? parseInt(process.env.VIRTUAL_PORT)
    : 3000;

  // Create HTTP server first so Vite HMR WebSocket can attach to the same port
  const httpServer = http.createServer();
  webSrvLog.info.log("✓ HTTP server created for HMR WebSocket attachment");

  const app = await createApp({
    base,
    serviceRoot: SERVICE_ROOT,
    httpServer,
  });

  // Use the shared HTTP server so Vite HMR WebSocket and Express share one port
  // Express apps are valid http.RequestListeners at runtime; the types don't
  // align because express.Request/Response extend IncomingMessage/ServerResponse.
  httpServer.on("request", app as http.RequestListener);
  httpServer.on("error", (e) => {
    webSrvLog.error.log("app error", e);
  });

  httpServer.listen(port, process.env.VIRTUAL_HOST, () => {
    webSrvLog.info.log(
      "✓ Server listening on http://%s:%d",
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
