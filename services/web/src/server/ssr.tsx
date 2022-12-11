import path from "path";
import { GetLogger } from "@liexp/core/logger";
import { getServer } from "@liexp/ui/react/ssr";
import D from "debug";
import dotenv from "dotenv";
import express from "express";

const webSrvLog = GetLogger("web");

dotenv.config({
  path: path.resolve(process.cwd(), process.env.DOTENV_CONFIG_PATH ?? ".env"),
});

const run = (): void => {
  void Promise.all([import("../client/App"), import("../client/routes")]).then(
    ([{ App }, { routes }]) => {
      const app = getServer(
        express(),
        App,
        path.resolve(__dirname, "../"),
        {
          NODE_ENV: (process.env.NODE_ENV as any) ?? "development",
        },
        routes
      );

      webSrvLog.debug.log("port", process.env.PUBLIC_URL);

      app.listen(process.env.PORT, () =>
        { webSrvLog.debug.log("app listening on port %s", process.env.PORT); }
      );
    }
  );
};

D.enable(process.env.DEBUG ?? "@liexp:info");

run();
