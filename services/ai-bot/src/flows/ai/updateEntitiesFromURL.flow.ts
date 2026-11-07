import { AgentChatService } from "@liexp/backend/lib/services/agent-chat/agent-chat.service.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { EditActorBody } from "@liexp/io/lib/http/Actor.js";
import { EditGroupBody } from "@liexp/io/lib/http/Group.js";
import { type UpdateEntitiesFromURLTypeData } from "@liexp/io/lib/http/Queue/index.js";
import { getTextContents } from "@liexp/shared/lib/providers/blocknote/getTextContents.js";
import { isValidValue } from "@liexp/shared/lib/providers/blocknote/isValidValue.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { Schema } from "effect";
import { toAIBotError } from "../../common/error/index.js";
import { type ClientContext } from "../../context.js";
import { type ClientContextRTE } from "../../types.js";
import { parseISODate, pickExactMatch } from "./entityMatching.js";
import { fetchURLContent, type PageContent } from "./pageContent.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

// --- Structured AI response schemas (all properties required for OpenAI structured output) ---

const ActorInfoSchema = Schema.Struct({
  fullName: Schema.String.annotations({
    description: "Full name of the actor (e.g. 'Barack Obama')",
  }),
  firstName: Schema.String.annotations({
    description: "First name of the actor",
  }),
  lastName: Schema.String.annotations({
    description: "Last name of the actor",
  }),
  description: Schema.String.annotations({
    description:
      "A short biography or description of the actor based on the source",
  }),
  bornOn: Schema.NullOr(Schema.String).annotations({
    description:
      "Birth date in ISO format (YYYY-MM-DD) ONLY if explicitly stated in the source, otherwise null",
  }),
  diedOn: Schema.NullOr(Schema.String).annotations({
    description:
      "Death date in ISO format (YYYY-MM-DD) ONLY if explicitly stated in the source, otherwise null",
  }),
  keywords: Schema.Array(Schema.String).annotations({
    description: "Relevant keywords describing the actor",
  }),
});

const GroupInfoSchema = Schema.Struct({
  name: Schema.String.annotations({
    description: "Official name of the group or organization",
  }),
  description: Schema.String.annotations({
    description: "A short description of the group based on the source",
  }),
});

const ExtractedEntitiesSchema = Schema.Struct({
  actors: Schema.Array(ActorInfoSchema).annotations({
    description:
      "List of individual people mentioned in the source content. Empty array if none.",
  }),
  groups: Schema.Array(GroupInfoSchema).annotations({
    description:
      "List of organizations, companies, or collective entities mentioned. Empty array if none.",
  }),
}).annotations({
  description:
    "Actors and groups mentioned in the given URL/content along with information extracted about them.",
});

type ActorInfoSchema = typeof ActorInfoSchema.Type;
type GroupInfoSchema = typeof GroupInfoSchema.Type;
type ExtractedEntitiesSchema = typeof ExtractedEntitiesSchema.Type;

// --- Result type ---

interface UpdateEntitiesFromURLResult {
  updatedActors: string[];
  updatedGroups: string[];
  unmatchedActors: string[];
  unmatchedGroups: string[];
}

// --- Per-entity update helpers ---
//
// Safety rules (a previous version corrupted prod data by editing the first
// fuzzy-search hit and overwriting its excerpt with article-scoped text):
// - only an unambiguous, normalized exact name match is updated
// - only EMPTY fields are filled; existing curated data is never overwritten
// - the entity name is never changed

/**
 * Edit bodies use `OptionFromUndefinedOr` for every field ("undefined = keep
 * current"), so the encoded payload must list every key. Start from all
 * `undefined` and set only the fields we want to fill.
 */
const keepAllFields = <F extends Schema.Struct.Fields>(
  s: Schema.Struct<F>,
): { [K in keyof Schema.Struct.Encoded<F>]: undefined } =>
  Object.fromEntries(Object.keys(s.fields).map((k) => [k, undefined])) as {
    [K in keyof Schema.Struct.Encoded<F>]: undefined;
  };

const isEmptyExcerpt = (excerpt: unknown): boolean =>
  !isValidValue(excerpt) || getTextContents(excerpt).trim() === "";

const searchAndUpdateActor =
  (actor: ActorInfoSchema): ClientContextRTE<string | null> =>
  (ctx: ClientContext) =>
    pipe(
      ctx.api.Actor.List({
        Query: {
          q: actor.fullName,
          _end: "10",
          _start: "0",
        },
      }),
      fp.TE.chain((response) => {
        const match = pickExactMatch(actor.fullName, response.data, (a) => [
          a.fullName,
          a.username,
        ]);
        if (!match) {
          return fp.TE.right(null as string | null);
        }

        const bornOn = parseISODate(actor.bornOn);
        const diedOn = parseISODate(actor.diedOn);
        const body = {
          ...(isEmptyExcerpt(match.excerpt) && actor.description.trim()
            ? { excerpt: toInitialValue(actor.description) }
            : {}),
          ...(!match.bornOn && bornOn ? { bornOn } : {}),
          ...(!match.diedOn && diedOn ? { diedOn } : {}),
        };

        if (Object.keys(body).length === 0) {
          return fp.TE.right(null as string | null);
        }

        return pipe(
          ctx.api.Actor.Edit({
            Params: { id: match.id },
            Body: {
              ...keepAllFields(EditActorBody),
              ...body,
            } satisfies typeof EditActorBody.Encoded,
          }),
          fp.TE.map(() => match.id as string | null),
        );
      }),
      fp.TE.orElse((e) => {
        ctx.logger.warn.log(
          "Failed to update actor %s: %s",
          actor.fullName,
          e.message,
        );
        return fp.TE.right(null as string | null);
      }),
    );

