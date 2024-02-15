import {
  CreateQueryProvider,
  QueryProviderCustomQueries,
  type EndpointsQueryProvider,
} from "@liexp/shared/lib/providers/EndpointQueriesProvider/index.js";
import React from "react";
import { useEndpointsRESTClient } from "./useEndpointRestClient.js";

const useEndpointQueries = (): EndpointsQueryProvider => {
  const client = useEndpointsRESTClient();
  const queries = React.useMemo(() => {
    return CreateQueryProvider(
      client,
      QueryProviderCustomQueries,
    ) as EndpointsQueryProvider;
  }, [client]);

  return queries;
};

export { useEndpointQueries };
