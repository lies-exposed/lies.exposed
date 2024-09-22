import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type SimpleMedia } from "../simpleIMedia.type.js";
import { extractThumbnail } from "./extractThumbnail.flow.js";
import { type TEFlow } from "#flows/flow.types.js";

/**
 * Extract thumbnails from media and upload to s3
 * @param ctx - Route context {@type RouteContext}
 * @returns an array of thumbnail urls
 */
export const createThumbnail: TEFlow<[SimpleMedia], string[]> =
  (ctx) => (media) => {
    return pipe(
      extractThumbnail(ctx)(media),
      TE.chain((thumbnails) =>
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
  };
