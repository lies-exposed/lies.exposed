import { getOlderThanOr } from "@liexp/backend/lib/flows/fs/getOlderThanOr.flow.js";
import { GetEncodeUtils } from "@liexp/backend/lib/utils/encode.utils.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  getColorByEventType,
  getTotals,
} from "@liexp/shared/lib/helpers/event/event.js";
import { getSearchEventRelations } from "@liexp/shared/lib/helpers/event/getSearchEventRelations.js";
import { getTitleForSearchEvent } from "@liexp/shared/lib/helpers/event/getTitle.helper.js";
import { toSearchEvent } from "@liexp/shared/lib/helpers/event/search-event.js";
import { ACTORS } from "@liexp/shared/lib/io/http/Actor.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import {
  EventTotalsMonoid,
  type EventTotals,
} from "@liexp/shared/lib/io/http/Events/EventTotals.js";
import { type SearchEvent } from "@liexp/shared/lib/io/http/Events/index.js";
import { GROUPS } from "@liexp/shared/lib/io/http/Group.js";
import { KEYWORDS } from "@liexp/shared/lib/io/http/Keyword.js";
import { ValidContentType } from "@liexp/shared/lib/io/http/Media/index.js";
import {
  type GetNetworkQuery,
  type NetworkGraphOutput,
  type NetworkGroupBy,
  type NetworkLink,
  type NetworkType,
} from "@liexp/shared/lib/io/http/Network/Network.js";
import { type EventNetworkDatum } from "@liexp/shared/lib/io/http/Network/Network.js";
import {
  type Actor,
  type Group,
  type Keyword,
  type Media,
} from "@liexp/shared/lib/io/http/index.js";
import { isNonEmpty } from "@liexp/shared/lib/utils/array.utils.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import { type Option } from "effect/Option";
import * as A from "fp-ts/lib/Array.js";
import * as S from "fp-ts/lib/string.js";
import { cleanItemsFromSlateFields } from "../../utils/clean.utils.js";
import { fetchEventsWithRelations } from "../events/fetchWithRelations.flow.js";
import { type TEReader } from "#flows/flow.types.js";

const uniqueId = GetEncodeUtils<
  {
    ids: readonly string[];
    relations: readonly string[];
    actors: readonly string[];
    groups: readonly string[];
    keywords: readonly string[];
  },
  {
    ids: string;
    relations: string;
    actors: string;
    groups: string;
    keywords: string;
  }
>(({ ids, relations, actors, groups, keywords }) => ({
  ids: ids.join(","),
  relations: relations.join("-"),
  actors: actors.join("-"),
  groups: groups.join("-"),
  keywords: keywords.join("-"),
}));

export const emptyGetNetworkQuery: GetNetworkQuery = {
  ids: O.none(),
  startDate: O.none(),
  endDate: O.none(),
  relations: O.some(["actors", "groups", "keywords"]),
  groups: O.none(),
  actors: O.none(),
  keywords: O.none(),
  emptyRelations: O.none(),
};

type ItemType = Group.Group | Keyword.Keyword | Actor.Actor;

export const getRelationLinks =
  (relationType: NetworkType, ev: SearchEvent.SearchEvent) =>
  (relationLinks: Map<string, NetworkLink[]>) =>
  (relations: ItemType[]): Map<string, NetworkLink[]> => {
    return pipe(
      relations,
      A.reduce(relationLinks, (acc1, relation) => {
        const eventLinks: NetworkLink[] = relation.id
          ? [
              {
                source: relation.id,
                sourceType: relationType,
                target: ev.id,
                stroke: `#${relation.color}`,
                fill: `#${relation.color}`,
                value: 0,
              },
            ]
          : [];

        const links = pipe(
          acc1,
          fp.Map.lookup(fp.S.Eq)(relation.id),
          fp.O.fold(
            () => eventLinks,
            (ll) => ll.concat(eventLinks),
          ),
        );

        return pipe(acc1, fp.Map.upsertAt(S.Eq)(relation.id, links));
      }),
    );
  };

interface GetEventGraphOpts {
  events: readonly SearchEvent.SearchEvent[];
  actors: readonly Actor.Actor[];
  groups: readonly Group.Group[];
  keywords: readonly Keyword.Keyword[];
  media: readonly Media.Media[];
  emptyRelations: boolean;
  relations: readonly NetworkGroupBy[];
}

