import { LazyFullSizeLoader } from "@components/Common/FullSizeLoader";
import { DeathBox } from "@containers/DeathBox";
import { EventsNetwork } from "@containers/EventsNetwork";
import { ActorPageContent } from "@econnessione/shared/components/ActorPageContent";
import { ErrorBox } from "@econnessione/shared/components/Common/ErrorBox";
import { MainContent } from "@econnessione/shared/components/MainContent";
import SEO from "@econnessione/shared/components/SEO";
import { EventSlider } from "@econnessione/shared/components/sliders/EventSlider";
import { Queries } from "@econnessione/shared/providers/DataProvider";
import { RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React from "react";

export default class ActorTemplate extends React.PureComponent<
  RouteComponentProps<{
    actorId: string;
  }>
> {
  render(): JSX.Element {
    return pipe(
      O.fromNullable(this.props.actorId),
      O.fold(
        () => <div>Missing actor id</div>,
        (actorId) => (
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
                    <ActorPageContent actor={actor} groups={groups} />
                    {actor.death ? <DeathBox id={actor.death} /> : null}
                    <div style={{ padding: 50 }}>
                      <EventSlider filter={{ actors: O.some([actorId]) }} />
                    </div>
                    <div style={{ padding: 50 }}>
                      <EventsNetwork
                        filter={{ actors: O.some([actorId]) }}
                        actors={[actor]}
                        groups={[]}
                        groupBy="actor"
                        selectedActorIds={[actorId]}
                        selectedGroupIds={[]}
                        selectedTopicIds={[]}
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
        )
      )
    );
  }
}
