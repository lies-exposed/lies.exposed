import { MediaIO } from "@liexp/backend/lib/io/media.io.js";
import { fetchManyMedia } from "@liexp/backend/lib/queries/media/fetchManyMedia.query.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { MediaType } from "@liexp/shared/lib/io/http/Media/MediaType.js";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../../context/context.type.js";
import { formatMediaToMarkdown } from "../formatters/mediaToMarkdown.formatter.js";

export const FindMediaInputSchema = Schema.Struct({
  query: Schema.String.annotations({
    description: "Search query string to filter media by label or description",
  }),
  location: Schema.UndefinedOr(URL).annotations({
    description: "Location associated with the media",
  }),
  type: Schema.UndefinedOr(MediaType).annotations({
    description:
      'Media type: "image/jpeg", "image/png", "video/mp4", "application/pdf", etc.',
  }),
  sort: Schema.UndefinedOr(Schema.String).annotations({
    description:
      'Sort field: "createdAt", "label", or "type". Defaults to createdAt',
  }),
  order: Schema.UndefinedOr(Schema.String).annotations({
    description: 'Sort order: "ASC" or "DESC". Defaults to DESC',
  }),
});
export type FindMediaInputSchema = typeof FindMediaInputSchema.Type;

export const findMediaToolTask = ({
  query,
  location,
  type,
  sort,
  order,
}: FindMediaInputSchema): ReaderTaskEither<
  ServerContext,
  Error,
  CallToolResult
> => {
  // Validate string inputs
  const validSort =
    sort === "createdAt" || sort === "label" || sort === "type"
      ? sort
      : undefined;
  const validOrder = order === "ASC" || order === "DESC" ? order : undefined;

  return pipe(
    fetchManyMedia<ServerContext>({
      q: O.some(query),
      location: O.fromNullable(location),
      type: O.fromNullable(type),
      _sort: O.fromNullable(validSort),
      _order: O.fromNullable(validOrder),
    }),
    LoggerService.RTE.debug("Results %O"),
    fp.RTE.chainEitherK(([media]) => MediaIO.decodeMany(media)),
    fp.RTE.map((media) => {
      if (media.length === 0) {
        return {
          content: [
            {
              text: `No media found matching the search criteria${query ? ` for "${query}"` : ""}.`,
              type: "text" as const,
            },
          ],
        };
      }
      return {
        content: media.map((m) => ({
          text: formatMediaToMarkdown(m),
          type: "text" as const,
          href: `media://${m.id}`,
        })),
      };
    }),
  );
};
