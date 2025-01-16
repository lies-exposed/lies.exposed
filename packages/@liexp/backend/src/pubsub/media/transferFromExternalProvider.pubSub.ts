import { MediaType } from "@liexp/shared/lib/io/http/Media/MediaType.js";
import * as t from "io-ts";
import { UUID } from "io-ts-types";
import { RedisPubSub } from "../../providers/redis/RedisPubSub.js";

export const TransferMediaFromExternalProviderPubSub = RedisPubSub(
  "media:transfer-from-external-provider",
  t.strict({
    mediaId: UUID,
    url: t.string,
    fileName: t.string,
    mimeType: MediaType,
  }),
);
