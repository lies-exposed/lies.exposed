import { runAgent } from "@liexp/backend/lib/flows/ai/runRagChain.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type CreateQueueEmbeddingTypeData } from "@liexp/shared/lib/io/http/Queue/index.js";
import { HumanMessage, SystemMessage } from "langchain";
import { loadDocs } from "../common/loadDocs.flow.js";
import { getPromptForJob } from "../prompts.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

const defaultQuestion = "Can you give me an excerpt of the given documents?";

export const updateGroupFlow: JobProcessRTE<
  CreateQueueEmbeddingTypeData,
  { excerpt: string }
> = (job) => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("docs", () => loadDocs(job)),
    fp.RTE.bind("prompt", () => fp.RTE.right(getPromptForJob(job))),
    fp.RTE.bind("model", () => (ctx) => fp.TE.right(ctx.langchain.agent)),
    fp.RTE.chainW(({ prompt, docs, model }) =>
      pipe(
        runAgent(
          [
            new SystemMessage(
              prompt({
                vars: {
                  text: docs.map((d) => d.pageContent).join("\n"),
                  question: "{question}",
                },
              }),
            ),
            new HumanMessage(job.question ?? defaultQuestion),
          ],
          model,
        ),
      ),
    ),
    fp.RTE.map((excerpt) => ({
      excerpt: excerpt,
    })),
  );
};
