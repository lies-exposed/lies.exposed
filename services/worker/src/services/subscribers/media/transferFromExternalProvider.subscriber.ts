import { Subscriber } from "@liexp/backend/lib/providers/redis/redis.provider.js";
import { TransferMediaFromExternalProviderPubSub } from "@liexp/backend/lib/pubsub/media/transferFromExternalProvider.pubSub.js";
import { MediaRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { transferFromExternalProvider } from "../../../flows/media/transferFromExternalProvider.flow.js";
import { type RTE } from "../../../types.js";

export const TransferFromExternalProviderSubscriber = Subscriber(
  TransferMediaFromExternalProviderPubSub,
  ({ mediaId, mimeType, url, fileName }): RTE<void> =>
    pipe(
      transferFromExternalProvider(mediaId, url, fileName, mimeType),
      fp.RTE.chain((location) =>
        MediaRepository.save([
          {
            id: mediaId,
            location,
          },
        ]),
      ),
      fp.RTE.map(() => undefined),
    ),
);
