import { Subscriber } from "@liexp/backend/lib/providers/redis/Subscriber.js";
import { TransferMediaFromExternalProviderPubSub } from "@liexp/backend/lib/pubsub/media/transferFromExternalProvider.pubSub.js";
import { MediaRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { Schema } from "effect";
import { transferFromExternalProvider } from "../../../flows/media/transferFromExternalProvider.flow.js";
import { toWorkerError } from "../../../io/worker.error.js";
import { type RTE } from "../../../types.js";

export const TransferFromExternalProviderSubscriber = Subscriber(
  TransferMediaFromExternalProviderPubSub,
  ({ mediaId, mimeType, url, fileName }): RTE<void> =>
    pipe(
      Schema.decodeUnknownEither(URL)(url),
      fp.E.mapLeft(toWorkerError),
      fp.RTE.fromEither,
      fp.RTE.chain((parsedURL) =>
        transferFromExternalProvider(mediaId, parsedURL, fileName, mimeType),
      ),
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
