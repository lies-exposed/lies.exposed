import { MediaType } from "@liexp/shared/lib/io/http/Media/MediaType.js";
import * as t from "io-ts";
import { UUID } from "io-ts-types";
import { RedisPubSub } from "../../providers/redis/RedisPubSub.js";

export const TransferMediaFromExternalProviderPubSub = RedisPubSub(
  "media:transfer-from-external-provider",
  Schema.Struct({
    mediaId: UUID,
    url: Schema.String,
    fileName: Schema.String,
    mimeType: MediaType,
  }),
);
