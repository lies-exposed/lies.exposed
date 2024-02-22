import { GetLogger } from "@liexp/core/lib/logger/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import {
  CreateQueryProvider,
  QueryProviderCustomQueries,
} from "@liexp/shared/lib/providers/EndpointQueriesProvider/index.js";
import { fromEndpoints } from "@liexp/shared/lib/providers/EndpointsRESTClient/EndpointsRESTClient.js";
import { type APIRESTClient } from "@liexp/shared/lib/providers/api-rest.provider.js";
import type * as express from "express";
import { pathToRegexp } from "path-to-regexp";
import { type Configuration } from "../context/ConfigurationContext.js";
import { isAsyncDataRoute, type ServerRoute } from "./types.js";
import { requestHandler, type ServerRenderer } from "./vite/render.js";

const ssrLog = GetLogger("ssr");

interface GetServerOptions {
  app: express.Express;
  routes: ServerRoute[];
  getTemplate: (url: string, originalUrl: string) => Promise<string>;
  serverEntry: () => Promise<{
    render: ServerRenderer;
    configuration: Configuration;
  }>;
  apiProvider: APIRESTClient;
  onRequestError: (e: any) => void;
}

export const getServer = (
  {
    app,
    routes,
    apiProvider,
    onRequestError,
    ...requestOptions
  }: GetServerOptions,
  // viteServer: ViteDevServer,
): express.Express => {
  const Q = CreateQueryProvider(
    fromEndpoints(apiProvider)(Endpoints),
    QueryProviderCustomQueries,
  );

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  app.get("*", (req, res, next) => {
    ssrLog.debug.log("req.originalUrl %s (%s)", req.originalUrl, req.baseUrl);

    const route = routes.find((r) => {
      try {
        return pathToRegexp(r.path).test(req.originalUrl);
      } catch (e) {
        ssrLog.warn.log(
          "Failed to transform route path %s to regexp: %O",
          r.path,
          e,
        );
        return false;
      }
    });

    if (!route) {
      next();
      return;
    }

    ssrLog.info.log("req.originalUrl %s (%s)", req.originalUrl, route.path);

    const queries = [route].flatMap((route) => {
      ssrLog.debug.log("route %O", route);
      return isAsyncDataRoute(route) ? [route.queries] : [];
    });

    return requestHandler(ssrLog, {
      ...requestOptions,
      Q,
      queries,
      apiProvider,
      onError: onRequestError,
    })(req, res, next);
  });

  return app;
};
