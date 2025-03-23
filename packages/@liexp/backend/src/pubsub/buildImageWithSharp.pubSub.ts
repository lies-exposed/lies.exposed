import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { BuildImageLayer } from "@liexp/shared/lib/io/http/admin/BuildImage.js";
import { Schema } from "effect";
import { RedisPubSub } from "../providers/redis/RedisPubSub.js";

export const BuildImageWithSharpPubSub = RedisPubSub(
  "image:build-with-sharp",
  Schema.decodeUnknownEither(
    Schema.Struct({
      image: Schema.Union(UUID, Schema.Null),
      layers: Schema.Array(BuildImageLayer),
    }),
  ),
);
