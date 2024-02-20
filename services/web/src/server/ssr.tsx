import path from "path";
import { loadENV } from "@liexp/core/lib/env/utils.js";
import { GetLogger } from "@liexp/core/lib/logger/index.js";
import { APIRESTClient } from "@liexp/shared/lib/providers/api-rest.provider";
import { getServer } from "@liexp/ui/lib/react/ssr.js";
import D from "debug";
import express from "express";

const webSrvLog = GetLogger("web");

loadENV();

const run = (): void => {
  void Promise.all([import("../client/App"), import("../client/routes")]).then(
    async ([{ App }, { routes }]) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      // `${process.platform === "win32" ? "" : "/"}${/file:\/{2,3}(.+)\/[^/]/.exec(import.meta.url)![1]}`,
      const publicDir = path.resolve(__dirname, "../");

      const { configuration } = await import("../client/configuration/index");

      const apiProvider = APIRESTClient({
        url: configuration.platforms.api.url,
      });

      const app = getServer(
        express(),
        App,
        publicDir,
        {
          NODE_ENV: (process.env.NODE_ENV as any) ?? "development",
        },
        apiProvider,
        configuration,
        routes,
      );

      app.listen(process.env.PORT, () => {
        webSrvLog.debug.log("app listening on port %s", process.env.PORT);
      });
    },
  );
};

D.enable(process.env.DEBUG ?? "@liexp:*:error");

run();
