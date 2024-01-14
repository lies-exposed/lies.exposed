import { ACTORS } from "@liexp/shared/lib/io/http/Actor.js";
import { type SearchEvent } from "@liexp/shared/lib/io/http/Events/index.js";
import {
  type Actor,
  type Group,
  type Keyword,
} from "@liexp/shared/lib/io/http/index.js";
import { formatDate } from "@liexp/shared/lib/utils/date.utils.js";
import subYears from "date-fns/subYears/index.js";
import * as React from "react";
import { ActorPageContent } from "../components/ActorPageContent.js";
import { ActorHierarchyEdgeBundlingGraph } from "../components/Graph/ActorHierarchyEdgeBundlingGraph.js";
import QueriesRenderer from "../components/QueriesRenderer.js";
import SEO from "../components/SEO.js";
import { Box, Grid } from "../components/mui/index.js";
import { EventsPanelBox } from "../containers/EventsPanel.js";
import { StatsPanelBox } from "../containers/StatsPanelBox.js";
import { EventsFlowGraphBox } from "../containers/graphs/EventsFlowGraphBox.js";
import { EventNetworkGraphBoxWithFilters } from "../containers/graphs/EventsNetworkGraphBox.js";
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
          {
            pagination: { perPage: 20, page: 1 },
            sort: { field: "createdAt", order: "DESC" },
            filter: { members: [actor.id] },
          },
          undefined,
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
              image={actor.avatar ?? ""}
              urlPath={`actors/${actor.id}`}
            />
            <SplitPageTemplate
              tab={tab}
              onTabChange={onTabChange}
              aside={{
                name: actor.fullName,
                avatar: actor.avatar,
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
              ]}
              resource={{
                name: ACTORS.value,
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
                  <Grid item md={6}>
                    <ActorPageContent
                      actor={actor}
                      groups={groups}
                      onGroupClick={onGroupClick}
                      onActorClick={onActorClick}
                    />
                    <ActorHierarchyEdgeBundlingGraph
                      actor={actor.id}
                      width={500}
                      onNodeClick={(n) => {}}
                      onLinkClick={(ll) => {}}
                    />
                  </Grid>
                  <Grid item md={6}>
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
                type={ACTORS.value}
                query={{
                  ...query,
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
                      actors: [actor.id].concat(q.actors ?? ([] as any[])),
                    },
                    tab,
                  );
                }}
              />
            </SplitPageTemplate>
          </Box>
        );
      }}
    />
  );
};

export default ActorTemplate;
