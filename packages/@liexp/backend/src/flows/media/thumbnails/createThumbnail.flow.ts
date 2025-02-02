import { type PutObjectCommandInput } from "@aws-sdk/client-s3";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type ConfigContext } from "../../../context/config.context.js";
import { type ENVContext } from "../../../context/env.context.js";
import { type FFMPEGProviderContext } from "../../../context/ffmpeg.context.js";
import { type FSClientContext } from "../../../context/fs.context.js";
import { type HTTPProviderContext } from "../../../context/http.context.js";
import { type ImgProcClientContext } from "../../../context/index.js";
import { type LoggerContext } from "../../../context/logger.context.js";
import { type PDFProviderContext } from "../../../context/pdf.context.js";
import { type PuppeteerProviderContext } from "../../../context/puppeteer.context.js";
import { type SpaceContext } from "../../../context/space.context.js";
import { type SimpleMedia } from "../../../io/media.io.js";
import { type SpaceError } from "../../../providers/space/space.provider.js";
import { upload } from "../../space/upload.flow.js";
import { extractThumbnail } from "./extractThumbnail.flow.js";

const uploadThumbnails = <C extends SpaceContext & ENVContext>(
  thumbnails: PutObjectCommandInput[],
): ReaderTaskEither<C, SpaceError, URL[]> =>
  pipe(
    thumbnails,
    fp.A.traverse(fp.RTE.ApplicativePar)((thumbnail) =>
      pipe(
        upload({
          ...thumbnail,
          ACL: "public-read",
        }),
        fp.RTE.map(({ Location }) => Location as URL),
      ),
    ),
  );

/**
 * Extract thumbnail from media and upload to S3
 */
export const createThumbnail = <
  C extends LoggerContext &
    ENVContext &
    ConfigContext &
    FSClientContext &
    HTTPProviderContext &
    PDFProviderContext &
    FFMPEGProviderContext &
    PuppeteerProviderContext &
    ImgProcClientContext &
    SpaceContext,
>(
  media: SimpleMedia,
): ReaderTaskEither<C, SpaceError, URL[]> => {
  return pipe(extractThumbnail<C>(media), fp.RTE.chain(uploadThumbnails<C>));
};
