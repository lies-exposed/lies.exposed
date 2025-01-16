import { extractEntitiesFromAnyCached } from "@liexp/backend/lib/flows/admin/nlp/extractEntitiesFromAny.flow.js";
import { Subscriber } from "@liexp/backend/lib/providers/redis/Subscriber.js";
import { ExtractEntitiesWithNLP } from "@liexp/backend/lib/pubsub/nlp/extractEntitiesWithNLP.pubSub.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { pipe } from "fp-ts/lib/function.js";
import { type RTE } from "../../../types.js";

export const ExtractEntitiesWithNLPSubscriber = Subscriber(
  ExtractEntitiesWithNLP,
  (payload): RTE<void> =>
    pipe(
      extractEntitiesFromAnyCached(payload),
      fp.RTE.map(() => undefined),
    ),
);
