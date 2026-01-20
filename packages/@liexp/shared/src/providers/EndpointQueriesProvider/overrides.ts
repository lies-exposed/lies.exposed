import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  type EndpointOutputType,
  type EndpointParamsType,
  type MinimalEndpointInstance,
} from "@ts-endpoint/core";
import {
  type EndpointDataOutputType,
  type GetListFnParamsE,
} from "@ts-endpoint/react-admin";
import {
  type CustomQueryOverride,
  type QueryProviderOverrides,
  type ResourceEndpointsQueriesOverride,
  defaultUseQueryListParams,
} from "@ts-endpoint/tanstack-query";
import { type Endpoints as APIEndpoints } from "../../endpoints/api/index.js";

type GetHierarchyNetworkParams = EndpointParamsType<
  typeof APIEndpoints.Networks.Get
>;

const GetHierarchyNetwork: CustomQueryOverride<
  APIEndpoints,
  GetHierarchyNetworkParams,
  GetListFnParamsE<typeof APIEndpoints.Networks.Get>,
  EndpointDataOutputType<typeof APIEndpoints.Networks.Get>
> = (Q) => (p, q) =>
  pipe(
    Q.Networks.Get({
      Params: p,
      Query: { ...p, ...q },
    }),
    fp.TE.map((r) => r.data),
  );

const NetworksOverride: ResourceEndpointsQueriesOverride<
  APIEndpoints,
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
  APIEndpoints,
  string,
  undefined,
  EndpointDataOutputType<typeof APIEndpoints.Page.Get>
> = (Q) => (path) => {
  return pipe(
    Q.Page.List({
      Query: {
        _sort: "createdAt",
        _order: "DESC",
        ...defaultUseQueryListParams.filter,
        path,
      },
    }),
    fp.TE.map((r) => r.data[0]),
  );
};

const GetByPath: CustomQueryOverride<
  APIEndpoints,
  string,
  undefined,
  EndpointOutputType<typeof APIEndpoints.Story.Get>["data"]
> = (Q) => (p) => {
  return pipe(
    Q.Story.List({ Query: { ...defaultUseQueryListParams.filter, path: p } }),
    fp.TE.map((r) => r.data[0]),
  );
};

const PageOverride: ResourceEndpointsQueriesOverride<
  APIEndpoints,
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
  APIEndpoints,
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
  APIEndpoints,
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
