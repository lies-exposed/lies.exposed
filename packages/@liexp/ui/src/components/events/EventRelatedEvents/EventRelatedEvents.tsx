import { Events } from "@liexp/shared/lib/io/http/index.js";
import { Schema } from "effect";
import * as React from "react";
import EventsBox from "../../../containers/EventsBox.js";
import { Stack } from "../../mui/index.js";

export const EventRelatedEvents: React.FC<{
  event: Events.SearchEvent.SearchEvent;
  relations: Events.EventRelations;
  onEventClick: (e: Events.SearchEvent.SearchEvent) => void;
}> = ({ event, relations, onEventClick }) => {
  const relatedEvents = React.useMemo(() => {
    const commonQuery = {
      _end: 3,
      _order: "DESC" as const,
      _sort: "random",
      exclude: [event.id],
    };

    const commonProps = {
      hideIfEmpty: true,
      columns: { sm: 12, md: 4, lg: 4 },
    };
    const boxes: React.ReactNode[] = [];
    if (Schema.is(Events.EventTypes.DEATH)(event.type)) {
      const e = event as Events.SearchEvent.SearchDeathEvent;
      boxes.push(
        <EventsBox
          {...commonProps}
          key={`actor-${event.id}`}
          title={`Last ${e.payload.victim.fullName} events`}
          query={{
            ...commonQuery,
            actors: relations.actors.map((a) => a.id),
          }}
          onEventClick={onEventClick}
        />,
      );
    }

    if (Schema.is(Events.EventTypes.DOCUMENTARY)(event.type)) {
      boxes.push(
        <EventsBox
          {...commonProps}
          key={`authors-${event.id}`}
          title={`Last authors events`}
          query={{
            ...commonQuery,
            actors: relations.actors.map((a) => a.id),
          }}
          onEventClick={onEventClick}
        />,
      );
    }

    boxes.push(
      <EventsBox
        {...commonProps}
        key={`keywords-${event.id}`}
        title={`Last keywords events`}
        query={{
          ...commonQuery,
          keywords: relations.keywords.map((k) => k.id),
        }}
        onEventClick={onEventClick}
      />,
    );

    return boxes;
  }, [event.id, event.type]);

  return <Stack spacing={2}>{React.Children.toArray(relatedEvents)}</Stack>;
};
