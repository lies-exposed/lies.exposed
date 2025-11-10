import { AgentChatService } from "@liexp/backend/lib/services/agent-chat/agent-chat.service.js";
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
    fp.RTE.bind("result", ({ prompt, docs }) =>
      pipe(
        AgentChatService.getStructuredOutput<
          ClientContext,
          GroupStructuredResponse
        >({
          message: `${prompt({
            vars: {
              text: docs.map((d) => d.pageContent).join("\n"),
            },
          })}\n\n${job.question ?? defaultQuestion}`,
        }),
        fp.RTE.mapLeft(toAIBotError),
      ),
    ),
    fp.RTE.map(({ result }) => ({
      name: result.name,
      excerpt: toInitialValue(result.description),
    })),
  );
};
