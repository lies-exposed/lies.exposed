import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { runRagChainStream } from "@liexp/backend/lib/flows/ai/runRagChain.js";
import { getStoreRetriever } from "@liexp/backend/lib/flows/ai/storeRetriever.flow.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type CreateQueueEmbeddingTypeData } from "@liexp/shared/lib/io/http/Queue/index.js";
import { formatDocumentsAsString } from "langchain/util/document";
import { type ClientContext } from "../../../context.js";
import { loadLinkWithPuppeteer } from "../common/loadLinkWithPuppeteer.flow.js";
import { getPromptForJob } from "../prompts.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

const defaultQuestion = (actorName: string) =>
  `Can you give me a summary of ${actorName} using the provided text?`;

export const updateActorFlow: JobProcessRTE<
  CreateQueueEmbeddingTypeData,
  { excerpt: string }
> = (job) => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("links", () =>
      pipe(
        fp.RTE.asks((ctx: ClientContext) => ctx),
        fp.RTE.chainTaskEitherK((ctx) =>
          pipe(
            ctx.api.Event.List({ Query: { actors: [job.id] } }),
            fp.TE.chain((events) =>
              ctx.api.Link.List({
                Query: { ids: events.data.flatMap((e) => e.links) },
              }),
            ),
            fp.TE.map((links) => links.data),
          ),
        ),
      ),
    ),
    fp.RTE.bind("docs", ({ links }) =>
      pipe(
        links,
        fp.A.traverse(fp.RTE.ApplicativePar)((l) =>
          loadLinkWithPuppeteer(l.url),
        ),
        fp.RTE.map(fp.A.flatten),
        fp.RTE.map((docs) => [...docs]),
      ),
    ),
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
          PromptTemplate.fromTemplate(
            prompt({
              vars: { text: "{context}", question: "{question}" },
            }),
          )
            .pipe(model)
            .pipe(new StringOutputParser()),
          job.question ??
            ("text" in job.data
              ? defaultQuestion(job.data.text)
              : "Extract the information from the text."),
        ),
      ),
    ),
    LoggerService.RTE.debug("updateActorFlow output %O"),
    fp.RTE.map((excerpt) => ({
      excerpt,
    })),
  );
};
