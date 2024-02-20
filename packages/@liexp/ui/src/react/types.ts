import { type EndpointsQueryProvider } from "@liexp/shared/lib/providers/EndpointQueriesProvider";
import { type Configuration } from '../context/ConfigurationContext';

interface BaseRoute {
  path: string;
  route: React.FC;
}
type RedirectRoute = BaseRoute & { redirect: string };
export type AsyncDataRoute = BaseRoute & {
  queries: (
    Q: EndpointsQueryProvider,
    conf: Configuration,
  ) => (
    params: any,
    query: any,
  ) => Promise<
    Array<{ queryKey: string[]; queryFn: (params: any) => Promise<any> }>
  >;
};

export const isAsyncDataRoute = (r: ServerRoute): r is AsyncDataRoute =>
  "queries" in r;

export type ServerRoute = RedirectRoute | AsyncDataRoute;
