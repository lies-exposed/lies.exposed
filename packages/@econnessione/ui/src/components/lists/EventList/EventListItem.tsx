import { Actor, Group, Keyword, Events } from "@econnessione/shared/io/http";
import * as React from "react";
import { DeathListItem } from "./DeathListItem";
import { UncategorizedListItem } from "./UncategorizedListItem";

interface EventListItemProps {
  event: Events.Event;
  actors: Actor.Actor[];
  groups: Group.Group[];
  keywords: Keyword.Keyword[];
  onClick?: (e: Events.Event) => void;
}

export const EventListItem: React.FC<EventListItemProps> = ({
  event: e,
  onClick,
  ...props
}) => {
  if (Events.Death.Death.is(e)) {
    return (
      <DeathListItem
        item={e}
        actors={props.actors}
        keywords={props.keywords}
        links={[]}
      />
    );
  }
  if (Events.Uncategorized.Uncategorized.is(e)) {
    return (
      <UncategorizedListItem
        item={e}
        actors={props.actors}
        groups={props.groups}
        keywords={props.keywords}
        links={e.links}
        onClick={onClick}
      />
    );
  }

  return <span>Not implemented</span>;
};
