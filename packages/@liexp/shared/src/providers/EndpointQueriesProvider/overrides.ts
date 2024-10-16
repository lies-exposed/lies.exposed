import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type MinimalEndpointInstance } from "ts-endpoint";
import { type Endpoints } from "../../endpoints/index.js";
import {
  type GetDataOutputEI,
  type GetListFnParamsE,
  type GetFnParams,
} from "../EndpointsRESTClient/EndpointsRESTClient.js";
import {
  type QueryProviderOverrides,
  type CustomQueryOverride,
  type ResourceEndpointsQueriesOverride,
} from "./QueryProviderOverrides.js";
import { defaultUseQueryListParams } from "./params.js";

const GetHierarchyNetwork: CustomQueryOverride<
  Endpoints,
  GetFnParams<typeof Endpoints.Networks.Get>,
  GetListFnParamsE<typeof Endpoints.Networks.Get>,
  GetDataOutputEI<typeof Endpoints.Networks.Get>
> = (Q) => (p) => Q.Networks.get({ ...p, type: "hierarchy" });

const NetworksOverride: ResourceEndpointsQueriesOverride<
  Endpoints,
  undefined,
  undefined,
  {
    GetHierarchyNetwork: typeof GetHierarchyNetwork;
  }
> = {
  Custom: {
    GetHierarchyNetwork,
  },
};

const GetPageContentByPath: CustomQueryOverride<
  Endpoints,
  string,
  undefined,
  GetDataOutputEI<typeof Endpoints.Page.Get>
> = (Q) => (path) => {
  return pipe(
    Q.Page.getList({
      sort: { field: "createdAt", order: "DESC" },
      filter: { path },
      pagination: { perPage: 1, page: 1 },
    }),
    fp.TE.map((r) => r.data[0]),
  );
};

const GetByPath: CustomQueryOverride<
  Endpoints,
  string,
  undefined,
  GetDataOutputEI<typeof Endpoints.Story.Get>
> = (Q) => (p) =>
  pipe(
    Q.Story.getList({ ...defaultUseQueryListParams, filter: { path: p } }),
    fp.TE.map((r) => r.data[0]),
  );

const PageOverride: ResourceEndpointsQueriesOverride<
  Endpoints,
  MinimalEndpointInstance,
  MinimalEndpointInstance,
  {
    GetPageContentByPath: typeof GetPageContentByPath;
  }
> = {
  Custom: {
    GetPageContentByPath,
  },
};
const StoryOverride: ResourceEndpointsQueriesOverride<
  Endpoints,
  MinimalEndpointInstance,
  MinimalEndpointInstance,
  {
    GetByPath: typeof GetByPath;
  }
> = {
  Custom: {
    GetByPath,
  },
};

const QueryProviderCustomQueries: QueryProviderOverrides<
  Endpoints,
  {
    Networks: typeof NetworksOverride;
    Page: typeof PageOverride;
    Story: typeof StoryOverride;
  }
> = {
  Networks: NetworksOverride,
  Page: PageOverride,
  Story: StoryOverride,
};

type QueryProviderCustomQueries = typeof QueryProviderCustomQueries;

export { QueryProviderCustomQueries };
