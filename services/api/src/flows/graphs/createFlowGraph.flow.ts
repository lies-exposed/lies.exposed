import path from "path";
import { fp } from "@liexp/core/lib/fp";
import { type Logger } from "@liexp/core/lib/logger";
import {
  getRelationIds,
  getTotals,
} from "@liexp/shared/lib/helpers/event/event";
import {
  type Actor,
  type Events,
  type Group,
  type Keyword,
  type Media,
} from "@liexp/shared/lib/io/http";
import {
  type GetNetworkQuery,
  type NetworkLink,
} from "@liexp/shared/lib/io/http/Network";
import {
  type FlowGraphOutput,
  type FlowGraphType,
} from "@liexp/shared/lib/io/http/graphs/FlowGraph";
import { toColor } from "@liexp/shared/lib/utils/colors";
import { differenceInDays, subYears } from "@liexp/shared/lib/utils/date";
import { pipe } from "fp-ts/function";
import { type UUID } from "io-ts-types/lib/UUID";
import { toEventV2IO } from "../../routes/events/eventV2.io";
import { cleanItemsFromSlateFields } from "../../utils/clean.utils";
import { fetchEventsByRelation } from "../events/fetchByRelations.flow";
import { fetchEventsRelations } from "../events/fetchEventsRelations.flow";
import { type TEFlow } from "../flow.types";

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
  (l: Logger) =>
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
  }): FlowGraphOutput => {
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
      totals: {
        uncategorized: 0,
        documentaries: 0,
        scientificStudies: 0,
        quotes: 0,
        patents: 0,
        transactions: 0,
        deaths: 0,
      },
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

export const createFlowGraph: TEFlow<
  [UUID, FlowGraphType, GetNetworkQuery],
  FlowGraphOutput
> =
  (ctx) =>
  (id, type, { relations, emptyRelations, ...query }) => {
    ctx.logger.debug.log(`Flow graph for %s (%s) %O`, type, id, query);
    const filePath = path.resolve(
      ctx.config.dirs.cwd,
      `temp/graphs/flows/${type}/${id}.json`,
    );

    const createFlowGraphTask = pipe(
      fetchEventsByRelation(ctx)(type, [id], {
        ...query,
        relations,
        emptyRelations,
      }),
      fp.TE.chainEitherK(({ results }) =>
        pipe(results.map(toEventV2IO), fp.A.sequence(fp.E.Applicative)),
      ),
      fp.TE.chain(fetchEventsRelations(ctx)),
      fp.TE.map(getFlowGraph(ctx.logger)),
    );

    return pipe(createFlowGraphTask, ctx.fs.getOlderThanOr(filePath, 6));
  };
