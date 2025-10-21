import { runAgent } from "@liexp/backend/lib/flows/ai/runRagChain.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type BlockNoteDocument } from "@liexp/shared/lib/io/http/Common/BlockNoteDocument.js";
import { type CreateQueueEmbeddingTypeData } from "@liexp/shared/lib/io/http/Queue/index.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { effectToZodObject } from "@liexp/shared/lib/utils/schema.utils.js";
import { Schema } from "effect";
import { HumanMessage, SystemMessage } from "langchain";
import { loadDocs } from "../common/loadDocs.flow.js";
import { getPromptForJob } from "../prompts.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

const defaultQuestion = "Can you give me an excerpt of the given documents?";

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
    fp.RTE.bind(
      "model",
      () => (ctx) =>
        fp.TE.right(
          ctx.agent.createAgent({
            responseFormat: effectToZodObject(GroupStructuredResponse.fields),
          }),
        ),
    ),
    fp.RTE.chainW(({ prompt, docs, model }) =>
      pipe(
        runAgent<GroupStructuredResponse>(
          [
            new SystemMessage(
              prompt({
                vars: {
                  text: docs.map((d) => d.pageContent).join("\n"),
                },
              }),
            ),
            new HumanMessage(job.question ?? defaultQuestion),
          ],
          model,
        ),
      ),
    ),
    fp.RTE.map(({ description, ...group }) => ({
      ...group,
      excerpt: toInitialValue(description),
    })),
  );
};
