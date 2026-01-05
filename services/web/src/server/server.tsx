/**
 * Web Server
 *
 * From the example https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-react
 *
 */
import { fileURLToPath } from "node:url";
import * as path from "path";
import { createApp, webSrvLog } from "./createApp.js";

// Get service root directory (resolves to services/web/)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVICE_ROOT = path.resolve(__dirname, "../..");

const run = async (base: string): Promise<void> => {
  const server = await createApp({ 
    base,
    serviceRoot: SERVICE_ROOT,
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
