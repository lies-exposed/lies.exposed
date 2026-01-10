import { Endpoints } from "@liexp/shared/lib/endpoints/agent/index.js";
import { EffectDecoder } from "@liexp/shared/lib/endpoints/helpers.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { type API, GetResourceClient } from "@ts-endpoint/resource-client";
import * as React from "react";
import { useAgentDataProvider } from "./useAgentDataProvider.js";

/**
 * Provide context with @ts-endpoint/resource-client for Agent API
 * Uses the admin-web proxy endpoint (/api/proxy/agent)
 * The proxy handles M2M authentication with the agent service
 */
export const useAgentAPI = (): API<Endpoints> => {
  const dataProvider = useAgentDataProvider();
  return React.useMemo(() => {
    return GetResourceClient(dataProvider.client, Endpoints, {
      decode: EffectDecoder((e) => DecodeError.of("Agent API decode error", e)),
    });
  }, [dataProvider]);
};
