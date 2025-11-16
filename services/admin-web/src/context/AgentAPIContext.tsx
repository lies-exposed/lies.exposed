import { APIRESTClient } from "@ts-endpoint/react-admin";
import * as React from "react";

/**
 * Context for the Agent API client
 * Uses the admin-web proxy endpoint (/api/proxy/agent)
 * The proxy handles M2M authentication with the agent service
 */
export const AgentAPIContext = React.createContext<APIRESTClient>(
  APIRESTClient({
    url: "/api/proxy/agent",
    // No auth needed - admin-web session cookies handle authentication
    getAuth: () => null,
  }),
);
