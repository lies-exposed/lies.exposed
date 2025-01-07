import { pipe, fp } from "@liexp/core/lib/fp/index.js";
import { SCIENTIFIC_STUDY } from "@liexp/shared/lib/io/http/Events/EventType.js";
import * as O from "fp-ts/lib/Option.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type DatabaseContext } from "../../context/db.context.js";
import { EventV2Entity } from "../../entities/Event.v2.entity.js";
import { type DBError } from "../../providers/orm/index.js";
import { DBService } from "../../services/db.service.js";

export const findByURL = <C extends DatabaseContext>(
  url: string,
): ReaderTaskEither<C, DBError, O.Option<EventV2Entity>> => {
  return pipe(
    DBService.execQuery((em) =>
      em
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
    fp.RTE.map((r) => O.fromNullable(r)),
  );
};
