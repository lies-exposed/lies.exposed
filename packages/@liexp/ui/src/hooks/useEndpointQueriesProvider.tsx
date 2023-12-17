import { Endpoints } from "@liexp/shared/lib/endpoints";
import React from "react";
import {
  CreateQueryProvider,
  QueryProviderCustomQueries,
  type EndpointsQueryProvider,
} from "../providers/EndpointQueriesProvider";
import { fromEndpoints } from "../providers/EndpointsRESTClient/EndpointsRESTClient";
import { useDataProvider } from "./useDataProvider";

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
