import { type Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { type QueryProviderCustomQueries } from "@liexp/shared/lib/providers/EndpointQueriesProvider/overrides.js";
import {
  type QueryFnKey,
  type QueryPromiseFunction,
  type EndpointsQueryProvider,
} from "@ts-endpoint/tanstack-query";
import { type Configuration } from "../context/ConfigurationContext.js";

interface BaseRoute {
  path: string;
  route: React.FC;
}

type RedirectRoute = BaseRoute & { redirect: string };

export interface AsyncDataRouteQuery<P, Q, A> {
  queryKey: QueryFnKey<P, Q | undefined>;
  queryFn: QueryPromiseFunction<P, Q | undefined, A>;
}

export type AsyncDataRoute = BaseRoute & {
  queries: (
    Q: EndpointsQueryProvider<Endpoints, QueryProviderCustomQueries>,
    conf: Configuration,
  ) => <P, Q, _A>(
    params: P,
    query: Q | undefined,
  ) => Promise<AsyncDataRouteQuery<any, any, any>[]>;
};

export const isAsyncDataRoute = (r: ServerRoute): r is AsyncDataRoute =>
  "queries" in r;

export type ServerRoute = RedirectRoute | AsyncDataRoute;
