import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { sequenceS } from "fp-ts/lib/Apply";
import { MediaEntity } from "@entities/Media.entity";
import { ControllerError } from "@io/ControllerError";
import { RouteContext } from "@routes/route.types";

export const deleteFromSpace =
  (ctx: RouteContext) =>
  (m: MediaEntity): TE.TaskEither<ControllerError, MediaEntity> => {
    ctx.logger.debug.log("Create media and upload %s", location);

    const mediaKey = `public/media/${m.id}`;
    return pipe(
      sequenceS(TE.ApplicativePar)({
        thumbnail: ctx.s3.deleteObject({
          Bucket: ctx.env.SPACE_BUCKET,
          Key: mediaKey,
        }),
        location: ctx.s3.deleteObject({
          Bucket: ctx.env.SPACE_BUCKET,
          Key: mediaKey,
        }),
      }),
      ctx.logger.debug.logInTaskEither("Result %O"),
      // TE.chain(({ location, thumbnail }) =>
      //   ctx.db.delete(MediaEntity, [m.id])
      // ),
      TE.map(() => m)
    );
  };
