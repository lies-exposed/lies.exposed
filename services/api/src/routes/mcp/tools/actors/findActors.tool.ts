import { ActorIO } from "@liexp/backend/lib/io/Actor.io.js";
import { fetchActors } from "@liexp/backend/lib/queries/actors/fetchActors.query.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { FindActorsInputSchema } from "@liexp/shared/lib/mcp/schemas/actors.schemas.js";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import * as O from "effect/Option";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../../context/context.type.js";
import { formatActorToMarkdown } from "../formatters/actorToMarkdown.formatter.js";

export { FindActorsInputSchema };

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
