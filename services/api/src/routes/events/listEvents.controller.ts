import { EventV2IO } from "@liexp/backend/lib/io/event/eventV2.io.js";
import { searchEventV2Query } from "@liexp/backend/lib/queries/events/searchEventsV2.query.js";
import { getORMOptions } from "@liexp/backend/lib/utils/orm.utils.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { EventType } from "@liexp/shared/lib/io/http/Events/index.js";
import {
  type Actor,
  type Events,
  type Group,
  type GroupMember,
  type Keyword,
  type Link,
  type Media,
} from "@liexp/shared/lib/io/http/index.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import * as TE from "fp-ts/lib/TaskEither.js";
import {
  fetchEventsRelations,
  type RelationType,
} from "../../flows/events/fetchEventsRelations.flow.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

interface FetchedRelations {
  actors: readonly Actor.Actor[];
  groups: readonly Group.Group[];
  keywords: readonly Keyword.Keyword[];
  media: readonly Media.Media[];
  links: readonly Link.Link[];
  groupsMembers: readonly GroupMember.GroupMember[];
}

export const ListEventRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Event.List, ({ query }) => {
    ctx.logger.debug.log("Query %O", query);
    const {
      actors,
      groups,
      groupsMembers,
      links,
      keywords,
      media,
      locations,
      draft,
      startDate,
      endDate,
      eventType: _type,
      q,
      exclude,
      withDeleted,
      withDrafts,
      emptyActors: _emptyActors,
      emptyGroups: _emptyGroups,
      emptyKeywords: _emptyKeywords,
      emptyLinks,
      emptyMedia,
      ids,
      spCount,
      onlyUnshared,
      relations,
      ...queryRest
    } = query;

    const relationsFilter = pipe(
      relations,
      O.map((r) => r as RelationType[]),
      O.getOrElse((): RelationType[] => []),
    );

    // ctx.logger.debug.log("query %O", queryRest);

    const findOptions = getORMOptions(
      {
        ...queryRest,
        _sort: pipe(
          queryRest._sort,
          O.orElse(() => O.some("date")),
        ),
      },
      ctx.env.DEFAULT_PAGE_SIZE,
    );

    const type = pipe(
      _type,
      O.map((tp) => (Schema.is(Schema.Array(EventType))(tp) ? tp : [])),
    );

    ctx.logger.debug.log("find options %O", findOptions);

    return pipe(
      searchEventV2Query({
        actors,
        groups,
        groupsMembers,
        keywords,
        links,
        locations,
        type,
        q,
        startDate,
        endDate,
        media,
        exclude,
        draft,
        ids,
        withDeleted: O.getOrElse(() => false)(withDeleted),
        withDrafts: O.getOrElse(() => false)(withDrafts),
        emptyMedia,
        emptyLinks,
        spCount,
        onlyUnshared,
        ...findOptions,
      })(ctx),
      TE.chain(({ results, ...rest }) =>
        pipe(
          results,
          EventV2IO.decodeMany,
          TE.fromEither,
          TE.chain((events: readonly Events.Event[]) =>
            relationsFilter.length > 0
              ? pipe(
                  fetchEventsRelations(events, false, {
                    relations: relationsFilter,
                  })(ctx),
                  TE.map(
                    ({
                      events: _,
                      ...fetchedRelations
                    }): {
                      events: readonly Events.Event[];
                      relations: FetchedRelations | undefined;
                    } => ({
                      events,
                      relations: fetchedRelations,
                    }),
                  ),
                )
              : TE.right<
                  never,
                  {
                    events: readonly Events.Event[];
                    relations: FetchedRelations | undefined;
                  }
                >({ events, relations: undefined }),
          ),
          TE.map(({ events, relations }) => ({
            data: events.map((d) => ({
              ...d,
              // TODO: fix this
              score: 1 as const,
            })),
            relations,
            ...rest,
          })),
        ),
      ),
      TE.map(({ data, relations, total, totals, firstDate, lastDate }) => ({
        body: {
          data,
          total,
          totals,
          firstDate: firstDate?.toISOString(),
          lastDate: lastDate?.toISOString(),
          ...(relations ?? {}),
        },
        statusCode: 200,
      })),
    );
  });
};
