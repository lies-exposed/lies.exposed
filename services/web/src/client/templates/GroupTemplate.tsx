import { GroupPageContent } from "@liexp/ui/components/GroupPageContent";
import { MainContent } from "@liexp/ui/components/MainContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import SEO from "@liexp/ui/components/SEO";
import {
  useEventsQuery,
  useGroupMembersQuery,
  useGroupQuery,
} from "@liexp/ui/state/queries/DiscreteQueries";
import { Box } from "@material-ui/core";
import { subYears } from "date-fns";
import * as React from "react";
import { EventsPanel } from "../containers/EventsPanel";
import { useRouteQuery } from "../utils/history.utils";
import { useNavigateToResource } from "../utils/location.utils";

const GroupTemplate: React.FC<{ groupId: string }> = ({ groupId }) => {
  const navigateTo = useNavigateToResource();
  const { tab: _tab = "0" } = useRouteQuery();
  const tab = parseInt(_tab, 10);

  return (
    <QueriesRenderer
      queries={{
        group: useGroupQuery({ id: groupId }),
        groupsMembers: useGroupMembersQuery({
          pagination: {
            page: 1,
            perPage: 20,
          },
          sort: { field: "id", order: "DESC" },
          filter: {
            group: groupId,
          },
        }),
        events: useEventsQuery({
          pagination: {
            page: 1,
            perPage: 20,
          },
          sort: { field: "id", order: "DESC" },
          filter: {
            groups: [groupId],
          },
        }),
      }}
      render={({ group, groupsMembers, events }) => {
        return (
          <Box>
            <MainContent>
              <SEO
                title={group.name}
                image={group.avatar}
                urlPath={`groups/${group.id}`}
              />
              <GroupPageContent
                {...group}
                groupsMembers={groupsMembers.data}
                events={events.data}
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
                ownedGroups={[]}
              />
            </MainContent>
            <EventsPanel
              hash={`group-${groupId}`}
              query={{
                groups: [group.id],
                groupsMembers: group.members,
                keywords: [],
                actors: [],
                tab: tab,
                startDate: subYears(new Date(), 1).toDateString(),
                endDate: new Date().toDateString(),
                _sort: "createdAt",
                _order: "DESC",
              }}
              actors={[]}
              groups={[]}
              groupsMembers={[]}
              keywords={[]}
              onQueryChange={({ tab }) => {
                navigateTo.groups({ id: group.id }, { tab });
              }}
              onQueryClear={() => {
                navigateTo.groups({ id: group.id }, {});
              }}
            />
          </Box>
        );
      }}
    />
  );
};

export default GroupTemplate;
