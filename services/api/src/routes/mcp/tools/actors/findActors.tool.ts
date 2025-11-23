import { ActorIO } from "@liexp/backend/lib/io/Actor.io.js";
import { fetchActors } from "@liexp/backend/lib/queries/actors/fetchActors.query.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../../context/context.type.js";
import { formatActorToMarkdown } from "../formatters/actorToMarkdown.formatter.js";

export const FindActorsInputSchema = Schema.Struct({
  fullName: Schema.UndefinedOr(Schema.String).annotations({
    description: "Full name to search for (partial match supported)",
  }),
  memberIn: Schema.Array(UUID).annotations({
    description: "Array of group UUIDs the actor is a member of",
  }),
  withDeleted: Schema.UndefinedOr(Schema.Boolean).annotations({
    description: "Include deleted actors in the search results",
  }),
  sort: Schema.Union(
    Schema.Literal("username"),
    Schema.Literal("createdAt"),
    Schema.Literal("updatedAt"),
    Schema.Undefined,
  ).annotations({
    description:
      'Sort field: "createdAt", "fullName", or "username". Defaults to createdAt',
  }),
  order: Schema.Union(
    Schema.Literal("ASC"),
    Schema.Literal("DESC"),
    Schema.Undefined,
  ).annotations({
    description: 'Sort order: "ASC" for ascending or "DESC" for descending',
  }),
  start: Schema.UndefinedOr(Schema.Number).annotations({
    description: "Pagination start index",
  }),
  end: Schema.UndefinedOr(Schema.Number).annotations({
    description: "Pagination end index",
  }),
});
export type FindActorsInputSchema = typeof FindActorsInputSchema.Type;

export const findActorsToolTask = ({
  fullName,
  memberIn,
  withDeleted,
  sort,
  order,
  start,
  end,
}: FindActorsInputSchema): ReaderTaskEither<
  ServerContext,
  Error,
  CallToolResult
> => {
  return pipe(
    fetchActors<ServerContext>({
      q: O.fromNullable(fullName),
      memberIn: pipe(
        O.fromNullable(memberIn),
        O.filter((arr) => arr.length > 0),
      ),
      withDeleted: O.fromNullable(withDeleted),
      _sort: O.fromNullable(sort),
      _order: O.fromNullable(order),
      _start: O.fromNullable(start),
      _end: O.fromNullable(end),
    }),
    LoggerService.RTE.debug("Results %O"),
    fp.RTE.chainEitherK((result) => ActorIO.decodeMany(result.results)),
    fp.RTE.map((actors) => {
      if (actors.length === 0) {
        return {
          content: [
            {
              text: `No actors found matching the search criteria${fullName ? ` for "${fullName}"` : ""}.`,
              type: "text" as const,
            },
          ],
        };
      }
      return {
        content: actors.map((actor) => ({
          text: formatActorToMarkdown(actor),
          type: "text" as const,
          href: `actor://${actor.id}`,
        })),
      };
    }),
  );
};
