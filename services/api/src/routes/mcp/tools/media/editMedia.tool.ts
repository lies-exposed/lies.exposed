import { MediaIO } from "@liexp/backend/lib/io/media.io.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { URL } from "@liexp/io/lib/http/Common/URL.js";
import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { MediaType } from "@liexp/io/lib/http/Media/MediaType.js";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../../context/context.type.js";
import { editMedia } from "../../../../flows/media/editMedia.flow.js";
import { formatMediaToMarkdown } from "../formatters/mediaToMarkdown.formatter.js";

export const EditMediaInputSchema = Schema.Struct({
  id: UUID.annotations({
    description: "UUID of the media to edit",
  }),
  location: Schema.UndefinedOr(URL).annotations({
    description:
      "URL of the media file (can be external URL or storage URL) - omit to keep current",
  }),
  type: Schema.UndefinedOr(MediaType).annotations({
    description:
      "Type of media (Image, Video, PDF, etc.) - omit to keep current",
  }),
  label: Schema.UndefinedOr(Schema.String).annotations({
    description: "Label/title for the media - omit to keep current",
  }),
  description: Schema.UndefinedOr(Schema.String).annotations({
    description: "Optional detailed description of the media",
  }),
});
export type EditMediaInputSchema = typeof EditMediaInputSchema.Type;

export const editMediaToolTask = ({
  id,
  location,
  type,
  label,
  description,
}: EditMediaInputSchema): ReaderTaskEither<
  ServerContext,
  Error,
  CallToolResult
> => {
  // Map undefined values to empty strings/defaults for the flow
  // The flow will use existing values if these are not actually changed
  const mappedBody = {
    location: (location ?? "") as any,
    type: (type ?? "image/jpg") as any,
    label: label ?? "",
    description: O.fromNullable(description),
    areas: [],
    keywords: [],
    links: [],
    events: [],
    thumbnail: O.none(),
    extra: O.none(),
    overrideExtra: O.none(),
    overrideThumbnail: O.none(),
    transfer: O.none(),
    transferThumbnail: O.none(),
    restore: O.none(),
    creator: O.none(),
  };

  return pipe(
    editMedia(id, mappedBody),
    fp.RTE.chainEitherK((media) => MediaIO.decodeSingle(media)),
    fp.RTE.map((media) => ({
      content: [
        {
          text: formatMediaToMarkdown(media),
          type: "text" as const,
          href: `media://${media.id}`,
        },
      ],
    })),
  );
};
