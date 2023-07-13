import { fp } from "@liexp/core/lib/fp";
import {
  getColorByEventType,
  getEventMetadata,
  getTotals,
} from "@liexp/shared/lib/helpers/event/event";
import { getTitleForSearchEvent } from "@liexp/shared/lib/helpers/event/getTitle.helper";
import { toSearchEvent } from "@liexp/shared/lib/helpers/event/search-event";
import {
  type Actor,
  type Group,
  type Keyword,
  type Media,
} from "@liexp/shared/lib/io/http";
import { ACTORS } from "@liexp/shared/lib/io/http/Actor";
import { type SearchEvent } from "@liexp/shared/lib/io/http/Events";
import { type EventTotals } from "@liexp/shared/lib/io/http/Events/SearchEventsQuery";
import { GROUPS } from "@liexp/shared/lib/io/http/Group";
import { KEYWORDS } from "@liexp/shared/lib/io/http/Keyword";
import { ValidContentType } from "@liexp/shared/lib/io/http/Media";
import {
  type GetNetworkQuery,
  type NetworkGraphOutput,
  type NetworkGroupBy,
  type NetworkType,
} from "@liexp/shared/lib/io/http/Network";
import { type EventNetworkDatum } from "@liexp/shared/lib/io/http/Network/networks";
import { GetEncodeUtils } from "@liexp/shared/lib/utils/encode.utils";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import * as S from "fp-ts/string";
import { type UUID } from "io-ts-types/lib/UUID";
import { fetchEventsWithRelations } from "@flows/events/fetchWithRelations.flow";
import { type TEFlow } from "@flows/flow.types";

const uniqueId = GetEncodeUtils<
  {
    ids: UUID[];
    relations: NetworkType[];
  },
  { ids: string; relations: string }
>(({ ids, relations }) => ({
  ids: ids.join(","),
  relations: relations.join("-"),
}));

export interface NetworkLink {
  source: UUID;
  target: UUID;
  fill: string;
  value: number;
  stroke: string;
  sourceType: NetworkType;
}

type ItemType = Group.Group | Keyword.Keyword | Actor.Actor;

