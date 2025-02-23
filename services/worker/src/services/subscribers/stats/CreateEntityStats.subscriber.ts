import { Subscriber } from "@liexp/backend/lib/providers/redis/Subscriber.js";
import { CreateEntityStatsPubSub } from "@liexp/backend/lib/pubsub/stats/createEntityStats.pubSub.js";
import { pipe } from "fp-ts/lib/function.js";
import { createEntityStats } from "../../../flows/stats/createStats.flow.js";
import { type RTE } from "../../../types.js";

export const CreateEntityStatsSubscriber = Subscriber(
  CreateEntityStatsPubSub,
  (payload): RTE<void> => pipe(createEntityStats(payload.type, payload.id)),
);
