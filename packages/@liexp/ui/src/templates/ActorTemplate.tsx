import { fp } from "@liexp/core/fp";
import { Actor, Group, Keyword } from "@liexp/shared/io/http";
import { ACTORS } from "@liexp/shared/io/http/Actor";
import { SearchEvent } from "@liexp/shared/io/http/Events";
import { KEYWORDS } from "@liexp/shared/io/http/Keyword";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { ActorPageContent } from "../components/ActorPageContent";
import { Avatar } from "../components/Common/Avatar";
import { ActorHierarchyEdgeBundlingGraph } from "../components/Graph/ActorHierarchyEdgeBundlingGraph";
import QueriesRenderer from "../components/QueriesRenderer";
import SEO from "../components/SEO";
import { Box, Typography } from "../components/mui";
import { EventsPanel } from "../containers/EventsPanel";
import { EventNetworkGraphBox } from "../containers/graphs/EventNetworkGraphBox";
import { useGroupsQuery } from "../state/queries/DiscreteQueries";
import { SearchEventsQueryInputNoPagination } from "../state/queries/SearchEventsQuery";
import { SplitPageTemplate } from "./SplitPageTemplate";

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
          <Box>
            <SEO
              title={actor.fullName}
              image={actor.avatar ?? ""}
              urlPath={`actors/${actor.id}`}
            />
            <SplitPageTemplate
              tab={tab}
              onTabChange={onTabChange}
              sidebar={({ className }) => {
                return (
                  <Box className={className}>
                    {pipe(
                      fp.O.fromNullable(actor.avatar),
                      fp.O.fold(
                        () => <div />,
                        (src) => (
                          <Avatar
                            size="xlarge"
                            src={src}
                            style={{ marginTop: 20, marginBottom: 60 }}
                          />
                        )
                      )
                    )}
                    <Typography variant="h4">{actor.fullName}</Typography>
                  </Box>
                );
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
              <ActorPageContent
                actor={actor}
                groups={groups}
                onGroupClick={onGroupClick}
                onActorClick={onActorClick}
                onEventClick={onEventClick}
              />

              <EventsPanel
                slide={false}
                keywords={[]}
                actors={[actor]}
                groups={groups}
                groupsMembers={[]}
                query={{
                  ...query,
                  hash: `actor-${actor.id}`,
                  actors: [actor.id],
                }}
                tab={0}
                onQueryChange={onQueryChange}
                onEventClick={onEventClick}
              />

              <Box style={{ height: 600 }}>
                <EventNetworkGraphBox
                  id={actor.id}
                  type={ACTORS.value}
                  query={{
                    groupBy: KEYWORDS.value,
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
