import { ActorPageContent } from "@econnessione/ui/components/ActorPageContent";
import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@econnessione/ui/components/Common/FullSizeLoader";
import { MainContent } from "@econnessione/ui/components/MainContent";
import SEO from "@econnessione/ui/components/SEO";
import { Queries } from "@econnessione/ui/providers/DataProvider";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { doUpdateCurrentView } from "../utils/location.utils";
import { DeathBox } from "@containers/DeathBox";
import { EventsNetwork } from "@containers/EventsNetwork";
import InfiniteEventList from "@containers/InfiniteEventList";

interface ActorTemplateProps {
  actorId: string;
}

const ActorTemplate: React.FC<ActorTemplateProps> = ({ actorId }) => {
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
                onGroupClick={(g) =>
                  doUpdateCurrentView({ view: "group", groupId: g.id })()
                }
              />
              {actor.death ? <DeathBox id={actor.death} /> : null}

              <InfiniteEventList
                filters={{
                  actors: [actorId],
                }}
                hash={`actor-${actorId}`}
              />

              <div style={{ padding: 50 }}>
                <EventsNetwork
                  filter={{ actors: [actorId] }}
                  groupBy="actor"
                  scale={"all"}
                  scalePoint={O.none}
                  onEventClick={() => {}}
                />
              </div>
            </MainContent>
          );
        }
      )}
    />
  );
};

export default ActorTemplate;
