import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { fromEndpoints } from "@liexp/shared/lib/providers/EndpointsRESTClient/EndpointsRESTClient.js";
import { type EndpointsRESTClient } from "@liexp/shared/lib/providers/EndpointsRESTClient/types.js";
import * as React from "react";
import { useDataProvider } from "./useDataProvider.js";

const useEndpointsRESTClient = (): EndpointsRESTClient<Endpoints> => {
  const dataProvider = useDataProvider();
  const client = React.useMemo(() => {
    return fromEndpoints(dataProvider)(Endpoints);
  }, [dataProvider]);

  return client;
};

export { useEndpointsRESTClient };
