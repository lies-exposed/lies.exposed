import { type EndpointsMapType } from "@ts-endpoint/core";
import { chat } from "./chat.endpoints.js";

interface Endpoints extends EndpointsMapType {
  Chat: typeof chat;
}

const Endpoints = {
  Chat: chat,
};

export { Endpoints };
