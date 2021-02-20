import { MarkdownRenderer } from "@components/Common/MarkdownRenderer";
import { Actor, Events, Group } from "@io/http";
import { Grid } from "@material-ui/core";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import { Slider } from "./Common/Slider/Slider";
import EditButton from "./buttons/EditButton";
import ActorList from "./lists/ActorList";
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
    <Grid container>
      <Grid item>
        <div>
          <EditButton resourceName="events" resource={event} />
        </div>
        <h1>{event.title}</h1>
        <div>
          {pipe(
            event.images,
            O.fromPredicate((items) => items.length > 0),
            O.map((images) => (
              <Slider
                key="home-slider"
                height={600}
                slides={images.map((i) => ({
                  authorName: "",
                  info: i.description,
                  imageURL: i.location,
                }))}
                arrows={true}
                adaptiveHeight={true}
                dots={true}
                size="contain"
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
                  avatarScale="scale1000"
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
                  onActorClick={() => {}}
                  avatarScale="scale1000"
                />
              </div>
            )
          )
        )}
        <MarkdownRenderer>{event.body}</MarkdownRenderer>
      </Grid>
    </Grid>
  );
};
