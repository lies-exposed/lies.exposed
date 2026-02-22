import {
  isNonEmpty,
  type NonEmptyArray,
} from "@liexp/core/lib/fp/utils/NonEmptyArray.utils.js";
import { ACTORS } from "@liexp/io/lib/http/Actor.js";
import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import {
  EventType,
  type SearchEvent,
} from "@liexp/io/lib/http/Events/index.js";
import {
  type Actor,
  type Group,
  type Keyword,
} from "@liexp/io/lib/http/index.js";
import { formatDate } from "@liexp/shared/lib/utils/date.utils.js";
import { subYears } from "date-fns";
import { Schema } from "effect/index";
import * as React from "react";
import { ActorPageContent } from "../components/ActorPageContent.js";
import { ActorHierarchyEdgeBundlingGraph } from "../components/Graph/ActorHierarchyEdgeBundlingGraph.js";
import QueriesRenderer from "../components/QueriesRenderer.js";
import SEO from "../components/SEO.js";
import { ActorFamilyTree } from "../components/actors/ActorFamilyTree.js";
import { Box, Grid } from "../components/mui/index.js";
import { EventsPanelBox } from "../containers/EventsPanel.js";
import { StatsPanelBox } from "../containers/StatsPanelBox.js";
import { EventsFlowGraphBox } from "../containers/graphs/EventsFlowGraphBox.js";
import { EventNetworkGraphBoxWithFilters } from "../containers/graphs/EventsNetworkGraphBox/EventsNetworkGraphBox.js";
import { type SearchEventsQueryInputNoPagination } from "../state/queries/SearchEventsQuery.js";
import { SplitPageTemplate } from "./SplitPageTemplate.js";

export interface ActorTemplateProps {
  actor: Actor.Actor;
  tab: number;
  query: SearchEventsQueryInputNoPagination;
  onQueryChange: (q: SearchEventsQueryInputNoPagination, tab: number) => void;
  onTabChange: (t: number) => void;
  onActorClick: (a: Actor.Actor) => void;
  onGroupClick: (g: Group.Group) => void;
  onKeywordClick: (k: Keyword.Keyword) => void;
  onEventClick: (e: SearchEvent.SearchEvent) => void;
}

export const ActorTemplate: React.FC<ActorTemplateProps> = ({
  actor,
  tab,
  onTabChange,
  query,
  onQueryChange,
  onActorClick,
  onGroupClick,
  onKeywordClick,
  onEventClick,
}) => {
  // const params = useParams();

  return (
    <QueriesRenderer
      queries={(Queries) => ({
        groups: Queries.Group.list.useQuery(
          undefined,
          {
            members: [actor.id],
            _sort: "createdAt",
            _order: "DESC",
            _end: "20",
          },
          false,
          `actor-${actor.id}`,
        ),
      })}
      render={({ groups: { data: groups } }) => {
        return (
          <Box
            display="flex"
            flexDirection="row"
            height="100%"
            style={{ paddingTop: 20 }}
          >
            <SEO
              title={actor.fullName}
              image={actor.avatar?.location}
              urlPath={`actors/${actor.id}`}
            />
            <SplitPageTemplate
              tab={tab}
              onTabChange={onTabChange}
              aside={{
                id: actor.id,
                name: actor.fullName,
                avatar: actor.avatar,
                nationalities: actor.nationalities.filter((n) =>
                  Schema.is(UUID)(n),
                ),
              }}
              tabs={[
                {
                  label: "Events",
                },
                {
                  label: "Flow",
                },
                {
                  label: "General",
                },
                {
                  label: "Networks",
                },
                {
                  label: "Hierarchy",
                },
                {
                  label: "Family Tree",
                },
              ]}
              resource={{
                name: ACTORS.literals[0],
                item: actor,
              }}
            >
              <EventsPanelBox
                query={{
                  ...query,
                  hash: `actor-${actor.id}`,
                  actors: query.actors
                    ? [...query.actors, actor.id]
                    : [actor.id],
                }}
                tab={0}
                onQueryChange={onQueryChange}
                onEventClick={onEventClick}
              />

              <EventsFlowGraphBox
                type="actors"
                id={actor.id}
                query={{}}
                onEventClick={onEventClick}
              />

              <Box style={{ display: "flex" }}>
                <Grid container>
                  <Grid size={6}>
                    <ActorPageContent
                      actor={actor}
                      groups={groups}
                      onGroupClick={onGroupClick}
                      onActorClick={onActorClick}
                    />
                  </Grid>
                  <Grid size={6}>
                    <StatsPanelBox
                      type="actors"
                      id={actor.id}
                      onKeywordClick={onKeywordClick}
                      onGroupClick={onGroupClick}
                      onActorClick={onActorClick}
                    />
                  </Grid>
                </Grid>
              </Box>

              <EventNetworkGraphBoxWithFilters
                type={ACTORS.Type}
                query={{
                  ...query,
                  relations: ["actors", "groups", "keywords"],
                  actors:
                    query.actors && isNonEmpty(query.actors)
                      ? query.actors
                      : null,
                  groups:
                    query.groups && isNonEmpty(query.groups)
                      ? query.groups
                      : null,
                  keywords:
                    query.keywords && isNonEmpty(query.keywords)
                      ? query.keywords
                      : null,
                  eventType:
                    Array.isArray(query.eventType) &&
                    isNonEmpty(query.eventType)
                      ? query.eventType
                      : typeof query.eventType === "string"
                        ? [query.eventType]
                        : (EventType.members.map(
                            (t) => t.literals[0],
                          ) as unknown as NonEmptyArray<EventType>),
                  ids: [actor.id],
                  startDate: formatDate(subYears(new Date(), 2)),
                  endDate: formatDate(new Date()),
                }}
                onActorClick={onActorClick}
                onGroupClick={onGroupClick}
                onKeywordClick={onKeywordClick}
                onEventClick={onEventClick}
                onQueryChange={(q) => {
                  onQueryChange(
                    {
                      ...q,
                      actors: [actor.id, ...(q.actors ?? [])],
                    },
                    tab,
                  );
                }}
              />
              <ActorHierarchyEdgeBundlingGraph
                actor={actor.id}
                width={500}
                onNodeClick={(_n) => {}}
                onLinkClick={(_ll) => {}}
              />

              <ActorFamilyTree actorId={actor.id} />
            </SplitPageTemplate>
          </Box>
        );
      }}
    />
  );
};
