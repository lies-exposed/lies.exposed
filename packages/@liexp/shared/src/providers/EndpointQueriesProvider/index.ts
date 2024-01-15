import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Endpoints } from "../../endpoints/index.js";
import { type EndpointsRESTClient } from "../EndpointsRESTClient/EndpointsRESTClient.js";
import { toQueries } from "./QueryProvider.js";
import {
  toOverrideQueries,
  type CustomQueryOverride,
  type QueryProviderOverrides,
  type ResourceEndpointsQueriesOverride,
} from "./QueryProviderOverrides.js";
import { type QueryProviderCustomQueries } from "./overrides.js";
import {
  type GetQueryProviderImplAt,
  type QueryProvider,
  type ResourceQuery,
} from "./types.js";
export { QueryProviderCustomQueries } from "./overrides.js";

type PatchedQueryProvider<
  ES,
  O extends Record<string, any>,
> = QueryProvider<ES> & {
  [K in keyof QueryProviderOverrides<ES, O>]: QueryProviderOverrides<
    ES,
    O
  >[K] extends ResourceEndpointsQueriesOverride<ES, any, any, infer CC>
    ? {
        Custom: {
          [KK in keyof CC]: CC[KK] extends CustomQueryOverride<
            ES,
            infer P,
            infer Q,
            infer O
          >
            ? ResourceQuery<P, Q, O>
            : GetQueryProviderImplAt<ES, K, KK>;
        };
      }
    : GetQueryProviderImplAt<ES, K>;
};

const CreateQueryProvider = <ES, O extends Record<string, any>>(
  apiRESTClient: EndpointsRESTClient<ES>,
  overrides?: QueryProviderOverrides<ES, O>,
): PatchedQueryProvider<ES, O> => {
  const queryProvider = pipe(
    apiRESTClient,
    fp.R.toArray,
    fp.A.reduce({}, (q, [k, e]) => {
      const override = overrides?.[k] ?? undefined;
      return {
        ...q,
        [k]: toQueries(k, e, override),
      };
    }),
  ) as QueryProvider<ES>;

  let queryProviderOverrides: any = {};
  if (overrides) {
    queryProviderOverrides = pipe(
      overrides,
      fp.R.toArray,
      fp.A.reduce({}, (q, [k, e]) => {
        return {
          ...q,
          [k]: toOverrideQueries(apiRESTClient, k, e),
        };
      }),
    );
  }

  const patchedQueryProvider = pipe(
    queryProvider,
    fp.R.toArray,
    fp.A.reduce({}, (q, [k, e]) => {
      const def = queryProviderOverrides[k];
      if (def) {
        const { Custom, ...rest } = queryProviderOverrides[k];
        return {
          ...q,
          [k]: {
            get: rest.get ?? e.get,
            list: rest.list ?? e.list,
            Custom: {
              ...e.Custom,
              ...Custom,
            },
          },
        };
      }
      return { ...q, [k]: e };
    }),
  ) as PatchedQueryProvider<ES, O>;

  return patchedQueryProvider;
};

type EndpointsQueryProvider = PatchedQueryProvider<
  Endpoints,
  QueryProviderCustomQueries
>;

export { CreateQueryProvider, type EndpointsQueryProvider, type QueryProvider };
