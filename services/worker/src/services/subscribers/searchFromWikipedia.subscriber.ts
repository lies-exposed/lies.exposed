import { Subscriber } from "@liexp/backend/lib/providers/redis/Subscriber.js";
import { SearchFromWikipediaPubSub } from "@liexp/backend/lib/pubsub/searchFromWikipedia.pubSub.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { pipe } from "fp-ts/lib/function.js";
import { fetchAndCreateActorFromWikipedia } from "../../flows/actor/fetchAndCreateActorFromWikipedia.flow.js";
import { searchGroupAndCreateFromWikipedia } from "../../flows/group/fetchGroupFromWikipedia.js";
import { type RTE } from "../../types.js";

export const SearchFromWikipediaSubscriber = Subscriber(
  SearchFromWikipediaPubSub,
  (payload): RTE<void> =>
    pipe(
      fp.RTE.Do,
      fp.RTE.bind("createEntity", () => {
        if (payload.type === "Group") {
          return pipe(
            searchGroupAndCreateFromWikipedia(payload.search, "wikipedia"),
            fp.RTE.map(() => undefined),
          );
        }

        return pipe(
          fetchAndCreateActorFromWikipedia(payload.search, "wikipedia"),
          fp.RTE.map(() => undefined),
        );
      }),
      fp.RTE.map(() => undefined),
    ),
);