const searchAndUpdateGroup =
  (group: GroupInfoSchema): ClientContextRTE<string | null> =>
  (ctx: ClientContext) =>
    pipe(
      ctx.api.Group.List({
        Query: {
          q: group.name,
          _end: "10",
          _start: "0",
        },
      }),
      fp.TE.chain((response) => {
        const match = pickExactMatch(group.name, response.data, (g) => [
          g.name,
          g.username,
        ]);
        if (
          !match ||
          !isEmptyExcerpt(match.excerpt) ||
          !group.description.trim()
        ) {
          return fp.TE.right(null as string | null);
        }

        return pipe(
          ctx.api.Group.Edit({
            Params: { id: match.id },
            Body: {
              ...keepAllFields(EditGroupBody),
              excerpt: toInitialValue(group.description),
            } satisfies typeof EditGroupBody.Encoded,
          }),
          fp.TE.map(() => match.id as string | null),
        );
      }),
      fp.TE.orElse((e) => {
        ctx.logger.warn.log(
          "Failed to update group %s: %s",
          group.name,
          e.message,
        );
        return fp.TE.right(null as string | null);
      }),
    );

const uniq = (ids: readonly (string | null)[]): string[] =>
  Array.from(new Set(ids.filter((r): r is string => r !== null)));

// --- Flow ---

const defaultQuestion =
  "Identify all individual people (actors) and organizations/groups mentioned in the given URL or article. " +
  "For each actor, extract their full name, a short description, birth/death dates if mentioned, and relevant keywords. " +
  "For each group, extract their name and a short description. " +
  "Return the response in JSON format.";

export const updateEntitiesFromURLFlow: JobProcessRTE<
  UpdateEntitiesFromURLTypeData,
  UpdateEntitiesFromURLResult
> = (job) => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind(
      "link",
      () => (ctx: ClientContext) =>
        pipe(
          ctx.api.Link.Get({
            Params: { id: job.data.linkId },
          }),
          fp.TE.map((r) => r.data),
          fp.TE.mapLeft(toAIBotError),
        ),
    ),
    // Pre-fetch the page so the model reasons over its actual text. When the
    // fetch fails we fall back to the URL alone and let the agent's own
    // scraping tool try, instead of failing the job outright.
    fp.RTE.bindW(
      "pageContent",
      ({ link }) =>
        (ctx: ClientContext) =>
          pipe(
            fetchURLContent(link.url)(ctx),
            fp.TE.map((c): PageContent | null => c),
            fp.TE.orElseW((e) => {
              ctx.logger.warn.log(
                "updateEntitiesFromURLFlow: cannot fetch %s (%s), sending URL only",
                link.url,
                e.message,
              );
              return fp.TE.right<never, PageContent | null>(null);
            }),
          ),
    ),
    fp.RTE.bind("extracted", ({ link, pageContent }) =>
      pipe(
        AgentChatService.getStructuredOutput<
          ClientContext,
          ExtractedEntitiesSchema
        >({
          message: pageContent
            ? [
                `Extract all mentioned actors and groups from the following article (source: ${link.url}).`,
                "Only use the article text below; do not add people or organizations that are not mentioned in it.",
                "",
                pageContent.title,
                pageContent.content,
                "",
                job.question ?? defaultQuestion,
              ].join("\n")
            : `Extract all mentioned actors and groups from the following URL: ${link.url}\n\n${job.question ?? defaultQuestion}`,
          conversationId: null,
          model: job.model ?? undefined,
          schema: ExtractedEntitiesSchema,
        }),
        fp.RTE.mapLeft(toAIBotError),
      ),
    ),
    fp.RTE.bind("actorResults", ({ extracted }) =>
      fp.A.traverse(fp.RTE.ApplicativeSeq)(searchAndUpdateActor)(
        extracted.actors,
      ),
    ),
    fp.RTE.bind("groupResults", ({ extracted }) =>
      fp.A.traverse(fp.RTE.ApplicativeSeq)(searchAndUpdateGroup)(
        extracted.groups,
      ),
    ),
    fp.RTE.map(({ extracted, actorResults, groupResults }) => ({
      updatedActors: uniq(actorResults),
      unmatchedActors: extracted.actors
        .filter((_, i) => actorResults[i] === null)
        .map((a) => a.fullName),
      updatedGroups: uniq(groupResults),
      unmatchedGroups: extracted.groups
        .filter((_, i) => groupResults[i] === null)
        .map((g) => g.name),
    })),
    LoggerService.RTE.debug("updateEntitiesFromURLFlow result: %O"),
  );
};
