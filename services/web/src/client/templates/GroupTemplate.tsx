import { ErrorBox } from "@liexp/ui/components/Common/ErrorBox";
import { Loader } from "@liexp/ui/components/Common/Loader";
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
import { GroupView, useNavigateToResource } from "../utils/location.utils";

const GroupTemplate: React.FC<Omit<GroupView, "view">> = ({ groupId, tab }) => {
  const navigateTo = useNavigateToResource();
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
      render={QR.fold(Loader, ErrorBox, ({ group, groupsMembers, events }) => {
        return (
          <Box>
            <MainContent>
              <SEO title={group.name} />
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
              />
            </MainContent>
            <EventsPanel
              hash={`group-${groupId}`}
              query={{
                groups: [group.id],
                groupsMembers: group.members,
                keywords: [],
                actors: [],
                tab: tab ?? 0,
                startDate: subYears(new Date(), 1).toDateString(),
                endDate: new Date().toDateString(),
              }}
              onQueryChange={() => undefined}
            />
          </Box>
        );
      })}
    />
  );
};

export default GroupTemplate;
