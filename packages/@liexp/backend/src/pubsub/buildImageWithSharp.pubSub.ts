import { BuildImageLayer } from "@liexp/shared/lib/io/http/admin/BuildImage.js";
import * as t from "io-ts";
import { UUID } from "io-ts-types";
import { RedisPubSub } from "../providers/redis/RedisPubSub.js";

export const BuildImageWithSharpPubSub = RedisPubSub(
  "image:build-with-sharp",
  t.strict({
    image: t.union([UUID, t.null]),
    layers: t.array(BuildImageLayer),
  }),
);
