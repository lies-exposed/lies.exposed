import { type PutObjectCommandInput } from "@aws-sdk/client-s3";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type SimpleMedia } from "../simpleIMedia.type.js";
import { extractThumbnail } from "./extractThumbnail.flow.js";
import { type TEReader } from "#flows/flow.types.js";
import { type RouteContext } from "#routes/route.types.js";

const uploadThumbnails = (
  thumbnails: PutObjectCommandInput[],
): TEReader<string[]> =>
  pipe(
    fp.RTE.ask<RouteContext>(),
    fp.RTE.chainTaskEitherK((ctx) =>
      pipe(
        thumbnails,
        fp.A.traverse(TE.ApplicativePar)((thumbnail) =>
          pipe(
            ctx.s3.upload({
              ...thumbnail,
              Bucket: ctx.env.SPACE_BUCKET,
              ACL: "public-read",
            }),
            TE.map(({ Location }) => Location),
          ),
        ),
      ),
    ),
  );

/**
 * Extract thumbnail from media and upload to S3
 */
export const createThumbnail = (media: SimpleMedia): TEReader<string[]> => {
  return pipe(
    fp.RTE.ask<RouteContext>(),
    fp.RTE.chainTaskEitherK(extractThumbnail(media)),
    fp.RTE.chain(uploadThumbnails),
  );
};
