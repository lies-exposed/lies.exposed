import {
  RedisPubSub,
  Subscriber,
} from "@liexp/backend/lib/providers/redis/redis.provider.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { pipe } from "fp-ts/lib/function.js";
import * as t from "io-ts";
import { UUID } from "io-ts-types";
import { generateThumbnailFlow } from "#flows/media/thumbnails/generateThumbnails.flow.js";

const GenerateThumbnailSubscriber = Subscriber(
  "media:generate-thumbnail",
  t.strict({ id: UUID }),
  (payload) =>
    pipe(
      generateThumbnailFlow(payload),
      fp.RTE.map(() => undefined),
    ),
);

export const GenerateThumbnailPubSub = RedisPubSub(GenerateThumbnailSubscriber);
