import path from "path";
import { getOlderThanOr } from "@liexp/backend/lib/flows/fs/getOlderThanOr.flow.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Logger } from "@liexp/core/lib/logger/index.js";
import { getTotals } from "@liexp/shared/lib/helpers/event/event.js";
import { getRelationIds } from "@liexp/shared/lib/helpers/event/getEventRelationIds.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import { EventTotalsMonoid } from "@liexp/shared/lib/io/http/Events/EventTotals.js";
import {
  type GetNetworkQuery,
  type NetworkLink,
} from "@liexp/shared/lib/io/http/Network/Network.js";
import {
  type FlowGraphOutput,
  type FlowGraphType,
} from "@liexp/shared/lib/io/http/graphs/FlowGraph.js";
import {
  type Actor,
  type Events,
  type Group,
  type Keyword,
  type Media,
} from "@liexp/shared/lib/io/http/index.js";
import { toColor } from "@liexp/shared/lib/utils/colors.js";
import {
  differenceInDays,
  subYears,
} from "@liexp/shared/lib/utils/date.utils.js";
import { EventV2IO } from "../../routes/events/eventV2.io.js";
import { cleanItemsFromSlateFields } from "../../utils/clean.utils.js";
import { fetchEventsByRelation } from "../events/fetchByRelations.flow.js";
import { fetchEventsRelations } from "../events/fetchEventsRelations.flow.js";
import { type TEReader, type Flow } from "../flow.types.js";
import { type RouteContext } from "#routes/route.types.js";

const ordByDate = pipe(
  fp.N.Ord,
  fp.Ord.contramap((n: Events.Event) => differenceInDays(n.date, new Date())),
);

const updateMap =
  (m: Map<string, any[]>, sourceType: NetworkLink["sourceType"]) =>
  (ids: any[], eId: string) => {
    return pipe(
      ids,
      fp.A.map((a) =>
        pipe(
          m,
          fp.Map.lookup(fp.S.Eq)(a.id),
          fp.O.chain((links) =>
            pipe(
              links,
              fp.A.last,
              fp.O.map((l) =>
                links.concat({
                  source: l.target,
                  stroke: toColor(a.color),
                  fill: toColor(a.color),
                  sourceType,
                  value: 1,
                  target: eId,
                }),
              ),
            ),
          ),
          fp.O.getOrElse(() => [
            {
              source: a.id,
              name: a.name ?? a.fullName,
              fill: toColor(a.color),
              stroke: toColor(a.color),
              sourceType,
              value: 1,
              target: eId,
            },
          ]),
          (links): [string, any[]] => [a.id, links],
        ),
      ),
      fp.A.reduce(m, (acc, [k, ll]) =>
        pipe(acc, fp.Map.upsertAt(fp.S.Eq)(k, ll)),
      ),
    );
  };

export const getFlowGraph =
  ({
    events,
    actors,
    groups,
    keywords,
    media,
  }: {
    events: Events.Event[];
    actors: Actor.Actor[];
    groups: Group.Group[];
    keywords: Keyword.Keyword[];
    media: Media.Media[];
  }) =>
  (l: Logger): FlowGraphOutput => {
    l.debug.log("Actors %O", actors);

    const { startDate, endDate } = pipe(
      events,
      fp.A.sortBy([ordByDate]),
      (arr) => ({
        startDate: pipe(
          arr,
          fp.A.head,
          fp.O.map((ev) => ev.date),
          fp.O.getOrElse(() => subYears(new Date(), 1)),
        ),
        endDate: pipe(
          arr,
          fp.A.last,
          fp.O.map((ev) => ev.date),
          fp.O.getOrElse(() => new Date()),
        ),
      }),
    );

    const initialResult = {
      actorLinks: new Map<string, any[]>(),
      groupLinks: new Map<string, any[]>(),
      keywordLinks: new Map<string, any[]>(),
      totals: EventTotalsMonoid.empty,
    };

    const graph = pipe(
      events,
      fp.A.reduce(initialResult, (acc, n) => {
        const {
          actors: eventActors,
          groups: eventGroups,
          keywords: eventKeywords,
        } = getRelationIds(n);

        const actorLinks = updateMap(acc.actorLinks, "actors")(
          actors.filter((a) => eventActors.includes(a.id)),
          n.id,
        );
        const groupLinks = updateMap(acc.groupLinks, "groups")(
          groups.filter((g) => eventGroups.includes(g.id)),
          n.id,
        );

        const keywordLinks = updateMap(acc.keywordLinks, "keywords")(
          keywords.filter((g) => eventKeywords.includes(g.id)),
          n.id,
        );

        return {
          groupLinks,
          actorLinks,
          keywordLinks,
          totals: getTotals(acc.totals, n),
        };
      }),
    );

    l.debug.log("Actor links %O", graph.actorLinks);

    const actorLinks = pipe(
      fp.Map.toArray(fp.S.Ord)(graph.actorLinks),
      fp.A.map(([k, links]) => links),
      fp.A.flatten,
    );

    l.debug.log("Actor links %O", actorLinks);

    const groupLinks = pipe(
      fp.Map.toArray(fp.S.Ord)(graph.groupLinks),
      fp.A.map(([k, links]) => links),
      fp.A.flatten,
    );

    const keywordLinks = pipe(
      fp.Map.toArray(fp.S.Ord)(graph.keywordLinks),
      fp.A.map(([k, links]) => links),
      fp.A.flatten,
    );

    return {
      startDate,
      endDate,
      events,
      groups: cleanItemsFromSlateFields(groups),
      actors: cleanItemsFromSlateFields(actors),
      keywords,
      media,
      eventLinks: [],
      selectedLinks: [],
      keywordLinks,
      actorLinks,
      groupLinks,
      totals: graph.totals,
    };
  };

export const getFilePath: Flow<[FlowGraphType, UUID], string> =
  (type, id) => (ctx) => {
    return path.resolve(
      ctx.config.dirs.cwd,
      `temp/graphs/flows/${type}/${id}.json`,
    );
  };

export const createFlowGraph = (
  type: FlowGraphType,
  id: UUID,
  { relations, emptyRelations, ...query }: GetNetworkQuery,
  isAdmin: boolean,
): TEReader<FlowGraphOutput> => {
  const createFlowGraphTask = pipe(
    fp.RTE.ask<RouteContext>(),
    fp.RTE.chainTaskEitherK(
      fetchEventsByRelation(type, [id], {
        ...query,
        relations,
        emptyRelations,
      }),
    ),
    fp.RTE.chainEitherK(({ results }) => pipe(results, EventV2IO.decodeMany)),
    fp.RTE.chain((events) => fetchEventsRelations(events, isAdmin)),
    fp.RTE.chain((results) =>
      fp.RTE.fromReader((ctx: RouteContext) =>
        getFlowGraph(results)(ctx.logger),
      ),
    ),
  );

  return pipe(
    fp.RTE.ask<RouteContext>(),
    fp.RTE.map(getFilePath(type, id)),
    fp.RTE.chain((fileName) =>
      getOlderThanOr(fileName, 6)(createFlowGraphTask),
    ),
  );
};
