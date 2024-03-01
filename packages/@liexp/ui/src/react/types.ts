import { type EndpointsQueryProvider } from "@liexp/shared/lib/providers/EndpointQueriesProvider/index.js";
import {
  QueryFnKey,
  QueryPromiseFunction,
} from "@liexp/shared/lib/providers/EndpointQueriesProvider/types.js";
import { type Configuration } from "../context/ConfigurationContext";

interface BaseRoute {
  path: string;
  route: React.FC;
}

type RedirectRoute = BaseRoute & { redirect: string };

export interface AsyncDataRouteQuery {
  queryKey: QueryFnKey<any, any>;
  queryFn: QueryPromiseFunction<any, any, any>;
}

export type AsyncDataRoute = BaseRoute & {
  queries: (
    Q: EndpointsQueryProvider,
    conf: Configuration,
  ) => (params: any, query: any) => Promise<AsyncDataRouteQuery[]>;
};

export const isAsyncDataRoute = (r: ServerRoute): r is AsyncDataRoute =>
  "queries" in r;

export type ServerRoute = RedirectRoute | AsyncDataRoute;
