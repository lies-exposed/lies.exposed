import { type DBError } from "@liexp/backend/lib/providers/orm/index.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { SCIENTIFIC_STUDY } from "@liexp/shared/lib/io/http/Events/EventType.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { type RouteContext } from "#routes/route.types.js";

export const findByURL =
  ({ db }: RouteContext) =>
  (url: string): TE.TaskEither<DBError, O.Option<EventV2Entity>> => {
    return pipe(
      db.execQuery(() =>
        db.manager
          .createQueryBuilder(EventV2Entity, "event")
          .where("type = :type", { type: SCIENTIFIC_STUDY.value })
          .where("payload::jsonb ->> 'url' = :url", {
            url,
          })
          .loadAllRelationIds({
            relations: ["media", "keywords", "links"],
          })
          .getOne(),
      ),
      TE.map((r) => O.fromNullable(r)),
    );
  };
