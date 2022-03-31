import { ErrorBox } from "@liexp/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@liexp/ui/components/Common/FullSizeLoader";
import { GroupPageContent } from "@liexp/ui/components/GroupPageContent";
import { MainContent } from "@liexp/ui/components/MainContent";
import SEO from "@liexp/ui/components/SEO";
import { Queries } from "@liexp/ui/providers/DataProvider";
import { Box } from "@material-ui/core";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import subYears from "date-fns/sub_years";
import * as React from "react";
import { EventsPanel } from "../containers/EventsPanel";
import { useRouteQuery } from "../utils/history.utils";
import { GroupView, useNavigateToResource } from "../utils/location.utils";

const GroupTemplate: React.FC<Omit<GroupView, "view">> = ({ groupId }) => {
  const navigateTo = useNavigateToResource();
  const { tab: _tab = "0" } = useRouteQuery();
  const tab = parseInt(_tab, 10);

  return (
    <WithQueries
      queries={{
        group: Queries.Group.get,
        groupsMembers: Queries.GroupMember.getList,
        events: Queries.Event.getList,
      }}
      params={{
        group: { id: groupId },
        groupsMembers: {
          pagination: {
            page: 1,
            perPage: 20,
          },
          sort: { field: "id", order: "DESC" },
          filter: {
            group: groupId,
          },
        },
        events: {
          pagination: {
            page: 1,
            perPage: 20,
          },
          sort: { field: "id", order: "DESC" },
          filter: {
            groups: [groupId],
          },
        },
      }}
      render={QR.fold(
        LazyFullSizeLoader,
        ErrorBox,
        ({ group, groupsMembers, events }) => {
          return (
            <Box>
              <MainContent>
                <SEO
                  title={group.name}
                  image={group.avatar}
                  urlPath={`/groups/${group.id}`}
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
                  }}
                  onQueryChange={({ tab }) => {
                    navigateTo.groups({ id: group.id }, { tab });
                  }}
                />
              </MainContent>
            </Box>
          );
        }
      )}
    />
  );
};

export default GroupTemplate;
