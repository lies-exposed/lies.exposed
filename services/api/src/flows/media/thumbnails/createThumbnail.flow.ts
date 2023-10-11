import { fp } from "@liexp/core/lib/fp";
import { type Media } from "@liexp/shared/lib/io/http";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { extractThumbnail } from "./extractThumbnail.flow";
import { type TEFlow } from "@flows/flow.types";

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
