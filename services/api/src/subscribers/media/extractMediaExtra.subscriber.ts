import {
  RedisPubSub,
  Subscriber,
} from "@liexp/backend/lib/providers/redis/redis.provider.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { pipe } from "fp-ts/lib/function.js";
import * as t from "io-ts";
import { UUID } from "io-ts-types";
import { type ServerContext } from "#context/context.type.js";
import { extractMediaExtra } from "#flows/media/extra/extractMediaExtra.flow.js";
import { type ControllerError } from "#io/ControllerError.js";
import { MediaRepository } from "#providers/db/entity-repository.provider.js";

const ExtractMediaExtraSubscriber = Subscriber(
  "media:extract-media-extra",
  t.strict({ id: UUID }),
  (payload) =>
    pipe(
      fp.RTE.Do,
      fp.RTE.bind("media", () =>
        MediaRepository.findOneOrFail({ where: { id: payload.id } }),
      ),
      fp.RTE.bind("extra", ({ media }) => extractMediaExtra(media)),
      fp.RTE.chain(({ media, extra }) =>
        MediaRepository.save([{ ...media, extra }]),
      ),
      fp.RTE.map(() => undefined),
    ),
);

export const ExtractMediaExtraPubSub = RedisPubSub<
  ServerContext,
  { id: UUID },
  ControllerError
>(ExtractMediaExtraSubscriber);
