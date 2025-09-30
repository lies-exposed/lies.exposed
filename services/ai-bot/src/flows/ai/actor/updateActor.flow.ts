import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type CreateQueueEmbeddingTypeData } from "@liexp/shared/lib/io/http/Queue/index.js";
import { type ClientContext } from "../../../context.js";
import { getPromptForJob } from "../prompts.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

const defaultQuestion = (actorName: string) =>
  `Can you give me a summary of ${actorName}?`;

export const updateActorFlow: JobProcessRTE<
  CreateQueueEmbeddingTypeData,
  { excerpt: string }
> = (job) => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("prompt", () => fp.RTE.right(getPromptForJob(job))),
    fp.RTE.chainW(
      ({ prompt }) =>
        (ctx: ClientContext) =>
          pipe(
            ctx.agent.stream(
              {
                messages: [
                  {
                    role: "system",
                    content: prompt({
                      vars: {
                        text: "{context}",
                        question:
                          job.question ??
                          ("text" in job.data
                            ? defaultQuestion(job.data.text)
                            : "Extract the information from the text."),
                      },
                    }),
                  },
                  {
                    role: "user",
                    content:
                      job.question ??
                      ("text" in job.data
                        ? defaultQuestion(job.data.text)
                        : "Extract the information from the text."),
                  },
                ],
              },
              { configurable: { thread_id: job.id } },
            ),
          ),
    ),
    LoggerService.RTE.debug("updateActorFlow output %O"),
    fp.RTE.map((excerpt) => ({
      excerpt: "",
    })),
  );
};
