import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { useGroupQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import { GroupTemplate } from "@liexp/ui/templates/GroupTemplate";
import { useRouteQuery } from "@liexp/ui/utils/history.utils";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const GroupPage: React.FC<{ groupId: string }> = ({ groupId }) => {
  const navigateTo = useNavigateToResource();
  const { tab: _tab = "0", ...query } = useRouteQuery();
  const tab = parseInt(_tab, 10);

  return (
    <QueriesRenderer
      queries={{ group: useGroupQuery({ id: groupId }) }}
      render={({ group }) => {
        return (
          <GroupTemplate
            group={group}
            tab={tab}
            query={query}
            onTabChange={(t) => {
              navigateTo.groups({ id: groupId }, { tab: t });
            }}
            onQueryChange={(q) => {
              navigateTo.groups({ id: groupId }, { ...q, tab });
            }}
            onEventClick={(e) => {
              navigateTo.events({ id: e.id });
            }}
            onKeywordClick={(k) => {
              navigateTo.keywords({ id: k.id });
            }}
            onActorClick={(a) => {
              navigateTo.actors({ id: a.id });
            }}
            onGroupClick={(g) => {
              navigateTo.groups({ id: g.id });
            }}
          />
        );
      }}
    />
  );
};

export default GroupPage;
