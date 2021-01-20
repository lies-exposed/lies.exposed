import { Actor, Events } from "@econnessione/shared/lib/io/http";
import { RenderHTML } from "@utils/renderHTML";
import { Block } from "baseui/block";
import { FlexGrid, FlexGridItem } from "baseui/flex-grid";
import { HeadingXLarge, HeadingXSmall } from "baseui/typography";
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
}

export const EventPageContent: React.FC<EventPageContentProps> = ({
  event,
  actors,
}) => {
  return (
    <FlexGrid width="100%">
      <FlexGridItem width="100%">
        <Block overrides={{ Block: { style: { textAlign: "right" } } }}>
          <EditButton resourceName="events" resource={event} />
        </Block>
        <HeadingXLarge>{event.title}</HeadingXLarge>
        <Block>
          {pipe(
            event.images,
            O.map((images) => (
              <Slider
                key="home-slider"
                height={600}
                slides={images.map((i) => ({
                  authorName: "",
                  info: O.getOrElse(() => "")(i.description),
                  imageURL: i.image,
                }))}
                arrows={true}
                adaptiveHeight={true}
                dots={true}
                size="contain"
              />
            )),
            O.toNullable
          )}
        </Block>
        {pipe(
          event.groups,
          O.fold(
            () => null,
            (groups) => (
              <Block>
                <HeadingXSmall>Groups</HeadingXSmall>
                <GroupList
                  groups={groups.map((a) => ({ ...a, selected: true }))}
                  onGroupClick={() => {}}
                  avatarScale="scale1000"
                />
              </Block>
            )
          )
        )}
        {pipe(
          event.actors,
          O.map((actorIds) => actors.filter((a) => actorIds.includes(a.id))),
          O.fold(
            () => null,
            (actors) => (
              <Block>
                <HeadingXSmall>Actors</HeadingXSmall>
                <ActorList
                  actors={actors.map((a) => ({ ...a, selected: true }))}
                  onActorClick={() => {}}
                  avatarScale="scale1000"
                />
              </Block>
            )
          )
        )}
        <div className="content">
          {""}
          {/* <RenderHTML>{event.body}</RenderHTML> */}
        </div>
      </FlexGridItem>
    </FlexGrid>
  );
};
