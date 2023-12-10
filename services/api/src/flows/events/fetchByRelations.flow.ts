import { fp , pipe } from "@liexp/core/lib/fp/index.js";
import { ACTORS } from "@liexp/shared/lib/io/http/Actor.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import { EVENTS } from "@liexp/shared/lib/io/http/Events/index.js";
import { GROUPS } from "@liexp/shared/lib/io/http/Group.js";
import { KEYWORDS } from "@liexp/shared/lib/io/http/Keyword.js";
import {
  type GetNetworkQuery,
  type NetworkType,
} from "@liexp/shared/lib/io/http/Network.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type TEFlow } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";
import {
  searchEventV2Query,
  type SearchEventOutput,
} from "#routes/events/queries/searchEventsV2.query.js";

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