export const getEventGraph = (
  type: NetworkType,
  ids: UUID[],
  {
    events,
    actors: allActors,
    groups: allGroups,
    keywords: allKeywords,
    media: _allMedia,
    relations,
  }: GetEventGraphOpts,
): NetworkGraphOutput => {
  return pipe(
    events,
    fp.A.reduceWithIndex(initialResult, (index, acc, e) => {
      // get topic from relative directory
      // console.log('event', e)
      const {
        actors: eventActors,
        groups: eventGroups,
        keywords: eventKeywords,
        media: eventMedia,
      } = getSearchEventRelations(e);

      const eventTitle = getTitleForSearchEvent(e);

      const nonEmptyEventActors = pipe(
        allActors.filter((a) => eventActors.some((aa) => aa.id === a.id)),
        O.fromNullable,
        O.filter(isNonEmpty),
      );

      const nonEmptyEventGroups = pipe(
        allGroups.filter((a) => eventGroups.some((aa) => aa.id === a.id)),
        O.fromNullable,
        O.filter(isNonEmpty),
      );

      const nonEmptyEventKeywords = pipe(
        allKeywords.filter((a) => eventKeywords.some((aa) => aa.id === a.id)),
        O.fromNullable,
        O.filter(isNonEmpty),
      );

      const featuredImage = pipe(
        eventMedia,
        fp.A.filter((m) => m && Schema.is(ValidContentType)(m.type)),
        fp.O.fromPredicate((mm) => mm.length > 0),
        fp.O.map((mm) => mm[0].thumbnail),
        fp.O.toUndefined,
      );

      const { body: _body, excerpt: _excerpt, ...cleanEvent } = e;
      const eventDatum: EventNetworkDatum = {
        ...cleanEvent,
        image: featuredImage,
        type: e.type,
        title: eventTitle,
        selected: true,
        date: e.date,
        groupBy: [],
        innerColor: getColorByEventType({ type: e.type }),
        outerColor: "transparent",
        actors: cleanItemsFromSlateFields(eventActors),
        groups: cleanItemsFromSlateFields(eventGroups),
        keywords: eventKeywords,
        label: eventTitle,
      };

      // console.log('actor links in acc', acc.actorLinks);
      const actorLinks = pipe(
        relations.includes(ACTORS.literals[0])
          ? nonEmptyEventActors
          : fp.O.none,
        fp.O.getOrElse((): Actor.Actor[] => []),
        getRelationLinks(ACTORS.literals[0], e)(acc.actorLinks),
      );

      // console.log("actor links", actorLinks);

      const groupLinks = pipe(
        relations.includes(GROUPS.literals[0])
          ? nonEmptyEventGroups
          : fp.O.none,
        fp.O.getOrElse((): Group.Group[] => []),
        getRelationLinks(GROUPS.literals[0], e)(acc.groupLinks),
      );

      const keywordLinks = pipe(
        relations.includes(KEYWORDS.literals[0])
          ? nonEmptyEventKeywords
          : fp.O.none,
        fp.O.getOrElse((): Keyword.Keyword[] => []),
        getRelationLinks(KEYWORDS.literals[0], e)(acc.keywordLinks),
      );

      const evLinks: NetworkLink[] =
        index > 0 && acc.eventNodes[index - 1]
          ? [
              {
                source: acc.eventNodes[index - 1].id,
                target: e.id,
                sourceType: "events",
                stroke: getColorByEventType({
                  type: acc.eventNodes[index - 1].type,
                }),
                fill: getColorByEventType({
                  type: acc.eventNodes[index - 1].type,
                }),
                value: 1,
              },
            ]
          : [];

      const selectedLinks: NetworkLink[] = ids.map((id) => ({
        source: e.id,
        target: id,
        stroke: getColorByEventType({
          type: e.type,
        }),
        fill: getColorByEventType({
          type: e.type,
        }),
        value: 0,
        sourceType: "events",
      }));

      // console.log("ev links", evLinks);

      const evNodes: readonly EventNetworkDatum[] = [
        ...acc.eventNodes,
        eventDatum,
      ];

      return {
        eventNodes: evNodes,
        eventLinks: [...acc.eventLinks, ...evLinks],
        actorLinks,
        groupLinks,
        keywordLinks,
        selectedLinks: [...acc.selectedLinks, ...selectedLinks],
        totals: getTotals(acc.totals, e),
      };
    }),
    ({ eventNodes, actorLinks, groupLinks, keywordLinks, ...r }) => {
      const dateRange =
        eventNodes.length > 0
          ? pipe(
              [...eventNodes],
              A.foldMap({
                empty: {
                  startDate: eventNodes[0].date,
                  endDate: eventNodes[eventNodes.length - 1].date,
                },
                concat: (x, y) => ({
                  startDate: new Date(
                    Math.min(x.startDate.getTime(), y.startDate.getTime()),
                  ),
                  endDate: new Date(
                    Math.max(x.endDate.getTime(), y.endDate.getTime()),
                  ),
                }),
              })((f) => ({
                startDate: f.date,
                endDate: f.date,
              })),
            )
          : { startDate: new Date(), endDate: new Date() };

      return {
        ...r,
        actorLinks: fp.Map.toArray(S.Ord)(actorLinks).flatMap(
          ([_k, links]) => links,
        ),
        groupLinks: fp.Map.toArray(S.Ord)(groupLinks).flatMap(
          ([_k, links]) => links,
        ),
        keywordLinks: fp.Map.toArray(S.Ord)(keywordLinks).flatMap(
          ([_k, links]) => links,
        ),
        events: [...eventNodes],
        actors: allActors,
        groups: allGroups,
        keywords: allKeywords,
        ...dateRange,
        media: [],
      };
    },
  );
};

