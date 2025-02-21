import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { type UUID, uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import {
  IframeVideoType,
  MEDIA,
  PDFType,
  type MediaType,
} from "@liexp/shared/lib/io/http/Media/index.js";
import { type Queue } from "@liexp/shared/lib/io/http/Queue/index.js";
import {
  OpenAIEmbeddingQueueType,
  PendingStatus,
} from "@liexp/shared/lib/io/http/Queue/index.js";
import { type Media } from "@liexp/shared/lib/io/http/index.js";
import { getMediaKey } from "@liexp/shared/lib/utils/media.utils.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type ConfigContext } from "../../context/config.context.js";
import { type DatabaseContext } from "../../context/db.context.js";
import { type ENVContext } from "../../context/env.context.js";
import { type FFMPEGProviderContext } from "../../context/ffmpeg.context.js";
import { type FSClientContext } from "../../context/fs.context.js";
import { type HTTPProviderContext } from "../../context/http.context.js";
import { type ImgProcClientContext } from "../../context/index.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type PDFProviderContext } from "../../context/pdf.context.js";
import { type PuppeteerProviderContext } from "../../context/puppeteer.context.js";
import { type QueuesProviderContext } from "../../context/queue.context.js";
import { type SpaceContext } from "../../context/space.context.js";
import { type MediaEntity } from "../../entities/Media.entity.js";
import { ServerError } from "../../errors/ServerError.js";
import { upload } from "../../flows/space/upload.flow.js";
import { MediaRepository } from "../../services/entity-repository.service.js";
import { LoggerService } from "../../services/logger/logger.service.js";
import { createThumbnail } from "./thumbnails/createThumbnail.flow.js";

export type CreateAndUploadFlowContext = SpaceContext &
  ENVContext &
  QueuesProviderContext &
  DatabaseContext &
  LoggerContext &
  ConfigContext &
  FSClientContext &
  HTTPProviderContext &
  PDFProviderContext &
  FFMPEGProviderContext &
  PuppeteerProviderContext &
  ImgProcClientContext;

export const createAndUpload = <C extends CreateAndUploadFlowContext>(
  createMediaData: Media.CreateMedia,
  { Body, ContentType }: { Body: any; ContentType?: MediaType },
  id: UUID | undefined,
  extractThumb: boolean,
): ReaderTaskEither<C, ServerError, MediaEntity> => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("mediaId", () => fp.RTE.right(id ?? uuid())),
    fp.RTE.bind("location", ({ mediaId }) => {
      // ctx.logger.debug.log("Create media and upload %s", createMediaData);

      if (IframeVideoType.is(createMediaData.type)) {
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
    LoggerService.RTE.info("Result %O"),
    fp.RTE.bind("thumbnail", ({ mediaId, location }) =>
      pipe(
        extractThumb
          ? pipe(
              createThumbnail<C>({
                ...createMediaData,
                id: mediaId,
                location,
                thumbnail: null,
              }),
              fp.RTE.map((s) => s[0]),
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
    fp.RTE.chainFirst((m) => (ctx) => {
      if (PDFType.is(m.type)) {
        return pipe(
          ctx.queue.queue(OpenAIEmbeddingQueueType.value).addJob({
            id: m.id,
            resource: MEDIA.value,
            status: PendingStatus.value,
            error: null,
            result: null,
            prompt: null,
            question: null,
            type: OpenAIEmbeddingQueueType.value,
            data: {
              url: m.location,
              type: "pdf" as const,
            },
          } satisfies Queue),
          fp.TE.mapLeft(ServerError.fromUnknown),
        );
      }

      return fp.TE.right(undefined);
    }),
  );
};
