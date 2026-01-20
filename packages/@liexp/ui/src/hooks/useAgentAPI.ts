import { DecodeError } from "@liexp/io/lib/http/Error/DecodeError.js";
import { AgentEndpoints } from "@liexp/shared/lib/endpoints/agent/index.js";
import { EffectDecoder } from "@liexp/shared/lib/endpoints/helpers.js";
import { type API, GetResourceClient } from "@ts-endpoint/resource-client";
import * as React from "react";
import { useAgentDataProvider } from "./useAgentDataProvider.js";

/**
 * Provide context with @ts-endpoint/resource-client for Agent API
 * Uses the admin proxy endpoint (/api/proxy/agent)
 * The proxy handles M2M authentication with the agent service
 */
export const useAgentAPI = (): API<AgentEndpoints> => {
  const dataProvider = useAgentDataProvider();
  return React.useMemo(() => {
    return GetResourceClient(dataProvider.client, AgentEndpoints, {
      decode: EffectDecoder((e) => DecodeError.of("Agent API decode error", e)),
    });
  }, [dataProvider]);
};
