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
import { type Endpoints } from "../../endpoints/api/index.js";

type GetHierarchyNetworkParams = EndpointParamsType<
  typeof Endpoints.Networks.Get
>;

const GetHierarchyNetwork: CustomQueryOverride<
  Endpoints,
  GetHierarchyNetworkParams,
  GetListFnParamsE<typeof Endpoints.Networks.Get>,
  EndpointDataOutputType<typeof Endpoints.Networks.Get>
> = (Q) => (p, q) =>
  pipe(
    Q.Networks.Get({
      Params: p,
      Query: { ...p, ...q },
    }),
    fp.TE.map((r) => r.data),
  );

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
  EndpointDataOutputType<typeof Endpoints.Page.Get>
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
  Endpoints,
  string,
  undefined,
  EndpointOutputType<typeof Endpoints.Story.Get>["data"]
> = (Q) => (p) => {
  return pipe(
    Q.Story.List({ Query: { ...defaultUseQueryListParams.filter, path: p } }),
    fp.TE.map((r) => r.data[0]),
  );
};

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
