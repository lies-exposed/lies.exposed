/**
 * Web Server
 *
 * From the example https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-react
 *
 */
import { createApp, webSrvLog } from "./createApp.js";

const run = async (base: string): Promise<void> => {
  const server = await createApp({ base });

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
