import { MediaIO } from "@liexp/backend/lib/io/media.io.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { URL } from "@liexp/io/lib/http/Common/URL.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { MediaType } from "@liexp/io/lib/http/Media/MediaType.js";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Schema } from "effect";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../../context/context.type.js";
import { createMediaFromURLFlow } from "../../../../flows/media/createMediaFromURL.flow.js";
import { uploadMediaFromURLFlow } from "../../../../flows/media/uploadMediaFromURL.flow.js";
import { formatMediaToMarkdown } from "../formatters/mediaToMarkdown.formatter.js";

/**
 * Unified media creation schema.
 * 
 * Can be used for both external URL references and uploading media to storage:
 * - autoUpload: false (default) - creates external URL reference
 * - autoUpload: true - downloads and uploads to storage
 * 
 * Backward compatible: existing calls without autoUpload parameter work as before (external reference)
 */
export const CreateMediaInputSchema = Schema.Struct({
  location: URL.annotations({
    description: "URL of the media file (external URL or file location)",
  }),
  type: MediaType.annotations({
    description: "Type of media (Image, Video, PDF, Audio, Document, etc.)",
  }),
  label: Schema.String.annotations({
    description: "Label/title for the media",
  }),
  description: Schema.UndefinedOr(Schema.String).annotations({
    description: "Optional detailed description of the media",
  }),
  autoUpload: Schema.UndefinedOr(Schema.Boolean).annotations({
    description:
      "Set to true to download and upload media to storage. Default (false) stores external URL reference. Use true for images/files that should be stored internally. This parameter unifies the functionality of uploadMediaFromURL.",
  }),
});
export type CreateMediaInputSchema = typeof CreateMediaInputSchema.Type;

export const createMediaToolTask = ({
  location,
  type,
  label,
  description,
  autoUpload,
}: CreateMediaInputSchema): ReaderTaskEither<
  ServerContext,
  Error,
  CallToolResult
> => {
  const shouldUpload = autoUpload ?? false;

  return pipe(
    shouldUpload
      ? // Upload to storage and create media entity
        uploadMediaFromURLFlow({
          id: uuid(),
          url: location,
          type,
          label,
          description,
        })
      : // Create external URL reference
        createMediaFromURLFlow(
          {
            id: uuid(),
            location,
            type,
            label,
            description,
            areas: [],
            keywords: [],
            links: [],
            events: [],
            thumbnail: undefined,
            extra: undefined,
          },
          null,
        ),
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
