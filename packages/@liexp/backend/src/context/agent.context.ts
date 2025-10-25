import { type AgentProvider } from "../providers/ai/agent.provider.js";

export interface AgentContext {
  /**
   * Agent provider
   *
   * @description This is the provider that will be used to interact with the agent.
   */
  agent: AgentProvider;
}
