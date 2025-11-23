import { MediaIO } from "@liexp/backend/lib/io/media.io.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { MediaType } from "@liexp/shared/lib/io/http/Media/MediaType.js";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Schema } from "effect";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../../context/context.type.js";
import { uploadMediaFromURLFlow } from "../../../../flows/media/uploadMediaFromURL.flow.js";
import { formatMediaToMarkdown } from "../formatters/mediaToMarkdown.formatter.js";

export const UploadMediaFromURLInputSchema = Schema.Struct({
  url: URL.annotations({
    description: "URL of the image or media file to download and upload",
  }),
  type: MediaType.annotations({
    description:
      "Type of media (Image, Video, PDF, etc.). Must match the actual file type.",
  }),
  label: Schema.String.annotations({
    description: "Label/title for the media",
  }),
  description: Schema.UndefinedOr(Schema.String).annotations({
    description: "Optional detailed description of the media",
  }),
});
export type UploadMediaFromURLInputSchema =
  typeof UploadMediaFromURLInputSchema.Type;

export const uploadMediaFromURLToolTask = ({
  url,
  type,
  label,
  description,
}: UploadMediaFromURLInputSchema): ReaderTaskEither<
  ServerContext,
  Error,
  CallToolResult
> => {
  return pipe(
    uploadMediaFromURLFlow({
      id: uuid(),
      url,
      type,
      label,
      description,
    }),
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
