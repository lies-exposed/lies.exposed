import { AgentChatService } from "@liexp/backend/lib/services/agent-chat/agent-chat.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  UpdateEventAgentOutput,
  type UpdateEventAgentOutput as UpdateEventAgentOutputType,
} from "@liexp/io/lib/http/Queue/event/UpdateEventQueue.js";
import { type UpdateEventTypeData } from "@liexp/io/lib/http/Queue/event/index.js";
import {
  type MergeEventExtractionResult,
  mergeEventExtraction,
} from "@liexp/shared/lib/helpers/event/mergeEventExtraction.js";
import { UPDATE_EVENT_PROMPT } from "@liexp/shared/lib/providers/openai/prompts/event.prompts.js";
import { toAIBotError } from "../../../common/error/index.js";
import { type ClientContext } from "../../../context.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

export const updateEventFlow: JobProcessRTE<
  UpdateEventTypeData,
  MergeEventExtractionResult
> = (job) => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind(
      "event",
      () => (ctx: ClientContext) =>
        pipe(
          ctx.api.Event.Get({
            Params: { id: job.id },
          }),
          fp.TE.map((r) => r.data),
          fp.TE.mapLeft(toAIBotError),
        ),
    ),
    fp.RTE.bind("prompt", () => {
      if (job.prompt) {
        return fp.RTE.right(() => job.prompt!);
      }
      return fp.RTE.right(UPDATE_EVENT_PROMPT);
    }),
    fp.RTE.bindW("output", ({ prompt }) =>
      pipe(
        AgentChatService.getStructuredOutput<
          ClientContext,
          UpdateEventAgentOutputType
        >({
          message: `${prompt({
            vars: {
              id: job.data.id,
              type: job.data.type,
            },
          })}${job.question ? `\n\n${job.question}` : ""}`,
          conversationId: null,
          model: job.model ?? undefined,
          schema: UpdateEventAgentOutput,
        }),
        fp.RTE.mapLeft(toAIBotError),
      ),
    ),
    fp.RTE.map(({ event, output }) => mergeEventExtraction(event, output)),
  );
};
