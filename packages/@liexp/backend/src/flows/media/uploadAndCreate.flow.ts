import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { uuid, type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import {
  IframeVideoType,
  type MediaType,
} from "@liexp/shared/lib/io/http/Media/index.js";
import { type Media } from "@liexp/shared/lib/io/http/index.js";
import { getMediaKey } from "@liexp/shared/lib/utils/media.utils.js";
import { Schema } from "effect";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type ConfigContext } from "../../context/config.context.js";
import { type DatabaseContext } from "../../context/db.context.js";
import { type ENVContext } from "../../context/env.context.js";
import { type FSClientContext } from "../../context/fs.context.js";
import { type HTTPProviderContext } from "../../context/http.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type QueuesProviderContext } from "../../context/queue.context.js";
import { type RedisContext } from "../../context/redis.context.js";
import { type SpaceContext } from "../../context/space.context.js";
import { type MediaEntity } from "../../entities/Media.entity.js";
import { ServerError } from "../../errors/ServerError.js";
import { upload } from "../../flows/space/upload.flow.js";
import { MediaPubSub } from "../../pubsub/media/index.js";
import { MediaRepository } from "../../services/entity-repository.service.js";

export type CreateAndUploadFlowContext = SpaceContext &
  ENVContext &
  QueuesProviderContext &
  DatabaseContext &
  LoggerContext &
  ConfigContext &
  FSClientContext &
  HTTPProviderContext &
  RedisContext;

export const uploadAndCreate = <C extends CreateAndUploadFlowContext>(
  createMediaData: Media.CreateMedia,
  { Body, ContentType }: { Body: any; ContentType?: MediaType },
  id: UUID | undefined,
  extractThumb: boolean,
): ReaderTaskEither<C, ServerError, MediaEntity> => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("mediaId", () =>
      fp.RTE.right<C, ServerError, UUID>(id ?? uuid()),
    ),
    fp.RTE.bind("location", ({ mediaId }) => {
      // ctx.logger.debug.log("Create media and upload %s", createMediaData);

      if (Schema.is(IframeVideoType)(createMediaData.type)) {
        return fp.RTE.right(createMediaData.location);
      }

      const mediaKey = getMediaKey(
        "media",
        mediaId,
        mediaId,
        createMediaData.type,
      );
      return pipe(
        upload<C>({
          Key: mediaKey,
          Body,
          ContentType,
          ACL: "public-read",
        }),
        fp.RTE.map((r) => r.Location as URL),
        fp.RTE.mapLeft(ServerError.fromUnknown),
      );
    }),
    // ctx.logger.debug.logInTaskEither("Result %O"),
    // LoggerService.RTE.info("Result %O"),
    fp.RTE.bind("thumbnail", ({ mediaId }) =>
      pipe(
        extractThumb
          ? pipe(
              MediaPubSub.GenerateThumbnailPubSub.publish<C>({ id: mediaId }),
              fp.RTE.map(() => undefined),
              fp.RTE.mapLeft(ServerError.fromUnknown),
            )
          : fp.RTE.right(createMediaData.thumbnail),
      ),
    ),
    fp.RTE.chain(({ mediaId, location, thumbnail }) =>
      MediaRepository.save<C>([
        {
          ...createMediaData,
          description: createMediaData.description ?? createMediaData.label,
          events: [],
          links: [],
          featuredInStories: [],
          keywords: [],
          areas: [],
          id: mediaId,
          location,
          thumbnail,
        },
      ]),
    ),
    fp.RTE.map((m) => m[0]),
    // fp.RTE.chainFirst((m) => (ctx) => {
    //   if (Schema.is(PDFType)(m.type)) {
    //     return pipe(
    //       ctx.queue.queue(OpenAIEmbeddingQueueType.literals[0]).addJob({
    //         id: m.id,
    //         resource: MEDIA.literals[0],
    //         status: PendingStatus.literals[0],
    //         error: null,
    //         result: null,
    //         prompt: null,
    //         question: null,
    //         type: OpenAIEmbeddingQueueType.literals[0],
    //         data: {
    //           url: m.location,
    //           type: "pdf" as const,
    //         },
    //       } satisfies Queue),
    //       fp.TE.mapLeft(ServerError.fromUnknown),
    //     );
    //   }

    //   return fp.TE.right(undefined);
    // }),
  );
};
