import { type EndpointsMapType } from "@ts-endpoint/core";
import { chat } from "./chat.endpoints.js";

interface AgentEndpoints extends EndpointsMapType {
  Chat: typeof chat;
}

const AgentEndpoints = {
  Chat: chat,
};

export { AgentEndpoints };
