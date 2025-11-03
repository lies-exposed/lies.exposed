import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type BlockNoteDocument } from "@liexp/shared/lib/io/http/Common/BlockNoteDocument.js";
import { type CreateQueueEmbeddingTypeData } from "@liexp/shared/lib/io/http/Queue/index.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { Schema } from "effect";
import { toAIBotError } from "../../../common/error/index.js";
import { type ClientContext } from "../../../context.js";
import { loadDocs } from "../common/loadDocs.flow.js";
import { getPromptForJob } from "../prompts.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

const defaultQuestion =
  "Can you give me an excerpt of the given documents? Return the response in JSON format with fields: name (string), description (string).";

const GroupStructuredResponse = Schema.Struct({
  name: Schema.String,
  description: Schema.String,
});

type GroupStructuredResponse = typeof GroupStructuredResponse.Type;

export const updateGroupFlow: JobProcessRTE<
  CreateQueueEmbeddingTypeData,
  { excerpt: BlockNoteDocument }
> = (job) => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("docs", () => loadDocs(job)),
    fp.RTE.bind("prompt", () => fp.RTE.right(getPromptForJob(job))),
    fp.RTE.chainW(
      ({ prompt, docs }) =>
        (ctx: ClientContext) =>
          pipe(
            ctx.agent.Chat.Create({
              Body: {
                message: `${prompt({
                  vars: {
                    text: docs.map((d) => d.pageContent).join("\n"),
                  },
                })}\n\n${job.question ?? defaultQuestion}`,
                conversation_id: null,
              },
            }),
            fp.TE.chainEitherK((response) => {
              const message = response.data.message;
              ctx.logger.debug.log("updateGroupFlow message: %O", {
                role: message.role,
                hasStructuredOutput: !!message.structured_output,
                content: message.content.substring(0, 100),
              });

              // Use structured_output from agent response
              if (message.structured_output) {
                return fp.E.right(
                  message.structured_output as GroupStructuredResponse,
                );
              }

              // Fallback: parse content as JSON
              try {
                const parsed = JSON.parse(message.content);
                ctx.logger.debug.log("updateGroupFlow parsed from content");
                return fp.E.right(parsed as GroupStructuredResponse);
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
    fp.RTE.map(({ description, ...group }) => ({
      ...group,
      excerpt: toInitialValue(description),
    })),
  );
};
