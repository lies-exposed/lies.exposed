import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import {
  CreateScientificStudyBody,
  CreateScientificStudyPlainBody,
} from "@liexp/shared/io/http/Events/ScientificStudy";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { UUID } from "io-ts-types";
import { Equal } from "typeorm";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { createEventFromURL } from "@flows/events/scientific-studies/createFromURL.flow";
import { ControllerError } from "@io/ControllerError";
import { toEventV2IO } from "@routes/events/eventV2.io";
import { Route, RouteContext } from "@routes/route.types";

const createScientificStudyFromPlainObject =
  (ctx: RouteContext) =>
  ({
    payload,
    ...body
  }: CreateScientificStudyPlainBody): TE.TaskEither<
    ControllerError,
    EventV2Entity
  > => {
    const scientificStudyData = {
      ...body,
      links: body.links.map((l) => {
        if (UUID.is(l)) {
          return {
            id: l,
          };
        }
        return {
          ...l,
        };
      }),
      media: body.media.map((l) => {
        if (UUID.is(l)) {
          return {
            id: l,
          };
        }
        return {
          ...l,
        };
      }),
      keywords: body.media.map((l) => {
        if (UUID.is(l)) {
          return {
            id: l,
          };
        }
        return {
          ...l,
        };
      }),
      payload,
    };

    return pipe(
      ctx.db.save(EventV2Entity, [
        {
          ...scientificStudyData,
        },
      ]),
      TE.chain(([result]) =>
        ctx.db.findOneOrFail(EventV2Entity, {
          where: { id: Equal(result.id) },
          loadRelationIds: {
            relations: ["media", "links", "keywords"],
          },
        })
      )
    );
  };

export const MakeCreateScientificStudyRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.ScientificStudy.Create, ({ body }) => {
    const scientificStudyTask = CreateScientificStudyBody.types[1].is(body)
      ? createEventFromURL(ctx)(body.url)
      : createScientificStudyFromPlainObject(ctx)(body);

    return pipe(
      scientificStudyTask,
      TE.chainEitherK(toEventV2IO),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 201,
      }))
    );
  });
};
