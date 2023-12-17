import { EventType } from "@liexp/shared/lib/io/http/Events";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer";
import { GroupTemplate } from "@liexp/ui/lib/templates/GroupTemplate";
import { useRouteQuery } from "@liexp/ui/lib/utils/history.utils";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const GroupPage: React.FC<{ groupId: string }> = ({ groupId }) => {
  const navigateTo = useNavigateToResource();
  const { tab: _tab = "0", ...query } = useRouteQuery();
  const tab = parseInt(_tab, 10);

  return (
    <QueriesRenderer
      queries={(Q) => ({ group: Q.Group.get.useQuery({ id: groupId }) })}
      render={({ group }) => {
        return (
          <GroupTemplate
            group={group}
            tab={tab}
            query={{
              ...query,
              eventType: query.eventType ?? EventType.types.map((t) => t.value),
            }}
            onTabChange={(t) => {
              navigateTo.groups({ id: groupId }, { tab: t });
            }}
            onQueryChange={(q) => {
              navigateTo.groups({ id: groupId }, { ...q, tab });
            }}
            onEventClick={(e) => {
              navigateTo.events({ id: e.id }, { tab: 0 });
            }}
            onKeywordClick={(k) => {
              navigateTo.keywords(
                { id: k.id },
                {
                  tab: 0,
                },
              );
            }}
            onActorClick={(a) => {
              navigateTo.actors({ id: a.id }, { tab: 0 });
            }}
            onGroupClick={(g) => {
              navigateTo.groups({ id: g.id }, { ...query, tab: 0 });
            }}
          />
        );
      }}
    />
  );
};

export default GroupPage;