export const getRelationLinks =
  (relationType: NetworkType, ev: SearchEvent.SearchEvent) =>
  (relationLinks: Map<string, NetworkLink[]>) =>
  (relations: ItemType[]): Map<string, NetworkLink[]> => {
    return pipe(
      relations,
      A.reduce(relationLinks, (acc1, relation) => {
        const eventLinks: NetworkLink[] = [
          {
            source: relation.id,
            sourceType: relationType,
            target: ev.id,
            stroke: `#${relation.color}`,
            fill: `#${relation.color}`,
            value: 0,
          },
        ];

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
  events: SearchEvent.SearchEvent[];
  actors: Actor.Actor[];
  groups: Group.Group[];
  keywords: Keyword.Keyword[];
  media: Media.Media[];
  emptyRelations: boolean;
  relations: NetworkGroupBy[];
}

export const getEventGraph = (
  type: NetworkType,
  ids: UUID[],
  {
    events,
    actors: allActors,
    groups: allGroups,
    keywords: allKeywords,
    media: allMedia,
    relations,
  }: GetEventGraphOpts,
): NetworkGraphOutput => {
  return pipe(
    events,
    A.reduceWithIndex(initialResult, (index, acc, e) => {
      // get topic from relative directory

      const {
        actors: eventActors,
        groups: eventGroups,
        keywords: eventKeywords,
        media: eventMedia,
      } = getEventMetadata(e);

      const eventTitle = getTitleForSearchEvent(e);

      const nonEmptyEventActors = pipe(
        allActors.filter((a) => eventActors.some((aa) => aa.id === a.id)),
        O.fromPredicate(A.isNonEmpty),
      );

      const nonEmptyEventGroups = pipe(
        allGroups.filter((a) => eventGroups.some((aa) => aa.id === a.id)),
        O.fromPredicate(A.isNonEmpty),
      );

      const nonEmptyEventKeywords = pipe(
        allKeywords.filter((a) => eventKeywords.some((aa) => aa.id === a.id)),
        O.fromPredicate(A.isNonEmpty),
      );

      const featuredImage = pipe(
        eventMedia,
        fp.A.filter((m) => m && ValidContentType.is(m.type)),
        fp.O.fromPredicate((mm) => mm.length > 0),
        fp.O.map((mm) => mm[0].location),
        fp.O.toUndefined,
      );

      const eventDatum: EventNetworkDatum = {
        ...e,
        links: [],
        excerpt: {},
        body: {},
        payload: e.payload as any,
        deletedAt: undefined,
        image: featuredImage,
        title: eventTitle,
        selected: true,
        date: e.date,
        groupBy: [],
        actors: pipe(
          nonEmptyEventActors,
          O.getOrElse((): any[] => []),
        ),
        groups: [],
        label: eventTitle,
      };

      // console.log('actor links in acc', acc.actorLinks);
      const actorLinks = pipe(
        relations.includes(ACTORS.value) ? nonEmptyEventActors : O.none,
        O.getOrElse((): Actor.Actor[] => []),
        getRelationLinks(ACTORS.value, e)(acc.actorLinks),
      );

      // console.log("actor links", actorLinks);

      const groupLinks = pipe(
        relations.includes(GROUPS.value) ? nonEmptyEventGroups : O.none,
        O.getOrElse((): Group.Group[] => []),
        getRelationLinks(GROUPS.value, e)(acc.groupLinks),
      );

      const keywordLinks = pipe(
        relations.includes(KEYWORDS.value) ? nonEmptyEventKeywords : O.none,
        O.getOrElse((): Keyword.Keyword[] => []),
        getRelationLinks(KEYWORDS.value, e)(acc.keywordLinks),
      );

      const evLinks: NetworkLink[] =
        index > 0
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

      const evNodes: any[] = [...acc.eventNodes, eventDatum];

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
      const dateRange = pipe(
        eventNodes,
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
      );

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
        events: eventNodes,
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
  eventNodes: EventNetworkDatum[];
  eventLinks: NetworkLink[];
  selectedLinks: NetworkLink[];
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

export interface Graph {
  nodes: any[];
  links: any[];
}

export const createNetworkGraph: TEFlow<
  [NetworkType, UUID[], GetNetworkQuery],
  NetworkGraphOutput
> =
  (ctx) =>
  (
    type,
    ids,
    { relations: _relations, emptyRelations, startDate, endDate },
  ) => {
    const relations = pipe(
      _relations,
      O.getOrElse((): NetworkGroupBy[] => []),
    );

    ctx.logger.debug.log("Getting network for %O", {
      type,
      ids,
    });

    const networkId = uniqueId.hash({ ids, relations });
    const filePath = ctx.fs.resolve(`temp/networks/${type}/${networkId}.json`);

    ctx.logger.debug.log("Creating graph for %s => %s", type, ids);

    const nonEmptyIds = pipe(ids, fp.NEA.fromArray);
    const createNetworkGraphTask = pipe(
      fetchEventsWithRelations(ctx)(type, ids, {
        ids: nonEmptyIds,
        actors: type === ACTORS.value ? nonEmptyIds : O.none,
        groups: type === GROUPS.value ? nonEmptyIds : O.none,
        keywords: type === KEYWORDS.value ? nonEmptyIds : O.none,
        startDate: O.none,
        endDate: O.none,
        relations: O.some(relations),
        emptyRelations: O.none,
      }),
      TE.map(({ events: _events, actors, groups, keywords, media }) => {
        ctx.logger.debug.log(
          `Fetch actors (%d), groups (%d), keywords (%d)`,
          actors.length,
          groups.length,
          keywords.length,
        );
        const events = pipe(
          _events,
          fp.A.map((aa) =>
            toSearchEvent(aa, {
              actors: new Map(actors.map((a) => [a.id, a])),
              groups: new Map(groups.map((g) => [g.id, g])),
              keywords: new Map(keywords.map((k) => [k.id, k])),
              media: new Map(media.map((m) => [m.id, m])),
              groupsMembers: new Map(),
            }),
          ),
        );

        const eventGraph = getEventGraph(type, ids, {
          events,
          actors,
          groups,
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
      TE.chainFirst((graph) =>
        ctx.fs.writeObject(filePath, JSON.stringify(graph)),
      ),
    );

    return pipe(createNetworkGraphTask, ctx.fs.getOlderThanOr(filePath));
  };
