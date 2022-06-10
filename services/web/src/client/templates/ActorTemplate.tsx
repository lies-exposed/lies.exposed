import { EventType } from "@liexp/shared/io/http/Events";
import { ActorPageContent } from "@liexp/ui/components/ActorPageContent";
import { MainContent } from "@liexp/ui/components/MainContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import SEO from "@liexp/ui/components/SEO";
import { Box } from "@liexp/ui/components/mui";
import {
  useActorQuery,
  useGroupsQuery,
} from "@liexp/ui/state/queries/DiscreteQueries";
import { subYears } from "date-fns";
import * as React from "react";
import { useRouteQuery } from "../utils/history.utils";
import { useNavigateToResource } from "../utils/location.utils";
import { EventsPanel } from "@containers/EventsPanel";

const ActorTemplate: React.FC<{ actorId: string }> = ({ actorId }) => {
  // const params = useParams();
  const navigateToResource = useNavigateToResource();
  const { tab = 0 } = useRouteQuery<{ tab?: string }>();

  return (
    <QueriesRenderer
      queries={{
        actor: useActorQuery({ id: actorId }),
        groups: useGroupsQuery({
          pagination: { perPage: 20, page: 1 },
          sort: { field: "createdAt", order: "DESC" },
          filter: { members: [actorId] },
        }),
      }}
      render={({ actor, groups: { data: groups } }) => {
        return (
          <Box>
            <MainContent>
              <SEO
                title={actor.fullName}
                image={actor.avatar ?? ""}
                urlPath={`actors/${actor.id}`}
              />
              <ActorPageContent
                actor={actor}
                groups={groups}
                onGroupClick={(g) => navigateToResource.groups({ id: g.id })}
                onActorClick={(a) => navigateToResource.actors({ id: a.id })}
              />
            </MainContent>
            <EventsPanel
              hash={`actor-${actorId}`}
              keywords={[]}
              actors={[]}
              groups={[]}
              groupsMembers={[]}
              query={{
                startDate: subYears(new Date(), 1).toDateString(),
                endDate: new Date().toDateString(),
                actors: actorId ? [actorId] : [],
                groups: [],
                groupsMembers: [],
                keywords: [],
                tab: typeof tab === "string" ? parseInt(tab, 10) : (tab as any),
                type: EventType.types.map((t) => t.value),
                _sort: "createdAt",
                _order: "DESC",
              }}
              onQueryChange={({ tab }) => {
                navigateToResource.actors({ id: actor.id }, { tab });
              }}
              onQueryClear={() => {}}
            />
          </Box>
        );
      }}
    />
  );
};

export default ActorTemplate;
