import * as path from "path";
import { GetLogger } from "@econnessione/core/logger";
import { getServer } from "@econnessione/ui/react/ssr";
import dotenv from "dotenv";
import express from "express";
import { App } from "../client/App";

dotenv.config({
  path: path.resolve(process.cwd(), process.env.DOTENV_CONFIG_PATH ?? ".env"),
});

const webSrvLog = GetLogger("web");

const run = (): void => {
  const app = getServer(express(), App, path.resolve(__dirname, "../"));

  webSrvLog.debug.log("port", process.env.PUBLIC_URL);

  app.listen(process.env.PORT, () =>
    webSrvLog.debug.log("app listening on port %s", process.env.PORT)
  );
};

run();
