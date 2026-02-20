import { AgentChatService } from "@liexp/backend/lib/services/agent-chat/agent-chat.service.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type UpdateEntitiesFromURLTypeData } from "@liexp/io/lib/http/Queue/index.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { Schema } from "effect";
import { toAIBotError } from "../../common/error/index.js";
import { type ClientContext } from "../../context.js";
import { type ClientContextRTE } from "../../types.js";
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
  bornOn: Schema.String.annotations({
    description:
      "Birth date in ISO format (YYYY-MM-DD) or empty string if unknown",
  }),
  diedOn: Schema.String.annotations({
    description:
      "Death date in ISO format (YYYY-MM-DD) or empty string if still alive or unknown",
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

export interface UpdateEntitiesFromURLResult {
  updatedActors: string[];
  updatedGroups: string[];
  unmatchedActors: string[];
  unmatchedGroups: string[];
}

// --- Per-entity update helpers ---

const searchAndUpdateActor =
  (actor: ActorInfoSchema): ClientContextRTE<string | null> =>
  (ctx: ClientContext) =>
    pipe(
      ctx.api.Actor.List({
        Query: {
          q: actor.fullName,
          _end: "5",
          _start: "0",
        },
      }),
      fp.TE.chain((response) => {
        const matches = response.data;
        if (matches.length === 0) {
          return fp.TE.right(null as string | null);
        }

        const match = matches[0];

        return pipe(
          ctx.api.Actor.Edit({
            Params: { id: match.id },
            Body: {
              fullName: actor.fullName,
              excerpt: toInitialValue(actor.description),
              bornOn: actor.bornOn ? new Date(actor.bornOn) : undefined,
              diedOn: actor.diedOn ? new Date(actor.diedOn) : undefined,
              keywords: actor.keywords,
            } as any,
          }),
          fp.TE.map(() => match.id as string | null),
        );
      }),
      fp.TE.orElse(() => fp.TE.right(null as string | null)),
    );

const searchAndUpdateGroup =
  (group: GroupInfoSchema): ClientContextRTE<string | null> =>
  (ctx: ClientContext) =>
    pipe(
      ctx.api.Group.List({
        Query: {
          name: group.name,
          _end: "5",
          _start: "0",
        },
      }),
      fp.TE.chain((response) => {
        const matches = response.data;
        if (matches.length === 0) {
          return fp.TE.right(null as string | null);
        }

        const match = matches[0];

        return pipe(
          ctx.api.Group.Edit({
            Params: { id: match.id },
            Body: {
              name: group.name,
              excerpt: toInitialValue(group.description),
            } as any,
          }),
          fp.TE.map(() => match.id as string | null),
        );
      }),
      fp.TE.orElse(() => fp.TE.right(null as string | null)),
    );

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
    fp.RTE.bind("extracted", ({ link }) =>
      pipe(
        AgentChatService.getStructuredOutput<
          ClientContext,
          ExtractedEntitiesSchema
        >({
          message: `Extract all mentioned actors and groups from the following URL: ${link.url}\n\n${job.question ?? defaultQuestion}`,
          conversationId: null,
        }),
        fp.RTE.mapLeft(toAIBotError),
      ),
    ),
    fp.RTE.bind("actorResults", ({ extracted }) =>
      fp.A.traverse(fp.RTE.ApplicativePar)(searchAndUpdateActor)(
        extracted.actors,
      ),
    ),
    fp.RTE.bind("groupResults", ({ extracted }) =>
      fp.A.traverse(fp.RTE.ApplicativePar)(searchAndUpdateGroup)(
        extracted.groups,
      ),
    ),
    fp.RTE.map(({ extracted, actorResults, groupResults }) => ({
      updatedActors: actorResults.filter((r): r is string => r !== null),
      unmatchedActors: extracted.actors
        .filter((_, i) => actorResults[i] === null)
        .map((a) => a.fullName),
      updatedGroups: groupResults.filter((r): r is string => r !== null),
      unmatchedGroups: extracted.groups
        .filter((_, i) => groupResults[i] === null)
        .map((g) => g.name),
    })),
    LoggerService.RTE.debug("updateEntitiesFromURLFlow result: %O"),
  );
};
