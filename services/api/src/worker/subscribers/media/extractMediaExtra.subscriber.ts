import { extractMediaExtra } from "@liexp/backend/lib/flows/media/extra/extractMediaExtra.flow.js";
import { Subscriber } from "@liexp/backend/lib/providers/redis/redis.provider.js";
import { ExtractMediaExtraPubSub } from "@liexp/backend/lib/pubsub/media/extractMediaExtra.pubSub.js";
import { MediaRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../context/context.type.js";
import { type TEReader } from "../../../flows/flow.types.js";

export const ExtractMediaExtraSubscriber = Subscriber(
  ExtractMediaExtraPubSub,
  (payload): TEReader<void> =>
    pipe(
      fp.RTE.Do,
      fp.RTE.bind("media", () =>
        MediaRepository.findOneOrFail<ServerContext>({
          where: { id: payload.id },
        }),
      ),
      fp.RTE.bind("extra", ({ media }) => extractMediaExtra(media)),
      fp.RTE.chain(({ media, extra }) =>
        MediaRepository.save([{ ...media, extra }]),
      ),
      fp.RTE.map(() => undefined),
    ),
);
