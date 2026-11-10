import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { EventType } from "@liexp/io/lib/http/Events/index.js";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import SEO from "@liexp/ui/lib/components/SEO.js";
import { Box } from "@liexp/ui/lib/components/mui/index.js";
import { ActorTemplate } from "@liexp/ui/lib/templates/ActorTemplate.js";
import { useRouteQuery } from "@liexp/ui/lib/utils/history.utils.js";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils.js";
import { toString, toStringArray } from "../utils/query.utils.js";

const ActorPage: React.FC<{ actorId: UUID }> = ({ actorId }) => {
  // const params = useParams();
  const navigateToResource = useNavigateToResource();
  const rawQuery = useRouteQuery<Record<string, string | string[]>>();
  const tab = React.useMemo(() => {
    const rawTab = rawQuery.tab;
    return typeof rawTab === "string"
      ? parseInt(rawTab, 10)
      : rawTab !== undefined && rawTab.length > 0
        ? parseInt(rawTab[0], 10)
        : 0;
  }, [rawQuery.tab]);

  const query = React.useMemo(() => {
    const eventType = rawQuery.eventType;
    const slideRaw = rawQuery.slide;
    return {
      actors: toStringArray(rawQuery.actors),
      groups: toStringArray(rawQuery.groups),
      groupsMembers: toStringArray(rawQuery.groupsMembers),
      keywords: toStringArray(rawQuery.keywords),
      media: toStringArray(rawQuery.media),
      locations: toStringArray(rawQuery.locations),
      startDate: toString(rawQuery.startDate),
      endDate: toString(rawQuery.endDate),
      eventType:
        eventType !== undefined
          ? toStringArray(eventType) as ("Book" | "Death" | "Documentary" | "Patent" | "Quote" | "ScientificStudy" | "Transaction" | "Uncategorized")[]
          : EventType.members.map((t) => t.literals[0]),
      q: toString(rawQuery.q),
      _order: toString(rawQuery._order),
      _sort: toString(rawQuery._sort),
      hash: toString(rawQuery.hash),
      slide: slideRaw !== undefined ? (toString(slideRaw) === "1" ? true : false) : undefined,
    };
  }, [rawQuery]);

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
              query={query as any}
              onQueryChange={(q) => {
                const navQuery: Record<string, string | string[]> = {};
                for (const [key, value] of Object.entries(q)) {
                  if (value !== undefined && value !== null) {
                    navQuery[key] = Array.isArray(value) ? value : String(value);
                  }
                }
                navigateToResource.actors({ id: actor.id }, { ...navQuery, tab: String(tab) });
              }}
              onTabChange={(t) => {
                navigateToResource.actors({ id: actor.id }, { tab: String(t) });
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
