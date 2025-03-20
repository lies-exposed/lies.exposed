import { type EndpointsQueryProvider } from "@liexp/shared/lib/providers/EndpointQueriesProvider/index.js";
import {
  type QueryFnKey,
  type QueryPromiseFunction,
} from "@liexp/shared/lib/providers/EndpointQueriesProvider/types.js";
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
    Q: EndpointsQueryProvider,
    conf: Configuration,
  ) => <P, Q, A>(
    params: P,
    query: Q | undefined,
  ) => Promise<AsyncDataRouteQuery<any, any, any>[]>;
};

export const isAsyncDataRoute = (r: ServerRoute): r is AsyncDataRoute =>
  "queries" in r;

export type ServerRoute = RedirectRoute | AsyncDataRoute;
