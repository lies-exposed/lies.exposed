import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { sequenceS } from "fp-ts/lib/Apply";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { UUID } from "io-ts-types";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { ServerError } from "@io/ControllerError";
import { toEventV2IO } from "@routes/events/eventV2.io";
import { Route } from "@routes/route.types";

export const MakeEditScientificStudyRoute: Route = (
  r,
  { db, logger, urlMetadata }
) => {
  AddEndpoint(r)(Endpoints.ScientificStudy.Edit, ({ params: { id }, body }) => {
    const scientificStudyData = {
      ...body,
      media: body.media.map((l) => {
        if (UUID.is(l)) {
          return { id: l };
        }
        return {
          ...l,
        };
      }),
      links: body.links.map((l) => {
        if (UUID.is(l)) {
          return { id: l };
        }
        return {
          ...l,
        };
      }),
      keywords: body.keywords.map((k) => ({ id: k })),
    };

    return pipe(
      sequenceS(TE.ApplicativePar)({
        meta: urlMetadata.fetchMetadata(body.payload.url, (e) => ServerError()),
        event: db.findOneOrFail(EventV2Entity, { where: { id } }),
      }),
      TE.chain(({ meta, event }) =>
        db.save(EventV2Entity, [
          {
            ...event,
            ...scientificStudyData,
            payload: {
              ...event.payload,
              title: meta.title ?? body.payload.title,
            },
            id,
          },
        ])
      ),
      TE.chain(([result]) =>
        db.findOneOrFail(EventV2Entity, {
          where: { id: result.id },
          loadRelationIds: true,
        })
      ),
      TE.chainEitherK(toEventV2IO),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      }))
    );
  });
};
