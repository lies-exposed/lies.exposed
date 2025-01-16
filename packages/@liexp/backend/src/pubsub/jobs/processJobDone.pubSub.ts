import * as t from "io-ts";
import { RedisPubSub } from "../../providers/redis/RedisPubSub.js";

export const ProcessJobDonePubSub = RedisPubSub(
  "job:process-done",
  t.strict({
    id: t.string,
    type: t.string,
  }),
);
