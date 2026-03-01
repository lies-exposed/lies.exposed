import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type URL } from "@liexp/io/lib/http/Common/URL.js";
import { uuid, type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { PDFType } from "@liexp/io/lib/http/Media/MediaType.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type ConfigContext } from "../../context/config.context.js";
import { type DatabaseContext } from "../../context/db.context.js";
import { type ENVContext } from "../../context/env.context.js";
import { type FSClientContext } from "../../context/fs.context.js";
import { type HTTPProviderContext } from "../../context/http.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type QueuesProviderContext } from "../../context/queue.context.js";
import { type RedisContext } from "../../context/redis.context.js";
import { type SpaceContext } from "../../context/space.context.js";
import { ServerError } from "../../errors/index.js";
import { uploadAndCreate } from "../media/uploadAndCreate.flow.js";

type ParsePDFURLContext = LoggerContext &
  SpaceContext &
  ENVContext &
  QueuesProviderContext &
  DatabaseContext &
  ConfigContext &
  FSClientContext &
  HTTPProviderContext &
  RedisContext;

export const parsePDFURL =
  <C extends ParsePDFURLContext>(
    url: URL,
  ): ReaderTaskEither<C, ServerError, UUID> =>
  (ctx) => {
    const mediaId = uuid();
    const filename = url.split("/").pop()?.split("?")[0] ?? `${mediaId}.pdf`;

    ctx.logger.debug.log("Downloading PDF from URL %s", url);

    return pipe(
      ctx.http.get<Buffer>(url, { responseType: "arraybuffer" }),
      TE.mapLeft(ServerError.fromUnknown),
      TE.chain((body) =>
        uploadAndCreate(
          {
            id: mediaId,
            type: PDFType.literals[0],
            location: url,
            label: filename,
            description: filename,
            thumbnail: undefined,
            extra: undefined,
            events: [],
            links: [],
            keywords: [],
            areas: [],
          },
          {
            Body: body,
            ContentType: PDFType.literals[0],
          },
          mediaId,
          false,
        )(ctx),
      ),
      TE.map(() => mediaId),
    );
  };

export const parsePDFURLs =
  <C extends ParsePDFURLContext>(
    urls: URL[],
  ): ReaderTaskEither<C, ServerError, UUID[]> =>
  (ctx) =>
    pipe(
      urls,
      fp.A.map((url) => parsePDFURL<C>(url)(ctx)),
      fp.A.sequence(TE.ApplicativeSeq),
      TE.map((ids) => ids as UUID[]),
    );
