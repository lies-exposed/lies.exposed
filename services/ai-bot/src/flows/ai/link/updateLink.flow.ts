import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type CreateQueueEmbeddingTypeData } from "@liexp/shared/lib/io/http/Queue/index.js";
import { Schema } from "effect";
import { toAIBotError } from "../../../common/error/index.js";
import { type ClientContext } from "../../../context.js";
import { getPromptForJob } from "../prompts.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

const defaultQuestion = `Return the requested information in JSON format with fields: title (string), description (string), publishDate (string in ISO 8601 format or empty string if not published).`;

const UpdateLinkStructuredResponse = Schema.Struct({
  title: Schema.String.annotations({
    description: "The title of the link",
  }),
  description: Schema.String.annotations({
    description: "The description of the link",
  }),
  publishDate: Schema.String.annotations({
    description:
      "The date the content was published in ISO 8601 format (empty string if not published)",
  }),
});
type UpdateLinkStructuredResponse = typeof UpdateLinkStructuredResponse.Type;

export const updateLinkFlow: JobProcessRTE<
  CreateQueueEmbeddingTypeData,
  { title: string; description: string }
> = (job) => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("prompt", () => fp.RTE.right(getPromptForJob(job))),
    fp.RTE.chainW(
      ({ prompt }) =>
        (ctx: ClientContext) =>
          pipe(
            ctx.agent.Chat.Create({
              Body: {
                message: `${prompt({
                  vars: {
                    text: (job.data as any).url,
                  },
                })}\n\n${job.question ?? defaultQuestion}`,
                conversation_id: null,
              },
            }),
            fp.TE.chainEitherK((response) => {
              const message = response.data.message;
              ctx.logger.debug.log("updateLinkFlow message: %O", {
                role: message.role,
                hasStructuredOutput: !!message.structured_output,
                content: message.content.substring(0, 100),
              });

              // Use structured_output from agent response
              if (message.structured_output) {
                return fp.E.right(
                  message.structured_output as UpdateLinkStructuredResponse,
                );
              }

              // Fallback: parse content as JSON
              try {
                const parsed = JSON.parse(message.content);
                ctx.logger.debug.log("updateLinkFlow parsed from content");
                return fp.E.right(parsed as UpdateLinkStructuredResponse);
              } catch (e) {
                return fp.E.left(
                  new Error(
                    `Agent response missing structured_output and content is not valid JSON: ${e}`,
                  ),
                );
              }
            }),
            fp.TE.mapLeft(toAIBotError),
          ),
    ),
    LoggerService.RTE.debug("Messages %O"),
  );
};
