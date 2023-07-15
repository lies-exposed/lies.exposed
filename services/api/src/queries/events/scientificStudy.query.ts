import { type DBError } from "@liexp/backend/lib/providers/orm";
import { SCIENTIFIC_STUDY } from "@liexp/shared/lib/io/http/Events/EventType";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { type RouteContext } from "@routes/route.types";

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
