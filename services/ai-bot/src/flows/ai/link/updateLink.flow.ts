import { JsonOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { runRagChain } from "@liexp/backend/lib/flows/ai/runRagChain.js";
import { getStoreRetriever } from "@liexp/backend/lib/flows/ai/storeRetriever.flow.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type CreateQueueEmbeddingTypeData } from "@liexp/shared/lib/io/http/Queue/index.js";
import { formatDocumentsAsString } from "langchain/util/document";
import { loadDocs } from "../common/loadDocs.flow.js";
import { getPromptForJob } from "../prompts.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

const defaultQuestion = `
I would like to have a JSON object with 'title', 'description', 'publishDate' and main 'keywords' (as an array of strings) from the given text.
Can you do that for me?
`;

export const updateLinkFlow: JobProcessRTE<
  CreateQueueEmbeddingTypeData,
  { title: string; description: string }
> = (job) => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("docs", () => loadDocs(job)),
    fp.RTE.bind("prompt", () => fp.RTE.right(getPromptForJob(job))),
    fp.RTE.bindW("retriever", ({ docs }) => getStoreRetriever(docs)),
    fp.RTE.bind(
      "model",
      () => (ctx) =>
        fp.TE.right(
          ctx.langchain.chat.bind({
            response_format: {
              type: "json_object",
            },
          }),
        ),
    ),
    fp.RTE.chainW(({ prompt, retriever, model }) =>
      pipe(
        runRagChain<{ title: string; description: string }>(
          { context: retriever.pipe(formatDocumentsAsString) },
          PromptTemplate.fromTemplate(
            prompt({ vars: { text: "{context}", question: "{question}" } }),
          )
            .pipe(model)
            .pipe(
              new JsonOutputParser<{
                title: string;
                description: string;
                publishDate: string;
                keywords: string[];
              }>(),
            ),
          job.question ?? defaultQuestion,
        ),
      ),
    ),
  );
};
