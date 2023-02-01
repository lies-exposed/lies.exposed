import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import SEO from "@liexp/ui/components/SEO";
import { Box } from "@liexp/ui/components/mui";
import { useActorQuery } from "@liexp/ui/state/queries/actor.queries";
import { ActorTemplate } from "@liexp/ui/templates/ActorTemplate";
import { useRouteQuery } from "@liexp/ui/utils/history.utils";
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
          <Box>
            <SEO
              title={actor.fullName}
              image={actor.avatar ?? ""}
              urlPath={`actors/${actor.id}`}
            />
            <ActorTemplate
              tab={tab}
              query={query}
              onQueryChange={(q) => {
                navigateToResource.actors({ id: actor.id }, { ...q, tab });
              }}
              onTabChange={(t) => {
                navigateToResource.actors({ id: actor.id }, { tab: t });
              }}
              actor={actor}
              onGroupClick={(g) => {
                navigateToResource.actors(
                  { id: actor.id },
                  { ...query, tab: "1", groups: [g.id] }
                );
              }}
              onActorClick={(a) => {
                navigateToResource.actors(
                  { id: actor.id },
                  { ...query, tab: "1", actors: [a.id] }
                );
              }}
              onKeywordClick={(k) => {
                navigateToResource.actors(
                  { id: actor.id },
                  { ...query, tab: "1", keywords: [k.id] }
                );
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
