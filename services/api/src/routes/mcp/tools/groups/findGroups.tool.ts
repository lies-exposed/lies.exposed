import { GroupIO } from "@liexp/backend/lib/io/group.io.js";
import { fetchGroups } from "@liexp/backend/lib/queries/groups/fetchGroups.query.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../../context/context.type.js";
import { formatGroupToMarkdown } from "../formatters/groupToMarkdown.formatter.js";

export const FindGroupsInputSchema = Schema.Struct({
  query: Schema.String.annotations({
    description: "Search query string to filter groups by name or description",
  }),
  withDeleted: Schema.UndefinedOr(Schema.Boolean).annotations({
    description: "Include deleted groups in the search results",
  }),
  sort: Schema.Union(
    Schema.Union(Schema.Literal("createdAt"), Schema.Literal("name")),
    Schema.Undefined,
  ).annotations({
    description: 'Sort field: "createdAt" or "name". Defaults to createdAt',
  }),
  order: Schema.Union(
    Schema.Union(Schema.Literal("ASC"), Schema.Literal("DESC")),
    Schema.Undefined,
  ).annotations({
    description: 'Sort order: "ASC" for ascending or "DESC" for descending',
  }),
});
export type FindGroupsInputSchema = typeof FindGroupsInputSchema.Type;

export const findGroupsToolTask = ({
  query,
  withDeleted: _withDeleted,
  sort,
  order,
}: FindGroupsInputSchema): ReaderTaskEither<
  ServerContext,
  Error,
  CallToolResult
> => {
  return pipe(
    fetchGroups({
      q: pipe(
        O.fromNullable(query),
        O.filter((q) => q.length > 0),
      ),
      _sort: O.fromNullable(sort),
      _order: O.fromNullable(order),
    }),
    LoggerService.RTE.debug(`Results %O`),
    fp.RTE.chainEitherK((result) => GroupIO.decodeMany(result[0])),
    fp.RTE.map((groups) => {
      if (groups.length === 0) {
        return {
          content: [
            {
              text: `No groups found matching the search criteria${query ? ` for "${query}"` : ""}.`,
              type: "text" as const,
            },
          ],
        };
      }
      return {
        content: groups.map((group) => ({
          text: formatGroupToMarkdown(group),
          type: "text" as const,
          href: `group://${group.id}`,
        })),
      };
    }),
  );
};
