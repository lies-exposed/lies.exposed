import * as path from "path";
import { GetLogger } from "@econnessione/core/logger";
import express from "express";

const PUBLIC_PATH = path.resolve(__dirname, "../public");

const PORT = 3010;
export const run = async (): Promise<void> => {
  const log = GetLogger("data-server");
  const app = express();

  app.use(
      (req, _, next) => {
        log.debug.log('[%s] path %s', req.method, req.url);
        next();
      },
      express.static(PUBLIC_PATH)
      );

  app.listen(PORT);
  log.debug.log("Servere listen on %d", PORT);
};

run()
  // eslint-disable-next-line no-console
  .then(() => console.log("Server listening"))
  // eslint-disable-next-line no-console
  .catch(console.error);
