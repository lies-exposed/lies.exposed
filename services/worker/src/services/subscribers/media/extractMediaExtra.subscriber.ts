import { type MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { extractMediaExtra } from "@liexp/backend/lib/flows/media/extra/extractMediaExtra.flow.js";
import { Subscriber } from "@liexp/backend/lib/providers/redis/redis.provider.js";
import { ExtractMediaExtraPubSub } from "@liexp/backend/lib/pubsub/media/extractMediaExtra.pubSub.js";
import { MediaRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { pipe } from "fp-ts/lib/function.js";
import { Equal } from "typeorm";
import { type RTE } from "../../../types.js";

export const ExtractMediaExtraSubscriber = Subscriber(
  ExtractMediaExtraPubSub,
  (payload): RTE<void> =>
    pipe(
      fp.RTE.Do,
      fp.RTE.bind(
        "media",
        (): RTE<MediaEntity> =>
          MediaRepository.findOneOrFail({
            where: { id: Equal(payload.id) },
          }),
      ),
      fp.RTE.bind("extra", ({ media }) => extractMediaExtra(media)),
      fp.RTE.chain(
        ({ media, extra }): RTE<MediaEntity> =>
          pipe(
            MediaRepository.save([{ ...media, extra }]),
            fp.RTE.map((s) => s[0]),
          ),
      ),
      fp.RTE.map(() => undefined),
    ),
);
