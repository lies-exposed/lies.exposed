import { EffectDecoder } from "@liexp/shared/lib/endpoints/helpers.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { type API, GetResourceClient } from "@ts-endpoint/resource-client";
import * as React from "react";
import { useDataProvider } from "./useDataProvider.js";

/**
 * Provide context with @ts-endpoint/resource-client
 *
 *
 */
export const useAPI = (): API<Endpoints> => {
  const dataProvider = useDataProvider();
  return React.useMemo(() => {
    return GetResourceClient(dataProvider.client, Endpoints, {
      decode: EffectDecoder((e) =>
        DecodeError.of("Resource client decode error", e),
      ),
    });
  }, []);
};
