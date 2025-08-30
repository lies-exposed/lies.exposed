import { searchEventsFromProvider } from "@liexp/backend/lib/flows/links/searchLinksWithProvider.flow.js";
import { getOneAdminOrFail } from "@liexp/backend/lib/flows/user/getOneUserOrFail.flow.js";
import { Subscriber } from "@liexp/backend/lib/providers/redis/Subscriber.js";
import { LinkPubSub } from "@liexp/backend/lib/pubsub/links/index.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { pipe } from "fp-ts/lib/function.js";
import { type WorkerContext } from "../../../context/context.js";
import { type WorkerError } from "../../../io/worker.error.js";
import { type RTE } from "../../../types.js";

export const SearchLinksSubscriber = Subscriber(
  LinkPubSub.SearchLinks,
  (body): RTE<void> =>
    pipe(
      fp.RTE.ask<WorkerContext, WorkerError>(),
      fp.RTE.chainTaskEitherK(getOneAdminOrFail),
      fp.RTE.chain((user) => searchEventsFromProvider(body, user)),
      fp.RTE.map(() => undefined),
    ),
);
