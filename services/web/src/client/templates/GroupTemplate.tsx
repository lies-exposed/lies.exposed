import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { EventType } from "@liexp/io/lib/http/Events/index.js";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import { GroupTemplate } from "@liexp/ui/lib/templates/GroupTemplate.js";
import { type SearchEventsQueryInputNoPagination } from "@liexp/ui/lib/state/queries/SearchEventsQuery.js";
import { useRouteQuery } from "@liexp/ui/lib/utils/history.utils.js";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils.js";

const GroupPage: React.FC<{ groupId: UUID }> = ({ groupId }) => {
  const navigateTo = useNavigateToResource();
  const { tab: _tab = "0", ...query } = useRouteQuery() as Record<string, string | string[]>;
  const tab =
    typeof _tab === 'string'
      ? parseInt(_tab, 10)
      : _tab != null
        ? parseInt(String(_tab[0]), 10)
        : 0;

  return (
    <QueriesRenderer
      queries={(Q) => ({ group: Q.Group.get.useQuery({ id: groupId }) })}
      render={({ group: { data: group } }) => {
        return (
          <GroupTemplate
            group={group}
            tab={tab}
            query={
              {
                actors: query.actors ?? [],
                groups: query.groups ?? [],
                keywords: query.keywords ?? [],
                groupsMembers: query.groupsMembers ?? [],
                media: query.media ?? [],
                locations: query.locations ?? [],
                _start: query._start ?? undefined,
                _end: query._end ?? undefined,
                _sort: query._sort ?? undefined,
                _order: query._order ?? undefined,
                startDate: query.startDate ?? undefined,
                endDate: query.endDate ?? undefined,
                eventType:
                  query.eventType ??
                  EventType.members.map((t) => t.literals[0]),
                q: query.q ?? undefined,
                hash: undefined,
              } as unknown as SearchEventsQueryInputNoPagination
            }
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
