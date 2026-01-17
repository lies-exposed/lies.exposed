import { APIRESTClient } from "@ts-endpoint/react-admin";
import * as React from "react";
import { getAuthFromLocalStorage } from "../client/api.js";

/**
 * Context for the Agent API client
 * Uses the admin proxy endpoint (/api/proxy/agent)
 * The proxy handles M2M authentication with the agent service
 */
export const AgentAPIContext = React.createContext<APIRESTClient>(
  APIRESTClient({
    url: "/api/proxy/agent",
    getAuth: getAuthFromLocalStorage,
  }),
);
