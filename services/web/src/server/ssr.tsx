import { GetLogger } from "@liexp/core/lib/logger/index.js";
import { DecodeError } from "@liexp/io/lib/http/Error/DecodeError.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { EffectDecoder } from "@liexp/shared/lib/endpoints/helpers.js";
import { QueryProviderCustomQueries } from "@liexp/shared/lib/providers/EndpointQueriesProvider/overrides.js";
import { type Configuration } from "@liexp/ui/lib/context/ConfigurationContext.js";
import {
  isAsyncDataRoute,
  type ServerRoute,
} from "@liexp/ui/lib/react/types.js";
import { type APIRESTClient } from "@ts-endpoint/react-admin";
import { GetResourceClient } from "@ts-endpoint/resource-client";
import { CreateQueryProvider } from "@ts-endpoint/tanstack-query";
import type * as express from "express";
import * as pathToRegexp from "path-to-regexp";
import { requestHandler, type AppServerRenderer } from "./ssr-render.js";

const ssrLog = GetLogger("ssr");

interface GetServerOptions {
  app: express.Express;
  routes: ServerRoute[];
  getTemplate: (url: string, originalUrl: string) => Promise<string>;
  serverEntry: () => Promise<{
    render: AppServerRenderer;
    configuration: Configuration;
  }>;
  transformTemplate: (template: string) => string;
  apiProvider: {
    client: APIRESTClient;
    ssr: APIRESTClient;
  };
  onRequestError: (e: unknown) => void;
}

export const getServer = ({
  app,
  routes,
  apiProvider,
  onRequestError,
  ...requestOptions
}: GetServerOptions): express.Express => {
  const Q = CreateQueryProvider(
    GetResourceClient(apiProvider.ssr.client, Endpoints, {
      decode: EffectDecoder((e) => DecodeError.of("APIError", e)),
    }),
    QueryProviderCustomQueries,
  );

  app.get("/healthcheck", (req, res) => {
    res.status(200).send({ data: { status: "OK" } });
  });

  app.use("*all", (req, res, next) => {
    ssrLog.debug.log("req.originalUrl %s (%s)", req.originalUrl, req.baseUrl);
    ssrLog.debug.log("req.params %O", req.params);

    // Strip query string from URL for route matching
    const pathOnly = req.baseUrl.split("?")[0];

    let matchResult: ReturnType<ReturnType<typeof pathToRegexp.match>> | null =
      null;
    const route =
      routes.find((r) => {
        ssrLog.debug.log("r.path %s", r.path);
        try {
          matchResult = pathToRegexp.match(r.path)(pathOnly);
          return matchResult;
        } catch (e) {
          ssrLog.debug.log(
            "Failed to transform route path %s to regexp: %O",
            r.path,
            e,
          );
          return false;
        }
      }) ?? routes.find((r) => r.path === "/");

    if (!route) {
      ssrLog.warn.log("No route found for %s", req.originalUrl);
      next();
      return;
    }

    // Extract and assign params from the route match result
    if (matchResult && "params" in matchResult) {
      req.params = matchResult.params;
    }

    ssrLog.info.log("req.originalUrl %s (%s)", req.originalUrl, route.path);
    ssrLog.debug.log("Extracted params: %O", req.params);

    const queries = [route].flatMap((route) => {
      ssrLog.info.log("route %O", route);
      return isAsyncDataRoute(route) ? [route.queries] : [];
    });

    return requestHandler(ssrLog, {
      ...requestOptions,
      Q,
      queries,
      apiProvider: apiProvider.client,
      onError: onRequestError,
    })(req, res, next);
  });

  return app;
};
