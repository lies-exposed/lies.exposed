import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID } from "io-ts-types";
import { In } from "typeorm";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { type TEFlow } from "#flows/flow.types.js";

export const mergeEventsFlow: TEFlow<[UUID[]], EventV2Entity> =
  (ctx) => (ids) => {
    return pipe(
      ctx.db.find(EventV2Entity, { where: { id: In(ids) } }),
      fp.TE.map((events) => events[0]),
    );
  };
