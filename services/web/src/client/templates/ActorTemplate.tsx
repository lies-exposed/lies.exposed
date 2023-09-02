import { EventType } from '@liexp/shared/lib/io/http/Events';
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer";
import SEO from "@liexp/ui/lib/components/SEO";
import { Box } from "@liexp/ui/lib/components/mui";
import { useActorQuery } from "@liexp/ui/lib/state/queries/actor.queries";
import { ActorTemplate } from "@liexp/ui/lib/templates/ActorTemplate";
import { useRouteQuery } from "@liexp/ui/lib/utils/history.utils";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const ActorPage: React.FC<{ actorId: string }> = ({ actorId }) => {
  // const params = useParams();
  const navigateToResource = useNavigateToResource();
  const { tab: _tab = "0", ...query } = useRouteQuery();
  const tab = parseInt(_tab, 10);

  return (
    <QueriesRenderer
      queries={{
        actor: useActorQuery({ id: actorId }),
      }}
      render={({ actor }) => {
        return (
          <Box style={{ height: "100%" }}>
            <SEO
              title={actor.fullName}
              image={actor.avatar ?? ""}
              urlPath={`actors/${actor.id}`}
            />
            <ActorTemplate
              tab={tab}
              query={{
                ...query,
                eventType:
                  query.eventType ?? EventType.types.map((t) => t.value),
              }}
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
