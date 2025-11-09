import { EventV2IO } from "@liexp/backend/lib/io/event/eventV2.io.js";
import { createEventQuery } from "@liexp/backend/lib/queries/events/createEvent.query.js";
import { EventRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  type CreateEventPlainBody,
  type Event,
} from "@liexp/shared/lib/io/http/Events/index.js";
import { Equal } from "typeorm";
import { type TEReader } from "#flows/flow.types.js";

export const createEvent = (body: CreateEventPlainBody): TEReader<Event> => {
  return pipe(
    createEventQuery(body),
    fp.RTE.chain((data) => EventRepository.save([data])),
    fp.RTE.chain(([event]) =>
      EventRepository.findOneOrFail({
        where: { id: Equal(event.id) },
        loadRelationIds: {
          relations: ["media", "links", "keywords"],
        },
      }),
    ),
    fp.RTE.chainEitherK((e) => EventV2IO.decodeSingle(e)),
  );
};
