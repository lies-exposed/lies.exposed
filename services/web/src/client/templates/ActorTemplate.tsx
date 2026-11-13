import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { EventType } from "@liexp/io/lib/http/Events/index.js";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import SEO from "@liexp/ui/lib/components/SEO.js";
import { Box } from "@liexp/ui/lib/components/mui/index.js";
import { ActorTemplate } from "@liexp/ui/lib/templates/ActorTemplate.js";
import { type SearchEventsQueryInputNoPagination } from "@liexp/ui/lib/state/queries/SearchEventsQuery.js";
import { useRouteQuery } from "@liexp/ui/lib/utils/history.utils.js";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils.js";

const ActorPage: React.FC<{ actorId: UUID }> = ({ actorId }) => {
  // const params = useParams();
  const navigateToResource = useNavigateToResource();
  const { tab: _tab = "0", ...query } = useRouteQuery() as Record<string, string | string[]>;
  const tab =
    typeof _tab === 'string'
      ? parseInt(_tab, 10)
      : _tab != null
        ? parseInt(String(_tab[0]), 10)
        : 0;

  return (
    <QueriesRenderer
      queries={(Q) => ({
        actor: Q.Actor.get.useQuery({ id: actorId }),
      })}
      render={({ actor: { data: actor } }) => {
        return (
          <Box style={{ height: "100%" }}>
            <SEO
              title={actor.fullName}
              image={actor.avatar?.thumbnail ?? actor.avatar?.location}
              urlPath={`actors/${actor.id}`}
            />
            <ActorTemplate
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
              onQueryChange={(q) => {
                navigateToResource.actors({ id: actor.id }, { ...q, tab });
              }}
              onTabChange={(t) => {
                navigateToResource.actors({ id: actor.id }, { tab: t });
              }}
              actor={actor}
              onGroupClick={(g) => {
                navigateToResource.groups({ id: g.id }, { tab: "0" });
              }}
              onActorClick={(a) => {
                navigateToResource.actors({ id: a.id }, { tab: "0" });
              }}
              onKeywordClick={(k) => {
                navigateToResource.keywords({ id: k.id }, { tab: "0" });
              }}
              onEventClick={(e) => {
                navigateToResource.events({ id: e.id });
              }}
            />
          </Box>
        );
      }}
    />
  );
};

export default ActorPage;
