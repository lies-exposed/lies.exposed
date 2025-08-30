import { type LinkEntity } from "@liexp/backend/lib/entities/Link.entity.js";
import { type MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { takeLinkScreenshot } from "@liexp/backend/lib/flows/links/takeLinkScreenshot.flow.js";
import { Subscriber } from "@liexp/backend/lib/providers/redis/Subscriber.js";
import { TakeLinkScreenshotPubSub } from "@liexp/backend/lib/pubsub/links/takeLinkScreenshot.pubSub.js";
import { LinkRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { pipe } from "fp-ts/lib/function.js";
import { Equal } from "typeorm";
import { type WorkerContext } from "../../../context/context.js";
import { type WorkerError } from "../../../io/worker.error.js";
import { type RTE } from "../../../types.js";

export const TakeLinkScreenshotSubscriber = Subscriber(
  TakeLinkScreenshotPubSub,
  ({ id }): RTE<void> =>
    pipe(
      fp.RTE.ask<WorkerContext, WorkerError>(),
      fp.RTE.chainTaskEitherK((ctx) =>
        LinkRepository.findOneOrFail({
          where: { id: Equal(id) },
          relations: ["image"],
        })(ctx),
      ),
      fp.RTE.chain((link) =>
        takeLinkScreenshot(link as LinkEntity & { image: MediaEntity | null }),
      ),
      fp.RTE.map(() => undefined),
    ),
);
