import { makeAgentClient } from "@liexp/backend/lib/clients/agent.http.client.js";
import { GetJWTProvider } from "@liexp/backend/lib/providers/jwt/jwt.provider.js";
import { type TGBotProvider } from "@liexp/backend/lib/providers/tg/tg.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type ChatResponse } from "@liexp/io/lib/http/Chat.js";
import { AdminRead } from "@liexp/io/lib/http/auth/permissions/index.js";
import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { type WorkerContext } from "#context/context.js";
import { toWorkerError } from "#io/worker.error.js";

const WORKER_SERVICE_CLIENT_ID =
  "00000000-0000-0000-0000-000000000011" as UUID;
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

  ctx.tg.api.onText(/\/ask\s(.+)/, (msg, match) => {
    if (!match || match[1] === "") {
      return;
    }

    const question = match[1].trim();

    ctx.logger.debug.log("Ask command: %s", question);

    void pipe(
      agentClient.Chat.Create({
        Body: { message: question, conversation_id: null },
      }),
      fp.TE.mapLeft(toWorkerError),
      fp.TE.chain((response) => {
        const { data } = response as { data: ChatResponse };
        return fp.TE.tryCatch(
          () =>
            ctx.tg.api.sendMessage(
              msg.chat.id,
              data.message.content,
              { reply_to_message_id: msg.message_id },
            ),
          toWorkerError,
        );
      }),
      throwTE,
    ).catch((e) => {
      ctx.logger.error.log("Error in /ask command: %O", e);
      void ctx.tg.api.sendMessage(
        msg.chat.id,
        "Sorry, something went wrong while processing your question. Please try again later.",
        { reply_to_message_id: msg.message_id },
      );
    });
  });

  return ctx.tg;
};
