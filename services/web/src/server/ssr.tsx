import path from "path";
import { loadENV } from "@liexp/core/lib/env/utils";
import { GetLogger } from "@liexp/core/lib/logger";
import { getServer } from "@liexp/ui/lib/react/ssr";
import D from "debug";
import express from "express";

const webSrvLog = GetLogger("web");

loadENV();

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

      app.listen(process.env.PORT, () => {
        webSrvLog.debug.log("app listening on port %s", process.env.PORT);
      });
    }
  );
};

D.enable(process.env.DEBUG ?? "@liexp:*:error");

run();
