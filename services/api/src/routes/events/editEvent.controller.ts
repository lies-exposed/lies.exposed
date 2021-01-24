import { endpoints } from "@econnessione/shared";
import { foldOptionals } from "@utils/foldOptionals.utils";
import { Router } from "express";
import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";
import { EventImageEntity } from "./EventImage.entity";
import { EventLinkEntity } from "./EventLink.entity";
import { EventEntity } from "./event.entity";

export const MakeEditEventRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    endpoints.Event.Edit,
    ({ params: { id }, body: { links, images, actors, ...body } }) => {
      const optionalData = foldOptionals({
        ...body,
        actors: pipe(
          actors,
          O.map((acts) => acts.map((a) => ({ id: a })))
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
                return ctx.db.save(EventLinkEntity, newLinks);
              }
            )
          ),
          images: pipe(
            images,
            O.fold(
              () => {
                return TE.right([]);
              },
              (ll) => {
                return ctx.db.save(
                  EventImageEntity,
                  ll.map((l) => ({ ...l, event: { id } }))
                );
              }
            )
          ),
          event: ctx.db.save(EventEntity, [{ id, ...optionalData }]),
        }),
        TE.chain(() => ctx.db.findOneOrFail(EventEntity, { where: { id } })),
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
