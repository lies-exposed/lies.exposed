import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import {
  CreateQueryProvider,
  QueryProviderCustomQueries,
  type EndpointsQueryProvider,
} from "@liexp/shared/lib/providers/EndpointQueriesProvider/index.js";
import { fromEndpoints } from "@liexp/shared/lib/providers/EndpointsRESTClient/EndpointsRESTClient.js";
import React from "react";
import { useDataProvider } from "./useDataProvider.js";

const useEndpointQueries = (): EndpointsQueryProvider => {
  const dataProvider = useDataProvider();
  const queries = React.useMemo(() => {
    const queries = fromEndpoints(dataProvider)(Endpoints);
    return CreateQueryProvider(
      queries,
      QueryProviderCustomQueries,
    ) as EndpointsQueryProvider;
  }, [dataProvider]);

  return queries;
};

export { useEndpointQueries };
