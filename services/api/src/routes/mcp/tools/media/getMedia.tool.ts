import { MediaIO } from "@liexp/backend/lib/io/media.io.js";
import { MediaRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Schema } from "effect";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { Equal } from "typeorm";
import { type ServerContext } from "../../../../context/context.type.js";
import { formatMediaToMarkdown } from "../formatters/mediaToMarkdown.formatter.js";

export const GetMediaInputSchema = Schema.Struct({
  id: UUID.annotations({
    description: "UUID of the media to retrieve",
  }),
});
export type GetMediaInputSchema = typeof GetMediaInputSchema.Type;

export const getMediaToolTask = ({
  id,
}: GetMediaInputSchema): ReaderTaskEither<
  ServerContext,
  Error,
  CallToolResult
> => {
  return pipe(
    MediaRepository.findOneOrFail<ServerContext>({
      where: { id: Equal(id) },
    }),
    LoggerService.RTE.debug("Results %O"),
    fp.RTE.chainEitherK((media) => MediaIO.decodeSingle(media)),
    fp.RTE.map((media) => {
      return {
        content: [
          {
            text: formatMediaToMarkdown(media),
            type: "text" as const,
            href: `media://${media.id}`,
          },
        ],
      };
    }),
  );
};
