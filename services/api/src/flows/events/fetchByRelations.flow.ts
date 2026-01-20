import {
  type SearchEventOutput,
  searchEventV2Query,
} from "@liexp/backend/lib/queries/events/searchEventsV2.query.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { ACTORS } from "@liexp/io/lib/http/Actor.js";
import { type UUID } from "@liexp/io/lib/http/Common/index.js";
import { EVENTS } from "@liexp/io/lib/http/Events/index.js";
import { GROUPS } from "@liexp/io/lib/http/Group.js";
import { KEYWORDS } from "@liexp/io/lib/http/Keyword.js";
import {
  type GetNetworkQuery,
  type NetworkType,
} from "@liexp/io/lib/http/Network/Network.js";
import * as O from "effect/Option";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type TEReader } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";

export const fetchEventsByRelation =
  (
    type: NetworkType,
    ids: UUID[],
    { actors, groups, keywords }: GetNetworkQuery,
  ): TEReader<SearchEventOutput> =>
  (ctx) => {
    const nonEmptyIds = pipe(ids, fp.NEA.fromArray);

    return pipe(
      nonEmptyIds,
      TE.fromOption(() => toControllerError(new Error("ids can't be empty"))),
      TE.chain((ids) =>
        searchEventV2Query({
          ids: type === EVENTS.literals[0] ? O.some(ids) : O.none(),
          actors:
            type === ACTORS.literals[0]
              ? pipe(
                  ids.concat(
                    pipe(
                      actors,
                      fp.O.map((kk): readonly UUID[] => kk),
                      fp.O.getOrElse((): readonly UUID[] => []),
                    ),
                  ),
                  O.some,
                )
              : O.none(),
          groups:
            type === GROUPS.literals[0]
              ? pipe(
                  ids.concat(
                    pipe(
                      groups,
                      fp.O.map((kk): readonly UUID[] => kk),
                      fp.O.getOrElse((): readonly UUID[] => []),
                    ),
                  ),
                  O.some,
                )
              : O.none(),
          keywords:
            type === KEYWORDS.literals[0]
              ? pipe(
                  ids.concat(
                    pipe(
                      keywords,
                      fp.O.map((kk): readonly UUID[] => kk),
                      fp.O.getOrElse((): readonly UUID[] => []),
                    ),
                  ),
                  O.some,
                )
              : O.none(),
        })(ctx),
      ),
    );
  };
