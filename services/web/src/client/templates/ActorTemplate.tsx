import { EventType } from "@liexp/shared/io/http/Events";
import { ActorPageContent } from "@liexp/ui/components/ActorPageContent";
import { ErrorBox } from "@liexp/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@liexp/ui/components/Common/FullSizeLoader";
import { MainContent } from "@liexp/ui/components/MainContent";
import SEO from "@liexp/ui/components/SEO";
import ActorsBox from "@liexp/ui/containers/ActorsBox";
import { Queries } from "@liexp/ui/providers/DataProvider";
import { Box } from "@material-ui/core";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import subYears from "date-fns/sub_years";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";
import { DeathBox } from "@containers/DeathBox";
import { EventsPanel } from "@containers/EventsPanel";

const ActorTemplate: React.FC<{ actorId: string }> = ({ actorId }) => {
  const navigateToResource = useNavigateToResource();

  return (
    <WithQueries
      queries={{
        actor: Queries.Actor.get,
        groups: Queries.Group.getList,
      }}
      params={{
        actor: { id: actorId },
        groups: {
          pagination: { perPage: 100, page: 1 },
          sort: { field: "createdAt", order: "DESC" },
          filter: { members: [actorId] },
        },
      }}
      render={QR.fold(
        LazyFullSizeLoader,
        ErrorBox,
        ({ actor, groups: { data: groups } }) => {
          return (
            <Box>
              <MainContent>
                <SEO title={actor.fullName} image={actor.avatar ?? ""} />
                <ActorPageContent
                  actor={actor}
                  groups={groups}
                  onGroupClick={(g) => navigateToResource.groups({ id: g.id })}
                />
                {actor.death ? <DeathBox id={actor.death} /> : null}
              </MainContent>
              <EventsPanel
                hash={`actor-${actorId}`}
                query={{
                  startDate: subYears(new Date(), 1).toDateString(),
                  endDate: new Date().toDateString(),
                  actors: [actorId],
                  groups: [],
                  groupsMembers: [],
                  keywords: [],
                  tab: 0,
                  type: EventType.types.map((t) => t.value),
                }}
                onQueryChange={(q) => {
                  // navigateToResource.actors({ id: actor.id}, q)
                }}
              />
              <ActorsBox
                params={{
                  sort: { field: "updatedAt", order: "DESC" },
                  pagination: {
                    page: 1,
                    perPage: 3,
                  },
                }}
                onItemClick={(a) => {
                  navigateToResource.actors({ id: a.id });
                }}
              />
            </Box>
          );
        }
      )}
    />
  );
};

export default ActorTemplate;
