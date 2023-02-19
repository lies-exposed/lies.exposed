import { type Actor, type Group, type Keyword } from "@liexp/shared/io/http";
import { ACTORS } from "@liexp/shared/io/http/Actor";
import { type SearchEvent } from "@liexp/shared/io/http/Events";
import * as React from "react";
import { ActorPageContent } from "../components/ActorPageContent";
import { ActorHierarchyEdgeBundlingGraph } from "../components/Graph/ActorHierarchyEdgeBundlingGraph";
import QueriesRenderer from "../components/QueriesRenderer";
import SEO from "../components/SEO";
import { Box } from "../components/mui";
import { EventsPanelBox } from "../containers/EventsPanel";
import { EventNetworkGraphBox } from "../containers/graphs/EventNetworkGraphBox";
import { type SearchEventsQueryInputNoPagination } from "../state/queries/SearchEventsQuery";
import { useGroupsQuery } from "../state/queries/groups.queries";
import { SplitPageTemplate } from "./SplitPageTemplate";
import subYears from 'date-fns/subYears';

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
      queries={{
        groups: useGroupsQuery(
          {
            pagination: { perPage: 20, page: 1 },
            sort: { field: "createdAt", order: "DESC" },
            filter: { members: [actor.id] },
          },
          false
        ),
      }}
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
                  label: "General",
                },
                {
                  label: "Events",
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
              <Box style={{ display: 'flex' }}>
                <ActorPageContent
                  actor={actor}
                  groups={groups}
                  onGroupClick={onGroupClick}
                  onActorClick={onActorClick}
                />
              </Box>

              <EventsPanelBox
                slide={false}
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

              <Box style={{ height: 600 }}>
                <EventNetworkGraphBox
                  type={ACTORS.value}
                  query={{
                    ids: [actor.id],
                    startDate: subYears(new Date(), 2).toISOString()
                  }}
                  selectedActorIds={[actor.id]}
                  onActorClick={onActorClick}
                  onGroupClick={onGroupClick}
                  onKeywordClick={onKeywordClick}
                  onEventClick={onEventClick}
                />
              </Box>
              <ActorHierarchyEdgeBundlingGraph
                actor={actor.id}
                width={600}
                onNodeClick={(n) => {}}
                onLinkClick={(ll) => {}}
              />
            </SplitPageTemplate>
          </Box>
        );
      }}
    />
  );
};

export default ActorTemplate;
