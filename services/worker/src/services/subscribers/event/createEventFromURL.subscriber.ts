import { createEventFromURL } from "@liexp/backend/lib/flows/event/createEventFromURL.flow.js";
import { Subscriber } from "@liexp/backend/lib/providers/redis/redis.provider.js";
import { CreateEventFromURLPubSub } from "@liexp/backend/lib/pubsub/events/createEventFromURL.pubSub.js";
import { UserRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { pipe } from "fp-ts/lib/function.js";
import { Equal } from "typeorm";
import { type RTE } from "../../../types.js";

export const CreateEventFromURLSubscriber = Subscriber(
  CreateEventFromURLPubSub,
  (payload): RTE<void> =>
    pipe(
      UserRepository.findOneOrFail({ where: { id: Equal(payload.userId) } }),
      fp.RTE.chain((user) =>
        createEventFromURL(user, payload.eventId, payload.url, payload.type),
      ),
      fp.RTE.map(() => undefined),
    ),
);
