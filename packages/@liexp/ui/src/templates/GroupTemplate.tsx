import { fp } from "@liexp/core/fp";
import { Actor, Group, Keyword } from "@liexp/shared/io/http";
import { EventType, SearchEvent } from "@liexp/shared/io/http/Events";
import { GROUPS } from "@liexp/shared/io/http/Group";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { GroupHierarchyEdgeBundlingGraph } from "../components/Graph/GroupHierarchyEdgeBundlingGraph";
import { GroupPageContent } from "../components/GroupPageContent";
import QueriesRenderer from "../components/QueriesRenderer";
import SEO from "../components/SEO";
import { Box, Typography } from "../components/mui";
import { EventsPanel } from "../containers/EventsPanel";
import { EventNetworkGraphBox } from "../containers/graphs/EventNetworkGraphBox";
import { useGroupMembersQuery } from "../state/queries/DiscreteQueries";
import { SplitPageTemplate } from "./SplitPageTemplate";

export interface GroupTemplateProps {
  group: Group.Group;
  tab: number;
  onTabChange: (t: number) => void;
  onActorClick: (a: Actor.Actor) => void;
  onGroupClick: (g: Group.Group) => void;
  onKeywordClick: (k: Keyword.Keyword) => void;
  onEventClick: (e: SearchEvent.SearchEvent) => void;
}

export const GroupTemplate: React.FC<GroupTemplateProps> = ({
  group,
  tab,
  onTabChange,
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
          <Box>
            <SEO
              title={group.name}
              image={group.avatar}
              urlPath={`groups/${group.id}`}
            />
            <SplitPageTemplate
              tab={tab}
              onTabChange={onTabChange}
              sidebar={() => {
                return (
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="flex-end"
                    justifyContent="flex-end"
                  >
                    {pipe(
                      fp.O.fromNullable(group.avatar),
                      fp.O.fold(
                        () => <div />,
                        (src) => (
                          <img
                            src={src}
                            style={{
                              width: "100px",
                              marginRight: 20,
                              marginBottom: 60,
                            }}
                          />
                        )
                      )
                    )}
                    <Typography
                      variant="h4"
                      style={{ marginBottom: 50, textAlign: "right" }}
                    >
                      {group.name}
                    </Typography>
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
                name: GROUPS.value,
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
              <EventsPanel
                slide={false}
                query={{
                  hash: `group-${group.id}`,
                  groups: [group.id],
                  groupsMembers: [],
                  keywords: [],
                  actors: [],
                  locations: [],
                  media: [],
                  startDate: undefined,
                  endDate: new Date().toDateString(),
                  type: EventType.types.map((t) => t.value),
                  _sort: "date",
                  _order: "DESC",
                }}
                tab={0}
                actors={[]}
                groups={[]}
                groupsMembers={[]}
                keywords={[]}
                onQueryChange={(q, tab) => {
                  // navigateTo.groups({ id: group.id }, { tab });
                }}
                onEventClick={(e) => {
                  onEventClick(e);
                }}
              />
              <Box style={{ height: 600 }}>
                <EventNetworkGraphBox
                  type={Group.GROUPS.value}
                  id={group.id}
                  query={{
                    groupBy: Group.GROUPS.value,
                    emptyRelations: fp.O.none,
                  }}
                  onEventClick={onEventClick}
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
