import * as fs from "fs";
import path from "path";
import { fp } from "@liexp/core/fp";
import {
  getColorByEventType,
  getEventsMetadata,
  takeEventRelations,
} from "@liexp/shared/helpers/event/event";
import { getTitleForSearchEvent } from "@liexp/shared/helpers/event/getTitle.helper";
import { toSearchEvent } from "@liexp/shared/helpers/event/search-event";
import {
  type Actor,
  type Group,
  type Keyword,
  type Media,
} from "@liexp/shared/io/http";
import { ACTORS } from "@liexp/shared/io/http/Actor";
import { type SearchEvent } from "@liexp/shared/io/http/Events";
import { GROUPS } from "@liexp/shared/io/http/Group";
import { KEYWORDS } from "@liexp/shared/io/http/Keyword";
import { ValidContentType } from "@liexp/shared/io/http/Media";
import {
  type GetNetworkQuery,
  type NetworkGraphOutput,
  type NetworkGroupBy,
  type NetworkType,
} from "@liexp/shared/io/http/Network";
import { type EventNetworkDatum } from "@liexp/shared/io/http/Network/networks";
import { distanceFromNow } from "@liexp/shared/utils/date";
import { GetEncodeUtils } from "@liexp/shared/utils/encode.utils";
import { walkPaginatedRequest } from "@liexp/shared/utils/fp.utils";
import { differenceInHours } from "date-fns";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { sequenceS } from "fp-ts/lib/Apply";
import { pipe } from "fp-ts/lib/function";
import * as S from "fp-ts/string";
import { type UUID } from "io-ts-types/lib/UUID";
import { toControllerError, type ControllerError } from "@io/ControllerError";
import { toActorIO } from "@routes/actors/actor.io";
import { toEventV2IO } from "@routes/events/eventV2.io";
import { fetchRelations } from "@routes/events/queries/fetchEventRelations.utils";
import { searchEventV2Query } from "@routes/events/queries/searchEventsV2.query";
import { toGroupIO } from "@routes/groups/group.io";
import { toKeywordIO } from "@routes/keywords/keyword.io";
import { toImageIO } from "@routes/media/media.io";
import { type RouteContext } from "@routes/route.types";

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
            (ll) => ll.concat(eventLinks)
          )
        );

        return pipe(acc1, fp.Map.upsertAt(S.Eq)(relation.id, links));
      })
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
  }: GetEventGraphOpts
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
      } = getEventsMetadata(e);

      const eventTitle = getTitleForSearchEvent(e);

      const nonEmptyEventActors = pipe(
        allActors.filter((a) => eventActors.some((aa) => aa.id === a.id)),
        O.fromPredicate(A.isNonEmpty)
      );

      const nonEmptyEventGroups = pipe(
        allGroups.filter((a) => eventGroups.some((aa) => aa.id === a.id)),
        O.fromPredicate(A.isNonEmpty)
      );

      const nonEmptyEventKeywords = pipe(
        allKeywords.filter((a) => eventKeywords.some((aa) => aa.id === a.id)),
        O.fromPredicate(A.isNonEmpty)
      );

      const featuredImage = pipe(
        eventMedia,
        fp.A.filter((m) => ValidContentType.is(m.type)),
        fp.O.fromPredicate((mm) => mm.length > 0),
        fp.O.map((mm) => mm[0].location),
        fp.O.toUndefined
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
        actors: [],
        groups: [],
        label: eventTitle,
      };

      // console.log('actor links in acc', acc.actorLinks);
      const actorLinks = pipe(
        relations.includes(ACTORS.value) ? nonEmptyEventActors : O.none,
        O.getOrElse((): Actor.Actor[] => []),
        getRelationLinks(ACTORS.value, e)(acc.actorLinks)
      );

      // console.log("actor links", actorLinks);

      const groupLinks = pipe(
        relations.includes(GROUPS.value) ? nonEmptyEventGroups : O.none,
        O.getOrElse((): Group.Group[] => []),
        getRelationLinks(GROUPS.value, e)(acc.groupLinks)
      );

      const keywordLinks = pipe(
        relations.includes(KEYWORDS.value) ? nonEmptyEventKeywords : O.none,
        O.getOrElse((): Keyword.Keyword[] => []),
        getRelationLinks(KEYWORDS.value, e)(acc.keywordLinks)
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
      };
    }),
    ({ eventNodes, actorLinks, groupLinks, keywordLinks, ...r }) => {
      const dateRange = pipe(
        eventNodes,
        A.foldMap({
          empty: {
            startDate: new Date(),
            endDate: new Date(),
          },
          concat: (x, y) => ({
            startDate: new Date(
              Math.min(x.startDate.getTime(), y.startDate.getTime())
            ),
            endDate: new Date(
              Math.max(x.endDate.getTime(), y.endDate.getTime())
            ),
          }),
        })((f) => ({
          startDate: f.date,
          endDate: f.date,
        }))
      );

      return {
        ...r,
        actorLinks: fp.Map.toArray(S.Ord)(actorLinks).flatMap(
          ([_k, links]) => links
        ),
        groupLinks: fp.Map.toArray(S.Ord)(groupLinks).flatMap(
          ([_k, links]) => links
        ),
        keywordLinks: fp.Map.toArray(S.Ord)(keywordLinks).flatMap(
          ([_k, links]) => links
        ),
        events: eventNodes,
        actors: allActors,
        groups: allGroups,
        keywords: allKeywords,
        ...dateRange,
        media: [],
      };
    }
  );
};

