import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { runRagChainStream } from "@liexp/backend/lib/flows/ai/runRagChain.js";
import { getStoreRetriever } from "@liexp/backend/lib/flows/ai/storeRetriever.flow.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type CreateQueueEmbeddingTypeData } from "@liexp/shared/lib/io/http/Queue/index.js";
import { formatDocumentsAsString } from "langchain/util/document";
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
    fp.RTE.bindW("retriever", ({ docs }) => getStoreRetriever(docs)),
    fp.RTE.bind(
      "model",
      () => (ctx) => fp.TE.right(ctx.langchain.chat.bind({})),
    ),
    fp.RTE.chainW(({ prompt, retriever, model }) =>
      pipe(
        runRagChainStream(
          {
            context: retriever.pipe(formatDocumentsAsString),
          },
          new PromptTemplate({
            template: prompt({
              vars: { text: "{context}", question: "{question}" },
            }),
            inputVariables: ["context", "question"],
          })
            .pipe(model)
            .pipe(new StringOutputParser()),
          job.question ?? defaultQuestion,
        ),
      ),
    ),
    fp.RTE.map((excerpt) => ({
      excerpt: excerpt,
    })),
  );
};
