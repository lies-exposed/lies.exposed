import express from "express";
import {
  MakeSendChatMessageRoute,
  MakeListChatConversationsRoute,
  MakeGetChatConversationRoute,
  MakeDeleteChatConversationRoute,
} from "./chat/chat.controller.js";
import { type AgentContext } from "#context/context.type.js";

export const createRoutes = (ctx: AgentContext) => {
  const router = express.Router();

  // Chat routes
  MakeSendChatMessageRoute(router, ctx);
  MakeListChatConversationsRoute(router, ctx);
  MakeGetChatConversationRoute(router, ctx);
  MakeDeleteChatConversationRoute(router, ctx);

  // Health check
  router.get("/healthcheck", (_req, res) => {
    res.json({ status: "ok", service: "agent" });
  });

  return router;
};