interface Result {
  eventNodes: EventNetworkDatum[];
  eventLinks: NetworkLink[];
  selectedLinks: NetworkLink[];
  actorLinks: Map<string, NetworkLink[]>;
  groupLinks: Map<string, NetworkLink[]>;
  keywordLinks: Map<string, NetworkLink[]>;
}

const initialResult: Result = {
  eventNodes: [],
  eventLinks: [],
  selectedLinks: [],
  actorLinks: new Map(),
  groupLinks: new Map(),
  keywordLinks: new Map(),
};

export interface Graph {
  nodes: any[];
  links: any[];
}

export const createNetworkGraph =
  (ctx: RouteContext) =>
  (
    type: NetworkType,
    ids: UUID[],
    {
      relations: _relations,
      emptyRelations,
      startDate,
      endDate,
    }: GetNetworkQuery
  ): TE.TaskEither<ControllerError, NetworkGraphOutput> => {
    const relations = pipe(
      _relations,
      O.getOrElse((): NetworkGroupBy[] => [])
    );

    ctx.logger.debug.log("Getting network for %O", {
      type,
      ids,
    });

    const networkId = uniqueId.hash({ ids, relations });
    const filePath = path.resolve(
      process.cwd(),
      `temp/networks/${type}/${networkId}.json`
    );

    return pipe(
      TE.fromIOEither(
        fp.IOE.tryCatch(() => {
          const filePathDir = path.dirname(filePath);
          const tempFolderExists = fs.existsSync(filePathDir);
          if (!tempFolderExists) {
            ctx.logger.debug.log(
              "Folder %s does not exist, creating...",
              filePathDir
            );
            fs.mkdirSync(filePathDir, { recursive: true });
          }

          const statsExists = fs.existsSync(filePath);
          ctx.logger.debug.log(
            "Network file path %s exists? %s",
            path.relative(process.cwd(), filePath),
            statsExists
          );
          if (statsExists) {
            const { mtime } = fs.statSync(filePath);
            const hoursDelta = differenceInHours(new Date(), mtime);

            ctx.logger.debug.log(
              "Last network file update %s (%d h)",
              distanceFromNow(mtime),
              hoursDelta
            );

            return hoursDelta < 6;
          }

          return false;
        }, toControllerError)
      ),
      TE.chain((statsExist) => {
        if (statsExist) {
          return TE.fromIOEither(
            fp.IOE.tryCatch(() => {
              ctx.logger.debug.log(
                "Reading content from %s",
                path.relative(process.cwd(), filePath)
              );
              const content = fs.readFileSync(filePath, "utf-8");
              return JSON.parse(content);
            }, toControllerError)
          );
        }

        ctx.logger.debug.log("Creating graph for %s => %s", type, ids);

        return pipe(
          walkPaginatedRequest(ctx)(
            ({ skip, amount }) =>
              searchEventV2Query(ctx)({
                ids: pipe(
                  ids,
                  O.fromPredicate((tt) => tt.length > 0 && type === "events")
                ),
                actors: type === ACTORS.value ? O.some(ids) : O.none,
                groups: type === GROUPS.value ? O.some(ids) : O.none,
                keywords: type === KEYWORDS.value ? O.some(ids) : O.none,
                startDate: O.none,
                endDate: O.none,
                skip,
                take: amount,
                order: { date: "DESC" },
              }),
            (r) => r.total,
            (r) => r.results,
            0,
            50
          ),
          TE.chain((results) => {
            ctx.logger.debug.log("Events found %d", results.length);

            return pipe(
              results,
              fp.A.traverse(fp.E.Applicative)(toEventV2IO),
              fp.TE.fromEither,
              fp.TE.map((events) => ({
                ...takeEventRelations(events),
                events,
              })),
              fp.TE.chain(({ events, ...relations }) =>
                pipe(
                  fetchRelations(ctx)({
                    keywords: pipe(
                      relations.keywords,
                      O.fromPredicate((a) => a.length > 0)
                    ),
                    actors: pipe(
                      relations.actors,
                      O.fromPredicate((a) => a.length > 0)
                    ),
                    groups: pipe(
                      relations.groups,
                      O.fromPredicate((g) => g.length > 0)
                    ),
                    groupsMembers: O.some(relations.groupsMembers),
                    links: O.none,
                    media: pipe(
                      relations.media,
                      O.fromPredicate((m) => m.length > 0)
                    ),
                  }),
                  TE.map((relations) => ({ ...relations, events }))
                )
              ),
              TE.chain(({ events, ...relations }) =>
                sequenceS(TE.ApplicativePar)({
                  events: fp.TE.right(events),
                  actors: pipe(
                    relations.actors,
                    fp.A.traverse(fp.E.Applicative)(toActorIO),
                    fp.TE.fromEither
                  ),
                  groups: pipe(
                    relations.groups,
                    fp.A.traverse(fp.E.Applicative)((g) =>
                      toGroupIO({ ...g, members: [] })
                    ),
                    fp.TE.fromEither
                  ),
                  keywords: pipe(
                    relations.keywords,
                    fp.A.traverse(fp.E.Applicative)(toKeywordIO),
                    fp.TE.fromEither
                  ),
                  media: pipe(
                    relations.media,
                    fp.A.traverse(fp.E.Applicative)((m) =>
                      toImageIO({ ...m, links: [], keywords: [], events: [] })
                    ),
                    fp.TE.fromEither
                  ),
                })
              )
            );
          }),
          TE.map(({ events: _events, actors, groups, keywords, media }) => {
            const events = pipe(
              _events,
              fp.A.map((aa) =>
                toSearchEvent(aa, {
                  events: [],
                  actors: new Map(actors.map((a) => [a.id, a])),
                  groups: new Map(groups.map((g) => [g.id, g])),
                  keywords: new Map(keywords.map((k) => [k.id, k])),
                  media: new Map(media.map((m) => [m.id, m])),
                  groupsMembers: new Map(),
                })
              )
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
                O.getOrElse(() => true)
              ),
            });

            return eventGraph;
          }),
          TE.chainIOEitherK((graph) => {
            return fp.IOE.tryCatch(() => {
              fs.writeFileSync(filePath, JSON.stringify(graph));
              return graph;
            }, toControllerError);
          })
        );
      })
    );
  };
