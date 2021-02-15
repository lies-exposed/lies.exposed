import { endpoints } from "@econnessione/shared";
import { EventEntity } from "@entities/Event.entity";
import { foldOptionals } from "@utils/foldOptionals.utils";
import { sequenceS } from "fp-ts/lib/Apply";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { Route } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";

export const MakeCreateEventRoute: Route = (r, { s3, db, env }) => {
  AddEndpoint(r)(
    endpoints.Event.Create,
    ({ body: { endDate, images, ...body } }) => {
      const optionalData = foldOptionals({ endDate });
      return pipe(
        db.save(EventEntity, [{ ...body, ...optionalData }]),
        TE.chain(([actor]) =>
          sequenceS(TE.taskEither)({
            page: TE.right(actor),

            // avatar: pipe(
            //   s3.upload({
            //     Bucket: env.SPACE_BUCKET,
            //     Key: `groups/${actor.id}.jpg`,
            //     Body: getBufferFromBase64(avatar.src, "image"),
            //     ACL: "public-read",
            //     ContentType: "image/jpeg",
            //   }),
            //   TE.mapLeft((e) => ServerError())
            // ),
          })
        ),
        TE.chain(({ page }) =>
          db.findOneOrFail(EventEntity, {
            where: { id: page.id },
            loadRelationIds: true,
          })
        ),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 200,
        }))
      );
    }
  );
};
