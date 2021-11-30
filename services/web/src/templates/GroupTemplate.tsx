import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { Loader } from "@econnessione/ui/components/Common/Loader";
import { GroupPageContent } from "@econnessione/ui/components/GroupPageContent";
import { MainContent } from "@econnessione/ui/components/MainContent";
import SEO from "@econnessione/ui/components/SEO";
import { Queries } from "@econnessione/ui/providers/DataProvider";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";
import { doUpdateCurrentView, GroupView } from "../utils/location.utils";
import { EventsPanel } from "@containers/EventsPanel";

const GroupTemplate: React.FC<Omit<GroupView, "view">> = ({ groupId, tab }) => {
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
          <MainContent>
            <SEO title={group.name} />
            <GroupPageContent
              {...group}
              groupsMembers={groupsMembers.data}
              events={events.data}
              funds={[]}
              projects={[]}
              onMemberClick={async (a) => {
                void doUpdateCurrentView({
                  view: "actor",
                  actorId: a.id,
                })();
              }}
            />
            <EventsPanel
              view={{
                view: "group",
                groupId,
              }}
              hash={`group-${groupId}`}
              filters={{
                groups: [group.id],
                groupsMembers: group.members,
              }}
              tab={tab}
            />
          </MainContent>
        );
      })}
    />
  );
};

export default GroupTemplate;
