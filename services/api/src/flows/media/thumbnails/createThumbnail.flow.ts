import { fp , pipe } from "@liexp/core/lib/fp/index.js";
import { type Media } from "@liexp/shared/lib/io/http/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { extractThumbnail } from "./extractThumbnail.flow.js";
import { type TEFlow } from "#flows/flow.types.js";

export const createThumbnail: TEFlow<
  [Pick<Media.Media, "id" | "location" | "type">],
  string[]
> = (ctx) => (media) => {
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
