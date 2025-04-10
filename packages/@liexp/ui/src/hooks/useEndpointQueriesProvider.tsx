import { type Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { QueryProviderCustomQueries } from "@liexp/shared/lib/providers/EndpointQueriesProvider/overrides.js";
import {
  CreateQueryProvider,
  type EndpointsQueryProvider,
} from "@ts-endpoint/tanstack-query";
import * as React from "react";
import { useAPI } from "./useAPI.js";

const useEndpointQueries = (): EndpointsQueryProvider<
  Endpoints,
  QueryProviderCustomQueries
> => {
  const client = useAPI();
  const queries = React.useMemo(() => {
    return CreateQueryProvider(client, QueryProviderCustomQueries);
  }, [client]);

  return queries;
};

export { useEndpointQueries };
