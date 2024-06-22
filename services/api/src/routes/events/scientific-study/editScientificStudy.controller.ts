import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import * as TE from "fp-ts/TaskEither";
import { type DeepPartial, Equal } from "typeorm";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { type MediaEntity } from "#entities/Media.entity.js";
import { toEventV2IO } from "#routes/events/eventV2.io.js";
import { type Route } from "#routes/route.types.js";

export const MakeEditScientificStudyRoute: Route = (
  r,
  { db, logger, urlMetadata },
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
      }) as DeepPartial<MediaEntity[]>,
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
        ]),
      ),
      TE.chain(([result]) =>
        db.findOneOrFail(EventV2Entity, {
          where: { id: Equal(result.id) },
          loadRelationIds: true,
        }),
      ),
      TE.chainEitherK(toEventV2IO),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      })),
    );
  });
};
