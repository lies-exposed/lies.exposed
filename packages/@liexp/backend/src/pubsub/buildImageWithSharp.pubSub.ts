import { BuildImageLayer } from "@liexp/shared/lib/io/http/admin/BuildImage.js";
import * as t from "io-ts";
import { UUID } from "io-ts-types";
import { RedisPubSub } from "../providers/redis/RedisPubSub.js";

export const BuildImageWithSharpPubSub = RedisPubSub(
  "image:build-with-sharp",
  Schema.Struct({
    image: Schema.Union([UUID, Schema.Null]),
    layers: Schema.Array(BuildImageLayer),
  }),
);
