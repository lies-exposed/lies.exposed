import path from "path";
import { loadENV } from "@liexp/core/lib/env/utils.js";
import { GetLogger } from "@liexp/core/lib/logger/index.js";
import { getServer } from "@liexp/ui/lib/react/ssr.js";
import D from "debug";
import express from "express";

const webSrvLog = GetLogger("web");

loadENV();

const run = (): void => {
  void Promise.all([import("../client/App"), import("../client/routes")]).then(
    ([{ App }, { routes }]) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      // `${process.platform === "win32" ? "" : "/"}${/file:\/{2,3}(.+)\/[^/]/.exec(import.meta.url)![1]}`,
      const publicDir = path.resolve(__dirname, "../");

      const app = getServer(
        express(),
        App,
        publicDir,
        {
          NODE_ENV: (process.env.NODE_ENV as any) ?? "development",
        },
        routes,
      );

      webSrvLog.debug.log("port", process.env.PUBLIC_URL);

      app.listen(process.env.PORT, () => {
        webSrvLog.debug.log("app listening on port %s", process.env.PORT);
      });
    },
  );
};

D.enable(process.env.DEBUG ?? "@liexp:*:error");

run();
