import { GetQueueProvider } from "@liexp/backend/lib/providers/queue.provider.js";
import { Subscriber } from "@liexp/backend/lib/providers/redis/Subscriber.js";
import { ProcessJobDonePubSub } from "@liexp/backend/lib/pubsub/jobs/processJobDone.pubSub.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { pipe } from "fp-ts/lib/function.js";
import { processDoneJob } from "../../../jobs/processOpenAIJobsDone.job.js";
import { type RTE } from "../../../types.js";

export const ProcessJobDoneSubscriber = Subscriber(
  ProcessJobDonePubSub,
  (payload): RTE<void> =>
    pipe(
      GetQueueProvider.queue(payload.type).getJob(payload.resource, payload.id),
      fp.RTE.chain(processDoneJob),
      fp.RTE.map(() => undefined),
    ),
);
