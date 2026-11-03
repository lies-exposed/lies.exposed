import { makeAgentClient } from "@liexp/backend/lib/clients/agent.http.client.js";
import { findUserOrReplyFlow } from "@liexp/backend/lib/flows/tg/findUserOrReply.flow.js";
import { GetJWTProvider } from "@liexp/backend/lib/providers/jwt/jwt.provider.js";
import { type TGBotProvider } from "@liexp/backend/lib/providers/tg/tg.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type ChatResponse } from "@liexp/io/lib/http/Chat.js";
import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { AdminRead } from "@liexp/io/lib/http/auth/permissions/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { type Message } from "node-telegram-bot-api";
import { type WorkerContext } from "#context/context.js";
import { toWorkerError } from "#io/worker.error.js";

const WORKER_SERVICE_CLIENT_ID = "00000000-0000-0000-0000-000000000011" as UUID;
const WORKER_SERVICE_USER_ID = "00000000-0000-0000-0000-000000000012" as UUID;

export const askCommand = (ctx: WorkerContext): TGBotProvider => {
  const jwt = GetJWTProvider({
    secret: ctx.env.JWT_SECRET,
    logger: ctx.logger,
  });

  const agentClient = makeAgentClient({
    baseURL: ctx.env.AGENT_API_URL,
    jwt,
    logger: ctx.logger,
    getPayload: () => ({
      id: WORKER_SERVICE_CLIENT_ID,
      userId: WORKER_SERVICE_USER_ID,
      permissions: [AdminRead.literals[0]],
    }),
  });

  ctx.tg.onText(/\/ask\s(.+)/, (msg: Message, match) => {
    if (!match || match[1] === "") {
      return;
    }

    const question = match[1].trim();

    ctx.logger.debug.log("Ask command: %s", question);

    void pipe(
      findUserOrReplyFlow(ctx)(() =>
        pipe(
          agentClient.Chat.Create({
            Body: { message: question, conversation_id: null },
          }),
          fp.TE.mapLeft(toWorkerError),
          fp.TE.chain((response) => {
            const { data } = response as { data: ChatResponse };
            return pipe(
              ctx.tg.post(data.message.content, msg.message_id),
              fp.TE.mapLeft((e) => toWorkerError(e)),
              fp.TE.map(() => undefined),
            );
          }),
          fp.TE.map(() => undefined),
        ),
      )(msg.chat.id, msg.from?.id),
      throwTE,
    ).catch((e) => {
      ctx.logger.error.log("Error in /ask command: %O", e);
      void pipe(
        ctx.tg.post(
          "Sorry, something went wrong while processing your question. Please try again later.",
          msg.message_id,
        ),
        throwTE,
      ).catch(() => {
        /* silently ignore failure to send error reply */
      });
    });
  });

  return ctx.tg;
};
