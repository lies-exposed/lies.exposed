import { type SearchEvent } from "@liexp/shared/lib/io/http/Events/index.js";
import { Group, Keyword, type Actor } from "@liexp/shared/lib/io/http/index.js";
import { formatDate } from "@liexp/shared/lib/utils/date.utils.js";
import subYears from "date-fns/subYears/index.js";
import * as React from "react";
import { GroupHierarchyEdgeBundlingGraph } from "../components/Graph/GroupHierarchyEdgeBundlingGraph.js";
import { GroupPageContent } from "../components/GroupPageContent.js";
import QueriesRenderer from "../components/QueriesRenderer.js";
import SEO from "../components/SEO.js";
import { Box, Grid } from "../components/mui/index.js";
import { EventsPanelBox } from "../containers/EventsPanel.js";
import { StatsPanelBox } from "../containers/StatsPanelBox.js";
import { EventsFlowGraphBox } from "../containers/graphs/EventsFlowGraphBox.js";
import { EventNetworkGraphBoxWithFilters } from "../containers/graphs/EventsNetworkGraphBox.js";
import { useEndpointQueries } from "../hooks/useEndpointQueriesProvider.js";
import { type SearchEventsQueryInputNoPagination } from "../state/queries/SearchEventsQuery.js";
import { SplitPageTemplate } from "./SplitPageTemplate.js";

export interface GroupTemplateProps {
  group: Group.Group;
  tab: number;
  query: SearchEventsQueryInputNoPagination;
  onTabChange: (t: number) => void;
  onActorClick: (a: Actor.Actor) => void;
  onGroupClick: (g: Group.Group) => void;
  onKeywordClick: (k: Keyword.Keyword) => void;
  onEventClick: (e: SearchEvent.SearchEvent) => void;
  onQueryChange: (q: SearchEventsQueryInputNoPagination, tab: number) => void;
}

export const GroupTemplate: React.FC<GroupTemplateProps> = ({
  group,
  tab,
  onTabChange,
  query,
  onQueryChange,
  onGroupClick,
  onActorClick,
  onKeywordClick,
  onEventClick,
}) => {
  const Queries = useEndpointQueries();
  return (
    <QueriesRenderer
      queries={{
        groupsMembers: Queries.GroupMember.list.useQuery(
          {
            filter: {
              group: group.id,
            },
          },
          undefined,
          false,
        ),
      }}
      render={({ groupsMembers }) => {
        return (
          <Box
            display="flex"
            flexDirection="column"
            height="100%"
            style={{ paddingTop: 20 }}
          >
            <SEO
              title={group.name}
              image={group.avatar}
              urlPath={`groups/${group.id}`}
            />
            <SplitPageTemplate
              tab={tab}
              onTabChange={onTabChange}
              aside={{
                name: group.name,
                avatar: group.avatar,
              }}
              tabs={[
                {
                  label: "General",
                },
                {
                  label: "Flow",
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
                name: Group.GROUPS.value,
                item: group,
              }}
            >
              <Grid
                container
                style={{
                  height: "100%",
                }}
              >
                <Grid item md={8}>
                  <GroupPageContent
                    group={group}
                    groupsMembers={groupsMembers.data}
                    funds={[]}
                    projects={[]}
                    onMemberClick={onActorClick}
                    onGroupClick={onGroupClick}
                    ownedGroups={[]}
                  />
                </Grid>

                <Grid item md={4}>
                  <StatsPanelBox
                    type="groups"
                    id={group.id}
                    onActorClick={onActorClick}
                    onGroupClick={onGroupClick}
                    onKeywordClick={onKeywordClick}
                  />
                </Grid>
              </Grid>

              <EventsFlowGraphBox
                type="groups"
                id={group.id}
                query={{}}
                onEventClick={onEventClick}
              />

              <EventsPanelBox
                query={{
                  ...query,
                  hash: `group-${group.id}`,
                  groups: query.groups
                    ? [...query.groups, group.id]
                    : [group.id],
                }}
                tab={0}
                onQueryChange={onQueryChange}
                onEventClick={onEventClick}
              />

              <EventNetworkGraphBoxWithFilters
                type={Group.GROUPS.value}
                query={{
                  ids: [group.id],
                  startDate: formatDate(subYears(new Date(), 2)),
                  endDate: formatDate(new Date()),
                }}
                relations={[Keyword.KEYWORDS.value]}
                onActorClick={onActorClick}
                onGroupClick={onGroupClick}
                onKeywordClick={onKeywordClick}
                onEventClick={onEventClick}
                onQueryChange={() => {}}
              />

              <GroupHierarchyEdgeBundlingGraph
                group={group.id}
                width={400}
                onNodeClick={(n) => {
                  onEventClick(n.data);
                }}
                onLinkClick={(ll) => {
                  // navigateTo.events(
                  //   {},
                  //   {
                  //     hash: queryToHash({
                  //       groups: ll.map((l) => l.data.id),
                  //     }),
                  //   }
                  // );
                }}
              />
            </SplitPageTemplate>
          </Box>
        );
      }}
    />
  );
};
