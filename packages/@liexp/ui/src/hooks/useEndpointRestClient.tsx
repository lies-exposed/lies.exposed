import { EffectDecoder } from "@liexp/shared/lib/endpoints/helpers.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import {
  type EndpointsRESTClient,
  RAEndpointsClient,
} from "@ts-endpoint/react-admin";
import * as React from "react";
import { useDataProvider } from "./useDataProvider.js";

const useEndpointsRESTClient = (): EndpointsRESTClient<Endpoints> => {
  const dataProvider = useDataProvider();
  const client = React.useMemo(() => {
    return RAEndpointsClient(dataProvider, {
      decode: EffectDecoder((e) => DecodeError.of("APIError", e)),
    })(Endpoints);
  }, [dataProvider]);

  return client;
};

export { useEndpointsRESTClient };
