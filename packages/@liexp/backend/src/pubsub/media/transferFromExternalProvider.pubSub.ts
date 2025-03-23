import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { MediaType } from "@liexp/shared/lib/io/http/Media/MediaType.js";
import { Schema } from "effect";
import { RedisPubSub } from "../../providers/redis/RedisPubSub.js";

export const TransferMediaFromExternalProviderPubSub = RedisPubSub(
  "media:transfer-from-external-provider",
  Schema.decodeUnknownEither(
    Schema.Struct({
      mediaId: UUID,
      url: Schema.String,
      fileName: Schema.String,
      mimeType: MediaType,
    }),
  ),
);
