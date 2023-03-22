import { Group, Keyword, type Actor } from "@liexp/shared/io/http";
import { type SearchEvent } from "@liexp/shared/io/http/Events";
import { formatDate } from '@liexp/shared/utils/date';
import subYears from 'date-fns/subYears';
import * as React from "react";
import { GroupHierarchyEdgeBundlingGraph } from "../components/Graph/GroupHierarchyEdgeBundlingGraph";
import { GroupPageContent } from "../components/GroupPageContent";
import QueriesRenderer from "../components/QueriesRenderer";
import SEO from "../components/SEO";
import { Box } from "../components/mui";
import { EventsPanelBox } from "../containers/EventsPanel";
import { EventNetworkGraphBoxWithFilters } from "../containers/graphs/EventNetworkGraphBox";
import { useGroupMembersQuery } from "../state/queries/DiscreteQueries";
import { type SearchEventsQueryInputNoPagination } from "../state/queries/SearchEventsQuery";
import { SplitPageTemplate } from "./SplitPageTemplate";

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
  return (
    <QueriesRenderer
      queries={{
        groupsMembers: useGroupMembersQuery(
          {
            filter: {
              group: group.id,
            },
          },
          false
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
              <GroupPageContent
                group={group}
                groupsMembers={groupsMembers.data}
                funds={[]}
                projects={[]}
                onMemberClick={onActorClick}
                onGroupClick={onGroupClick}
                ownedGroups={[]}
              />
              <EventsPanelBox
                slide={false}
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
              <Box style={{ height: 600 }}>
                <EventNetworkGraphBoxWithFilters
                  type={Group.GROUPS.value}
                  query={{
                    ids: [group.id],
                    startDate: formatDate(subYears(new Date(), 2)),
                    endDate: formatDate(new Date())
                  }}
                  relations={[
                    Keyword.KEYWORDS.value
                  ]}
                  onActorClick={onActorClick}
                  onGroupClick={onGroupClick}
                  onKeywordClick={onKeywordClick}
                  onEventClick={onEventClick}
                  onQueryChange={() => {}}
                />
              </Box>
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
