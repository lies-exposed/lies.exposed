import { LinkEntity } from "@liexp/backend/lib/entities/Link.entity.js";
import { LinkIO } from "@liexp/backend/lib/io/link.io.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Schema } from "effect";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../../context/context.type.js";
import { formatLinkToMarkdown } from "../formatters/linkToMarkdown.formatter.js";

export const CreateLinkInputSchema = Schema.Struct({
  url: Schema.String.annotations({
    description: "URL of the link to create",
  }),
  title: Schema.String.annotations({
    description: "Title of the link",
  }),
  publishDate: Schema.UndefinedOr(Schema.String).annotations({
    description: "Publish date in ISO format (YYYY-MM-DD) or null",
  }),
  description: Schema.UndefinedOr(Schema.String).annotations({
    description: "Description of the link or null",
  }),
  events: Schema.Array(UUID).annotations({
    description: "Array of event UUIDs to associate with the link",
  }),
});
export type CreateLinkInputSchema = typeof CreateLinkInputSchema.Type;

export const createLinkToolTask = ({
  url,
  title,
  publishDate,
  description,
  events,
}: CreateLinkInputSchema): ReaderTaskEither<
  ServerContext,
  Error,
  CallToolResult
> => {
  return (ctx: ServerContext) =>
    pipe(
      // Create new link directly
      ctx.db.save(LinkEntity, [
        {
          url,
          title,
          publishDate: publishDate ? new Date(publishDate) : undefined,
          description: description ?? null,
          keywords: [],
          events: events.map((id) => ({ id })),
          creator: null,
        },
      ]),
      TE.map(([data]) => data),
      TE.chainEitherK(LinkIO.decodeSingle),
      LoggerService.TE.debug(ctx, "Created link %O"),
      fp.TE.map((link) => ({
        content: [
          {
            text: formatLinkToMarkdown(link),
            type: "text" as const,
          },
        ],
      })),
    );
};
