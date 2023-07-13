import { fp } from "@liexp/core/lib/fp";
import { ACTORS } from "@liexp/shared/lib/io/http/Actor";
import { EVENTS } from "@liexp/shared/lib/io/http/Events";
import { GROUPS } from "@liexp/shared/lib/io/http/Group";
import { KEYWORDS } from "@liexp/shared/lib/io/http/Keyword";
import {
  type GetNetworkQuery,
  type NetworkType,
} from "@liexp/shared/lib/io/http/Network";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { type UUID } from "io-ts-types/lib/UUID";
import { type TEFlow } from "@flows/flow.types";
import { toControllerError } from "@io/ControllerError";
import {
  searchEventV2Query,
  type SearchEventOutput,
} from "@routes/events/queries/searchEventsV2.query";

export const fetchEventsByRelation: TEFlow<
  [NetworkType, UUID[], GetNetworkQuery],
  SearchEventOutput
> =
  (ctx) =>
  (type, ids, { actors, groups, keywords }) => {
    const nonEmptyIds = pipe(ids, fp.NEA.fromArray);

    return pipe(
      nonEmptyIds,
      TE.fromOption(() => toControllerError(new Error("ids can't be empty"))),
      TE.chain((ids) =>
        searchEventV2Query(ctx)({
          ids: type === EVENTS.value ? O.some(ids) : O.none,
          actors:
            type === ACTORS.value
              ? pipe(
                  ids.concat(
                    pipe(
                      actors,
                      fp.O.map((kk): UUID[] => kk),
                      fp.O.getOrElse((): UUID[] => []),
                    ),
                  ),
                  fp.O.some,
                )
              : O.none,
          groups:
            type === GROUPS.value
              ? pipe(
                  ids.concat(
                    pipe(
                      groups,
                      fp.O.map((kk): UUID[] => kk),
                      fp.O.getOrElse((): UUID[] => []),
                    ),
                  ),
                  fp.O.some,
                )
              : O.none,
          keywords:
            type === KEYWORDS.value
              ? pipe(
                  ids.concat(
                    pipe(
                      keywords,
                      fp.O.map((kk): UUID[] => kk),
                      fp.O.getOrElse((): UUID[] => []),
                    ),
                  ),
                  fp.O.some,
                )
              : O.none,
        }),
      ),
    );
  };
