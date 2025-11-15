import { AgentChatService } from "@liexp/backend/lib/services/agent-chat/agent-chat.service.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type CreateEventFromTextTypeData } from "@liexp/shared/lib/io/http/Queue/event/index.js";
import { toAIBotError } from "../../../common/error/index.js";
import { type ClientContext } from "../../../context.js";
import { loadDocs } from "../common/loadDocs.flow.js";
import { getEventFromJsonPrompt } from "../prompts.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

export const createEventFromTextFlow: JobProcessRTE<
  CreateEventFromTextTypeData
> = (job) => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("docs", () => loadDocs(job)),
    fp.RTE.bind(
      "jsonSchema",
      () => (ctx) =>
        pipe(
          ctx.api.Event.List({
            Query: {
              eventType: [job.data.type],
              _order: "DESC",
              _sort: "updatedAt",
            },
          }),
          fp.TE.map((events) => events.data[0]),
          fp.TE.mapLeft(toAIBotError),
        ),
    ),
    fp.RTE.bind("prompt", () => {
      if (job.prompt) {
        return fp.RTE.right(() => job.prompt!);
      }
      return fp.RTE.right(getEventFromJsonPrompt(job.type));
    }),
    fp.RTE.bind("result", ({ docs, jsonSchema, prompt }) =>
      pipe(
        AgentChatService.getStructuredOutput<ClientContext, unknown>({
          message: `${prompt({
            vars: {
              type: job.data.type,
              jsonSchema: JSON.stringify(jsonSchema),
              context: docs.map((d) => d.pageContent).join("\n"),
              question: job.data.text,
            },
          })}\n\nExtract event information from the text and return it as a JSON object following the provided schema.`,
          extractFromMarkdown: true,
        }),
        fp.RTE.mapLeft(toAIBotError),
      ),
    ),
    LoggerService.RTE.debug("`createEventFromTextFlow` result: %O"),
    fp.RTE.map(({ result }) => JSON.stringify(result)),
  );
};
