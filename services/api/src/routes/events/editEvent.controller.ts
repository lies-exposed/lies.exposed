import { endpoints } from "@econnessione/shared";
import { EventEntity } from "@entities/Event.entity";
import { ImageEntity } from "@entities/Image.entity";
import { LinkEntity } from "@entities/Link.entity";
import { foldOptionals } from "@utils/foldOptionals.utils";
import { uuid } from "@utils/uuid.utils";
import { Router } from "express";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";

export const MakeEditEventRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    endpoints.Event.Edit,
    ({ params: { id }, body: { links, images, actors, groups, ...body } }) => {
      const optionalData = foldOptionals({
        ...body,
        actors: pipe(actors, O.map(A.map((a) => ({ id: a })))),
        groups: pipe(groups, O.map(A.map((g) => ({ id: g })))),
        images: pipe(
          images,
          O.map((imgs) =>
            imgs.map((i) => {
              const image = new ImageEntity();
              image.id = O.getOrElse(() => uuid())(i.id);
              image.location = i.location;
              image.description = O.toNullable(i.description);
              return image;
            })
          )
        ),
      });
      ctx.logger.debug.log("Update data %O", optionalData);
      return pipe(
        sequenceS(TE.taskEitherSeq)({
          links: pipe(
            links,
            O.fold(
              () => {
                return TE.right([]);
              },
              (ll) => {
                const newLinks = ll.map((l) => ({ ...l, event: { id } }));
                return ctx.db.save(LinkEntity, newLinks);
              }
            )
          ),
          event: ctx.db.save(EventEntity, [{ id, ...optionalData }]),
        }),
        TE.chain(() =>
          ctx.db.findOneOrFail(EventEntity, {
            where: { id },
            relations: ["images", "links"],
            loadRelationIds: {
              relations: ["actors", "groups"],
            },
          })
        ),
        TE.map((event) => ({
          body: {
            data: event,
          },
          statusCode: 200,
        }))
      );
    }
  );
};
