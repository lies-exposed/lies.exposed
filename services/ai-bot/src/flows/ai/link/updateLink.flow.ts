import { runAgent } from "@liexp/backend/lib/flows/ai/runRagChain.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type CreateQueueEmbeddingTypeData } from "@liexp/shared/lib/io/http/Queue/index.js";
import { createAgent, HumanMessage, SystemMessage } from "langchain";
import { z } from "zod";
import { type ClientContext } from "../../../context.js";
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
    fp.RTE.bind("prompt", () => fp.RTE.right(getPromptForJob(job))),
    fp.RTE.bind("model", () => (ctx: ClientContext) => {
      return fp.TE.right(
        ctx.langchain.chat.withConfig({
          response_format: {
            type: "json_object",
          },
        }),
      );
    }),
    fp.RTE.chainW(({ prompt, model }) =>
      pipe(
        runAgent<{ title: string; description: string }>(
          [
            new SystemMessage(
              prompt({ vars: { text: "{context}", question: "{question}" } }),
            ),
            new HumanMessage(job.question ?? defaultQuestion),
          ],
          createAgent({
            model,
            responseFormat: z.object({
              title: z.string(),
              description: z.string(),
              publishDate: z.string(),
              keywords: z.array(z.string()),
            }),
          }),
        ),
      ),
    ),
  );
};
