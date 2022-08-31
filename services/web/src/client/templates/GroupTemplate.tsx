import { EventType } from "@liexp/shared/io/http/Events";
import { GroupPageContent } from "@liexp/ui/components/GroupPageContent";
import { MainContent } from "@liexp/ui/components/MainContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import SEO from "@liexp/ui/components/SEO";
import { Box } from "@liexp/ui/components/mui";
import {
  useGroupMembersQuery,
  useGroupQuery,
} from "@liexp/ui/state/queries/DiscreteQueries";
import * as React from "react";
import { EventsPanel } from "../containers/EventsPanel";
import { queryToHash, useRouteQuery } from "../utils/history.utils";
import { useNavigateToResource } from "../utils/location.utils";

const GroupTemplate: React.FC<{ groupId: string }> = ({ groupId }) => {
  const navigateTo = useNavigateToResource();
  const { tab: _tab = "0" } = useRouteQuery();
  const tab = parseInt(_tab, 10);

  return (
    <QueriesRenderer
      queries={{
        group: useGroupQuery({ id: groupId }),
        groupsMembers: useGroupMembersQuery(
          {
            filter: {
              group: groupId,
            },
          },
          false
        ),
      }}
      render={({ group, groupsMembers }) => {
        return (
          <Box>
            <MainContent>
              <SEO
                title={group.name}
                image={group.avatar}
                urlPath={`groups/${group.id}`}
              />
              <GroupPageContent
                group={group}
                groupsMembers={groupsMembers.data}
                funds={[]}
                projects={[]}
                onMemberClick={(a) => {
                  navigateTo.actors({
                    id: a.id,
                  });
                }}
                onGroupClick={(g) => {
                  navigateTo.groups({
                    id: g.id,
                  });
                }}
                hierarchicalGraph={{
                  onNodeClick: (n) => {
                    navigateTo.events(
                      {},
                      {
                        hash: queryToHash({
                          groups: [n.data.id],
                        }),
                      }
                    );
                  },
                  onLinkClick: (ll) => {
                    navigateTo.events(
                      {},
                      {
                        hash: queryToHash({
                          groups: ll.map((l) => l.data.id),
                        }),
                      }
                    );
                  },
                }}
                ownedGroups={[]}
              />
            </MainContent>
            <EventsPanel
              hash={`group-${groupId}`}
              query={{
                groups: [group.id],
                groupsMembers: [],
                keywords: [],
                actors: [],
                locations: [],
                tab,
                startDate: undefined,
                endDate: new Date().toDateString(),
                type: EventType.types.map((t) => t.value),
                _sort: "date",
                _order: "DESC",
              }}
              actors={[]}
              groups={[]}
              groupsMembers={[]}
              keywords={[]}
              onQueryChange={({ tab }) => {
                navigateTo.groups({ id: group.id }, { tab });
              }}
            />
          </Box>
        );
      }}
    />
  );
};

export default GroupTemplate;
