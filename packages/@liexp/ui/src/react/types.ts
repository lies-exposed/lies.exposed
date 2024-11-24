import { type EndpointsQueryProvider } from "@liexp/shared/lib/providers/EndpointQueriesProvider/index.js";
import {
  type QueryFnKey,
  type QueryPromiseFunction,
} from "@liexp/shared/lib/providers/EndpointQueriesProvider/types.js";
import { type Configuration } from "../context/ConfigurationContext";

interface BaseRoute {
  path: string;
  route: React.FC;
}

type RedirectRoute = BaseRoute & { redirect: string };

export interface AsyncDataRouteQuery<P = any, Q = any, A = any> {
  queryKey: QueryFnKey<P, Q>;
  queryFn: QueryPromiseFunction<P, Q, A>;
}

export type AsyncDataRoute = BaseRoute & {
  queries: (
    Q: EndpointsQueryProvider,
    conf: Configuration,
  ) => (
    params: any,
    query: any,
  ) => Promise<AsyncDataRouteQuery<any, any, any>[]>;
};

export const isAsyncDataRoute = (r: ServerRoute): r is AsyncDataRoute =>
  "queries" in r;

export type ServerRoute = RedirectRoute | AsyncDataRoute;
