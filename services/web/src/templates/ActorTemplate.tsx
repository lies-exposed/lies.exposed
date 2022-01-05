import { ActorPageContent } from "@econnessione/ui/components/ActorPageContent";
import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@econnessione/ui/components/Common/FullSizeLoader";
import { MainContent } from "@econnessione/ui/components/MainContent";
import SEO from "@econnessione/ui/components/SEO";
import { Queries } from "@econnessione/ui/providers/DataProvider";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";
import { ActorView, doUpdateCurrentView } from "../utils/location.utils";
import { DeathBox } from "@containers/DeathBox";
import { EventsPanel } from "@containers/EventsPanel";

interface ActorTemplateProps extends ActorView {}

const ActorTemplate: React.FC<ActorTemplateProps> = ({ actorId, tab = 0 }) => {
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

              <EventsPanel
                filters={{ actors: [actorId] }}
                hash={`actor-${actorId}`}
                view={{
                  view: "actor",
                  actorId,
                }}
                tab={tab}
                onActorClick={() => {}}
                onGroupClick={() => {}}
                onGroupMemberClick={() => {}}
                onKeywordClick={() => {}}
              />
            </MainContent>
          );
        }
      )}
    />
  );
};

export default ActorTemplate;
