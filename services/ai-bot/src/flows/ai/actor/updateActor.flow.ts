import { AgentChatService } from "@liexp/backend/lib/services/agent-chat/agent-chat.service.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type BlockNoteDocument } from "@liexp/io/lib/http/Common/BlockNoteDocument.js";
import {
  CreateQueueTextData,
  type CreateQueueEmbeddingTypeData,
} from "@liexp/io/lib/http/Queue/index.js";
import { getTextContents } from "@liexp/shared/lib/providers/blocknote/getTextContents.js";
import { isValidValue } from "@liexp/shared/lib/providers/blocknote/isValidValue.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { Schema } from "effect";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { toAIBotError } from "../../../common/error/index.js";
import { type ClientContext } from "../../../context.js";
import { parseISODate } from "../entityMatching.js";
import { getPromptForJob } from "../prompts.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

const defaultQuestion =
  "Verify the information with the searchWeb tool and return the requested JSON object. Only include facts confirmed by the sources you list.";

const ActorStructuredResponse = Schema.Struct({
  firstName: Schema.String,
  lastName: Schema.String,
  username: Schema.String.annotations({
    description:
      "The user's unique username (in the lowercase format of <firstName-lastName>)",
  }),
  description: Schema.String.annotations({
    description: "Factual biography, max 200 words, plain text",
  }),
  bornOn: Schema.NullOr(Schema.String).annotations({
    description:
      "Birth date in ISO format (YYYY-MM-DD) confirmed by a source, otherwise null",
  }),
  diedOn: Schema.NullOr(Schema.String).annotations({
    description:
      "Death date in ISO format (YYYY-MM-DD) confirmed by a source, null if alive or unknown",
  }),
  keywords: Schema.Array(Schema.String),
  sources: Schema.Array(Schema.String).annotations({
    description: "URLs of the sources used to verify the information",
  }),
}).annotations({ description: "Actor information in a structured format" });

type ActorStructuredResponse = typeof ActorStructuredResponse.Type;

interface ActorSubject {
  id: string;
  fullName: string | null;
  currentDescription: string;
}

/**
 * Resolves who the job is about. The queue job id is the actor id, so we
 * fetch the actor to get an unambiguous full name; `job.data.text` (the
 * current excerpt, or the name when there is none) is only extra context.
 */
const getActorSubject =
  (jobId: string, text: string) =>
  (ctx: ClientContext): TaskEither<never, ActorSubject> =>
    pipe(
      ctx.api.Actor.Get({ Params: { id: jobId } }),
      fp.TE.map((r): ActorSubject => ({
        id: r.data.id,
        fullName: r.data.fullName,
        currentDescription:
          r.data.excerpt && isValidValue(r.data.excerpt)
            ? getTextContents(r.data.excerpt)
            : "",
      })),
      fp.TE.orElse((e) => {
        ctx.logger.warn.log(
          "updateActorFlow: cannot fetch actor %s (%s), using job text only",
          jobId,
          e.message,
        );
        return fp.TE.right<never, ActorSubject>({
          id: jobId,
          fullName: null,
          currentDescription: text,
        });
      }),
    );

const describeSubject = (subject: ActorSubject): string =>
  [
    subject.fullName ? `Full name: ${subject.fullName}` : null,
    `Platform id: ${subject.id}`,
    subject.currentDescription
      ? `Current description on the platform (may be incomplete or wrong, verify it):\n${subject.currentDescription}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

export const updateActorFlow: JobProcessRTE<
  CreateQueueEmbeddingTypeData,
  Omit<ActorStructuredResponse, "description" | "bornOn" | "diedOn"> & {
    excerpt: BlockNoteDocument;
    bornOn: string | null;
    diedOn: string | null;
  }
> = (job) => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("text", () =>
      pipe(
        fp.RTE.fromEither(
          Schema.decodeUnknownEither(CreateQueueTextData)(job.data),
        ),
        fp.RTE.mapLeft(toAIBotError),
        fp.RTE.map((data) => data.text),
      ),
    ),
    fp.RTE.bindW("subject", ({ text }) => getActorSubject(job.id, text)),
    fp.RTE.bind("prompt", () => fp.RTE.right(getPromptForJob(job))),
    fp.RTE.bind("result", ({ prompt, subject }) =>
      pipe(
        AgentChatService.getStructuredOutput<
          ClientContext,
          ActorStructuredResponse
        >({
          message: `${prompt({
            vars: {
              text: describeSubject(subject),
            },
          })}\n\n${job.question ?? defaultQuestion}`,
          conversationId: null,
          model: job.model ?? undefined,
          // researcher agent has searchWeb + scrapeWebPage for verification
          agentType: "researcher",
          schema: ActorStructuredResponse,
        }),
        fp.RTE.mapLeft(toAIBotError),
      ),
    ),
    LoggerService.RTE.debug("updateActorFlow output %O"),
    fp.RTE.map(({ result }) => {
      // Without at least one source the dates are unverified: drop them.
      const verified = result.sources.length > 0;
      return {
        excerpt: toInitialValue(result.description),
        firstName: result.firstName,
        lastName: result.lastName,
        username: result.username,
        bornOn: verified ? parseISODate(result.bornOn) : null,
        diedOn: verified ? parseISODate(result.diedOn) : null,
        keywords: result.keywords,
        sources: result.sources,
      };
    }),
  );
};
