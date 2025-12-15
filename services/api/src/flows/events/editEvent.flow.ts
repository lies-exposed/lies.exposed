import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { EventV2IO } from "@liexp/backend/lib/io/event/eventV2.io.js";
import { editEventQuery } from "@liexp/backend/lib/queries/events/editEvent.query.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import {
  type EditEventBody,
  type Event,
} from "@liexp/shared/lib/io/http/Events/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type TEReader } from "#flows/flow.types.js";

export const editEvent = (id: UUID, body: EditEventBody): TEReader<Event> => {
  return ({ db, logger, ...ctx }) => {
    return pipe(
      db.findOneOrFail(EventV2Entity, {
        where: { id: Equal(id) },
        relations: ["links", "media", "keywords"],
      }),

      TE.chain((event) => editEventQuery(event, body)({ db, logger, ...ctx })),
      LoggerService.TE.debug({ logger }, `Update data %O`),
      TE.chain((updateData) => db.save(EventV2Entity, [{ id, ...updateData }])),
      TE.chain(() =>
        db.findOneOrFail(EventV2Entity, {
          where: { id: Equal(id) },
          loadRelationIds: {
            relations: ["media", "links", "keywords"],
          },
        }),
      ),
      TE.chainEitherK(EventV2IO.decodeSingle),
    );
  };
};
