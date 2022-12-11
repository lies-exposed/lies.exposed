import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import SEO from "@liexp/ui/components/SEO";
import { Box } from "@liexp/ui/components/mui";
import {
  useActorQuery
} from "@liexp/ui/state/queries/DiscreteQueries";
import {
  ActorTemplate
} from "@liexp/ui/templates/ActorTemplate";
import { useRouteQuery } from "@liexp/ui/utils/history.utils";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const ActorPage: React.FC<{ actorId: string }> = ({ actorId }) => {
  // const params = useParams();
  const navigateToResource = useNavigateToResource();
  const { tab } = useRouteQuery({ tab: 0 });

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
              onTabChange={(t) => {
                navigateToResource.actors({ id: actor.id }, { tab: t });
              }}
              actor={actor}
              onGroupClick={(g) => {
                navigateToResource.groups({ id: g.id });
              }}
              onActorClick={(a) => {
                navigateToResource.actors({ id: a.id });
              }}
              onEventClick={(e) => {
                navigateToResource.events({ id: e.id });
              }}
              onKeywordClick={(k) => {
                navigateToResource.keywords({ id: k.id });
              }}
            />
          </Box>
        );
      }}
    />
  );
};

export default ActorPage;
