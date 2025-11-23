import { AreaIO } from "@liexp/backend/lib/io/Area.io.js";
import { fetchAreas } from "@liexp/backend/lib/queries/areas/fetchAreas.query.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../../context/context.type.js";
import { formatAreaToMarkdown } from "../formatters/areaToMarkdown.formatter.js";

export const FindAreasInputSchema = Schema.Struct({
  query: Schema.String.annotations({
    description: "Search query string to filter areas by name or description",
  }),
  withDeleted: Schema.UndefinedOr(Schema.Boolean).annotations({
    description: "Include deleted areas in the search results",
  }),
  sort: Schema.Union(
    Schema.Literal("createdAt"),
    Schema.Literal("label"),
    Schema.Undefined,
  ).annotations({
    description: 'Sort field: "createdAt" or "label". Defaults to createdAt',
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
export type FindAreasInputSchema = typeof FindAreasInputSchema.Type;

export const findAreasToolTask = ({
  query,
  withDeleted,
  sort,
  order,
  start,
  end,
}: FindAreasInputSchema): ReaderTaskEither<
  ServerContext,
  Error,
  CallToolResult
> => {
  return pipe(
    fetchAreas<ServerContext>(
      {
        q: O.some(query),
        _sort: O.fromNullable(sort),
        _order: O.fromNullable(order),
        ids: O.none(),
        draft: O.none(),
        withDeleted: O.fromNullable(withDeleted),
        _start: O.fromNullable(start),
        _end: O.fromNullable(end),
      },
      false,
    ),
    LoggerService.RTE.debug("Results %O"),
    fp.RTE.chainEitherK(([areas]) => AreaIO.decodeMany(areas)),
    fp.RTE.map((decodedAreas) => {
      if (decodedAreas.length === 0) {
        return {
          content: [
            {
              text: `No areas found matching the search criteria${query ? ` for "${query}"` : ""}.`,
              type: "text" as const,
            },
          ],
        };
      }
      return {
        content: decodedAreas.map((area) => ({
          text: formatAreaToMarkdown(area),
          type: "text" as const,
          href: `area://${area.id}`,
        })),
      };
    }),
  );
};
