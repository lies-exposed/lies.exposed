import { Endpoints } from "@liexp/shared/lib/endpoints/agent/index.js";
import { EffectDecoder } from "@liexp/shared/lib/endpoints/helpers.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { GetResourceClient } from "@ts-endpoint/resource-client";
import {
  makeAuthAxiosClient,
  type AuthAxiosClientConfig,
} from "./authAxios.client.js";

export type AgentClientConfig = Omit<AuthAxiosClientConfig, "signAs">;

/**
 * Create an HTTP client for calling agent service endpoints
 * Uses GetResourceClient with agent endpoints for type-safe API calls
 * Authentication is handled via makeAuthAxiosClient with 'client' mode for M2M
 */
export const makeAgentClient = (config: AgentClientConfig) => {
  const client = makeAuthAxiosClient({
    ...config,
    signAs: "client",
  });

  return GetResourceClient(client, Endpoints, {
    decode: EffectDecoder((e) =>
      DecodeError.of("Agent client decode error", e),
    ),
  });
};
