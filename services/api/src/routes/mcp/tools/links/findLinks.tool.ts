import {
  fetchLinks,
  getListQueryEmpty,
} from "@liexp/backend/lib/queries/links/fetchLinks.query.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { Link } from "@liexp/shared/lib/io/http/Link.js";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../../context/context.type.js";
import { formatLinkToMarkdown } from "../formatters/linkToMarkdown.formatter.js";

export const FindLinksInputSchema = Schema.Struct({
  query: Schema.UndefinedOr(Schema.String).annotations({
    description:
      "Search query string to filter links by title or URL (optional)",
  }),
  ids: Schema.Array(Schema.UUID).annotations({
    description: "Array of link UUIDs to filter by",
  }),
  sort: Schema.Union(
    Schema.Literal("createdAt"),
    Schema.Literal("title"),
    Schema.Literal("url"),
    Schema.Undefined,
  ).annotations({
    description:
      'Sort field: "createdAt", "title", or "url". Defaults to createdAt',
  }),
  order: Schema.Union(
    Schema.Literal("ASC"),
    Schema.Literal("DESC"),
    Schema.Undefined,
  ).annotations({
    description: 'Sort order: "ASC" for ascending or "DESC" for descending',
  }),
});
export type FindLinksInputSchema = typeof FindLinksInputSchema.Type;

export const findLinksToolTask = ({
  query,
  sort,
  order,
  ids,
}: FindLinksInputSchema): ReaderTaskEither<
  ServerContext,
  Error,
  CallToolResult
> => {
  return (ctx: ServerContext) =>
    pipe(
      fetchLinks(
        {
          ...getListQueryEmpty,
          q: O.fromNullable(query),
          ids: pipe(
            ids as UUID[] | undefined,
            O.fromNullable,
            O.filter((a) => a.length > 0),
          ),
          _sort: O.fromNullable(sort),
          _order: O.fromNullable(order),
        },
        false,
      )(ctx),
      LoggerService.TE.debug(ctx, `Results %O`),
      fp.TE.map(([links]) => {
        if (links.length === 0) {
          return {
            content: [
              {
                text: `No links found matching the search criteria${query ? ` for "${query}"` : ""}.`,
                type: "text" as const,
              },
            ],
          };
        }
        return {
          content: links.map((link) => {
            const decodedLink = Schema.decodeUnknownSync(Link)(link);
            return {
              text: formatLinkToMarkdown(decodedLink),
              type: "text" as const,
              href: `link://${decodedLink.id}`,
            };
          }),
        };
      }),
    );
};
