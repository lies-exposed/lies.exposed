import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import {
  QueueResourceNames,
  QueueTypes,
} from "@liexp/shared/lib/io/http/Queue/index.js";
import * as t from "io-ts";
import { RedisPubSub } from "../../providers/redis/RedisPubSub.js";

export const ProcessJobDonePubSub = RedisPubSub(
  "job:process-done",
  t.strict({
    id: UUID,
    type: QueueTypes,
    resource: QueueResourceNames,
  }),
);