interface Result {
  eventNodes: readonly EventNetworkDatum[];
  eventLinks: readonly NetworkLink[];
  selectedLinks: readonly NetworkLink[];
  actorLinks: Map<string, NetworkLink[]>;
  groupLinks: Map<string, NetworkLink[]>;
  keywordLinks: Map<string, NetworkLink[]>;
  totals: EventTotals;
}

const initialResult: Result = {
  eventNodes: [],
  eventLinks: [],
  selectedLinks: [],
  actorLinks: new Map(),
  groupLinks: new Map(),
  keywordLinks: new Map(),
  totals: EventTotalsMonoid.empty,
};

export const createNetworkGraph =
  (
    type: NetworkType,
    ids: UUID[],
    networkQuery: GetNetworkQuery,
    isAdmin: boolean,
  ): TEReader<NetworkGraphOutput> =>
  (ctx) => {
    const {
      relations: _relations,
      emptyRelations,
      actors,
      groups,
      keywords,
      startDate,
      endDate,
    } = networkQuery;

    const relations = pipe(
      _relations,
      O.getOrElse((): NetworkGroupBy[] => []),
    );

    ctx.logger.debug.log("Getting network for %O", {
      type,
      ids,
      actors,
      groups,
      keywords,
      startDate,
      endDate,
    });

    const keywordIds = pipe(
      keywords,
      fp.O.fold(
        () => [],
        (): UUID[] => [],
      ),
    );

    const networkId = uniqueId.hash({
      ids,
      relations,
      actors: pipe(
        actors,
        fp.O.fold(
          () => [],
          (): readonly UUID[] => [],
        ),
      ),
      groups: pipe(
        groups,
        fp.O.fold(
          () => [],
          (): UUID[] => [],
        ),
      ),
      keywords: keywordIds,
    });

    const filePath = ctx.fs.resolve(`temp/networks/${type}/${networkId}.json`);

    ctx.logger.debug.log("Creating graph for %s => %s", type, ids);

    const createNetworkGraphTask: TEReader<NetworkGraphOutput> = pipe(
      fetchEventsWithRelations(
        {
          ids: O.none(),
          actors:
            type === ACTORS.literals[0]
              ? pipe(
                  actors,
                  fp.O.map((arr) => arr.concat(ids) as [UUID, ...UUID[]]),
                  fp.O.alt(
                    () => fp.NEA.fromArray(ids) as Option<[UUID, ...UUID[]]>,
                  ),
                  fp.O.fold(
                    () => O.none(),
                    (arr) => O.some(arr),
                  ),
                )
              : actors,
          groups:
            type === GROUPS.literals[0]
              ? pipe(
                  groups,
                  fp.O.map((arr) => arr.concat(ids) as [UUID, ...UUID[]]),
                  fp.O.alt(
                    () => fp.NEA.fromArray(ids) as Option<[UUID, ...UUID[]]>,
                  ),
                  fp.O.fold(
                    () => O.none(),
                    (arr) => O.some(arr),
                  ),
                )
              : groups,
          keywords:
            type === KEYWORDS.literals[0]
              ? pipe(
                  keywords,
                  fp.O.map((arr) => arr.concat(ids) as [UUID, ...UUID[]]),
                  fp.O.alt(
                    () => fp.NEA.fromArray(ids) as Option<[UUID, ...UUID[]]>,
                  ),
                  fp.O.fold(
                    () => O.none(),
                    (arr) => O.some(arr),
                  ),
                )
              : keywords,
          startDate: O.none(),
          endDate: O.none(),
          relations: O.some(relations),
        },
        isAdmin,
      ),
      fp.RTE.map(({ events: _events, actors, groups, keywords, media }) => {
        ctx.logger.debug.log(`Total events fetched %d`, _events.length);
        ctx.logger.debug.log(
          `Fetch actors (%d), groups (%d), keywords (%d)`,
          actors.length,
          groups.length,
          keywords.length,
        );

        const cleanedActors = cleanItemsFromSlateFields(actors);
        const cleanedGroups = cleanItemsFromSlateFields(groups);

        const events = pipe(
          _events,
          fp.A.map((aa) =>
            toSearchEvent(aa, {
              actors: cleanedActors,
              groups: cleanedGroups,
              keywords: keywords,
              media: media,
              groupsMembers: [],
            }),
          ),
        );

        const eventGraph = getEventGraph(type, ids, {
          events,
          actors: cleanedActors,
          groups: cleanedGroups,
          keywords,
          media,
          relations,
          emptyRelations: pipe(
            emptyRelations,
            O.getOrElse(() => true),
          ),
        });

        return eventGraph;
      }),
    );

    return pipe(getOlderThanOr(filePath)(createNetworkGraphTask))(ctx);
  };
