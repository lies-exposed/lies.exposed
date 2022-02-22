import { ActorPageContent } from "@econnessione/ui/components/ActorPageContent";
import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@econnessione/ui/components/Common/FullSizeLoader";
import { MainContent } from "@econnessione/ui/components/MainContent";
import SEO from "@econnessione/ui/components/SEO";
import { Queries } from "@econnessione/ui/providers/DataProvider";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import subYears from "date-fns/sub_years";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";
import { DeathBox } from "@containers/DeathBox";
import { EventsPanel } from "@containers/EventsPanel";

const ActorTemplate: React.FC<{ actorId: string }> = ({ actorId }) => {
  const navigateTo = useNavigateToResource();
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
            <MainContent>
              <SEO title={actor.fullName} />
              <ActorPageContent
                actor={actor}
                groups={groups}
                onGroupClick={(g) => navigateTo.groups({ id: g.id })}
              />
              {actor.death ? <DeathBox id={actor.death} /> : null}

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
                }}
                onQueryChange={() => {}}
              />
            </MainContent>
          );
        }
      )}
    />
  );
};

export default ActorTemplate;
