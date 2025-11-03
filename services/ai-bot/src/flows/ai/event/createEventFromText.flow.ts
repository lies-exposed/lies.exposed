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
      () => (ctx: ClientContext) =>
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
    fp.RTE.chainW(({ docs, jsonSchema, prompt }) => (ctx: ClientContext) =>
      pipe(
        ctx.agent.Chat.Create({
          Body: {
            message: `${prompt({
              vars: {
                type: job.data.type,
                jsonSchema: JSON.stringify(jsonSchema),
                context: docs.map((d) => d.pageContent).join("\n"),
                question: job.data.text,
              },
            })}\n\nExtract event information from the text and return it as a JSON object following the provided schema.`,
            conversation_id: null,
          },
        }),
        fp.TE.chainEitherK((response) => {
          const content = response.data.message.content;
          ctx.logger.debug.log("createEventFromTextFlow raw output: %s", content);

          // Extract JSON from markdown code blocks if present
          const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                           content.match(/```\s*([\s\S]*?)\s*```/);
          const jsonStr = jsonMatch ? jsonMatch[1] : content;

          try {
            const parsed = JSON.parse(jsonStr);
            ctx.logger.debug.log("createEventFromTextFlow parsed output %O", parsed);
            return fp.E.right(JSON.stringify(parsed));
          } catch (e) {
            return fp.E.left(new Error(`Failed to parse JSON response: ${e}`));
          }
        }),
        fp.TE.mapLeft(toAIBotError),
      ),
    ),
    LoggerService.RTE.debug("`createEventFromTextFlow` result: %O"),
  );
};
