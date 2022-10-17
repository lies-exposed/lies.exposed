import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { UUID } from "io-ts-types";
import { Equal } from 'typeorm';
import { EventV2Entity } from "@entities/Event.v2.entity";
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
      db.findOneOrFail(EventV2Entity, { where: { id: Equal(id) } }),
      TE.chain((event) =>
        db.save(EventV2Entity, [
          {
            ...event,
            ...scientificStudyData,
            payload: {
              ...event.payload,
              ...scientificStudyData.payload,
            },
            id,
          },
        ])
      ),
      TE.chain(([result]) =>
        db.findOneOrFail(EventV2Entity, {
          where: { id: Equal(result.id) },
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
