import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { EventType } from "@liexp/io/lib/http/Events/index.js";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import SEO from "@liexp/ui/lib/components/SEO.js";
import { Box } from "@liexp/ui/lib/components/mui/index.js";
import { type SearchEventsQueryInputNoPagination } from "@liexp/ui/lib/state/queries/SearchEventsQuery.js";
import { ActorTemplate } from "@liexp/ui/lib/templates/ActorTemplate.js";
import { useRouteQuery } from "@liexp/ui/lib/utils/history.utils.js";
import { Schema } from "effect";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils.js";

type RouteQueryValue = string | string[];

const toValues = (v: RouteQueryValue | undefined): readonly string[] =>
  v === undefined ? [] : Array.isArray(v) ? v : [v];

const toString = (v: RouteQueryValue | undefined): string | undefined =>
  typeof v === "string" ? v : Array.isArray(v) ? v[0] : undefined;

const toSearchEventsQueryInput = (
  query: Record<string, RouteQueryValue>,
): SearchEventsQueryInputNoPagination => ({
  actors: toValues(query.actors),
  groups: toValues(query.groups),
  keywords: toValues(query.keywords),
  groupsMembers: toValues(query.groupsMembers),
  media: toValues(query.media),
  locations: toValues(query.locations),
  _sort: toString(query._sort),
  _order:
    toString(query._order) === "ASC" || toString(query._order) === "DESC"
      ? (toString(query._order) as "ASC" | "DESC")
      : undefined,
  startDate: toString(query.startDate),
  endDate: toString(query.endDate),
  eventType: query.eventType
    ? toValues(query.eventType).filter(Schema.is(EventType))
    : EventType.members.map((t) => t.literals[0]),
  q: toString(query.q),
  hash: toString(query.hash) ?? "",
});

const ActorPage: React.FC<{ actorId: UUID }> = ({ actorId }) => {
  // const params = useParams();
  const navigateToResource = useNavigateToResource();
  const { tab: _tab = "0", ...query } = useRouteQuery() as Record<
    string,
    string | string[]
  >;
  const tab =
    typeof _tab === "string"
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
              query={toSearchEventsQueryInput(query)}
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
