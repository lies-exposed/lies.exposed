import { MarkdownRenderer } from "@components/Common/MarkdownRenderer";
import SEO from "@components/SEO";
import { Actor, Events, Group } from "@io/http";
import { navigate } from "@reach/router";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import { Slider } from "./Common/Slider/Slider";
import { MainContent } from "./MainContent";
import { ActorList } from "./lists/ActorList";
import GroupList from "./lists/GroupList";

export interface EventPageContentProps {
  event: Events.Uncategorized.Uncategorized;
  actors: Actor.Actor[];
  groups: Group.Group[];
}

export const EventPageContent: React.FC<EventPageContentProps> = ({
  event,
  actors,
  groups,
}) => {
  return (
    <MainContent>
      <SEO title={event.title} />
      <h1>{event.title}</h1>
      <div style={{ height: 600 }}>
        {pipe(
          event.images,
          O.fromPredicate((items) => items.length > 0),
          O.map((images) => (
            <Slider
              key="home-slider"
              slides={images.map((i) => ({
                authorName: "",
                info: i.description,
                imageURL: i.location,
              }))}
              arrows={true}
              // adaptiveHeight={true}
              dots={true}
            />
          )),
          O.toNullable
        )}
      </div>
      {pipe(
        event.groups,
        O.fromPredicate((items) => items.length > 0),
        O.map((ids) => groups.filter((a) => ids.includes(a.id))),
        O.fold(
          () => null,
          (groups) => (
            <div>
              <h4>Groups</h4>
              <GroupList
                groups={groups.map((a) => ({ ...a, selected: true }))}
                onGroupClick={() => {}}
              />
            </div>
          )
        )
      )}
      {pipe(
        event.actors,
        O.fromPredicate((items) => items.length > 0),
        O.map((actorIds) => actors.filter((a) => actorIds.includes(a.id))),
        O.fold(
          () => null,
          (actors) => (
            <div>
              <h4>Actors</h4>
              <ActorList
                actors={actors.map((a) => ({ ...a, selected: true }))}
                onActorClick={async (a) => {
                  await navigate(`/actors/${a.id}`);
                }}
              />
            </div>
          )
        )
      )}
      <MarkdownRenderer>{event.body}</MarkdownRenderer>
    </MainContent>
  );
};
