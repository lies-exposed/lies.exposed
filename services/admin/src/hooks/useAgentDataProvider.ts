import { type APIRESTClient } from "@ts-endpoint/react-admin";
import { useContext } from "react";
import { AgentAPIContext } from "../context/AgentAPIContext.js";

/**
 * Provide context with @ts-endpoint/react-admin client for Agent API
 * Uses the admin-web proxy to communicate with the agent service
 */
export const useAgentDataProvider = (): APIRESTClient => {
  const dataProvider = useContext(AgentAPIContext);
  return dataProvider;
};
