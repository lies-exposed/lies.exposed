import { Events } from "@liexp/shared/io/http";
import { GetSearchEventsQueryInput } from "@liexp/shared/io/http/Events/SearchEventsQuery";
import { Typography } from "@mui/material";
import * as React from "react";
import SlickSlider from "react-slick";
import { searchEventsQuery } from "../../state/queries/SearchEventsQuery";
import QueriesRenderer from "../QueriesRenderer";
import { EventListItem } from "../lists/EventList/EventListItem";

export interface EventSliderProps {
  params: GetSearchEventsQueryInput;
  onClick: (e: Events.SearchEvent.SearchEvent) => void;
}

export const EventSlider: React.FC<EventSliderProps> = ({
  params,
  onClick,
}) => {
  return (
    <QueriesRenderer
      queries={{
        events: searchEventsQuery({
          hash: "slider",
          ...(params as any),
        }),
      }}
      render={({ events: { events, totals } }) => {
        return (
          <div>
            <Typography variant="body1">
              Total events: {totals.uncategorized}
            </Typography>
            <SlickSlider
              adaptiveHeight={true}
              infinite={false}
              arrows={true}
              draggable={false}
              dots={true}
            >
              {events.map((e, index) => {
                return (
                  <EventListItem
                    key={e.id}
                    event={e}
                    onClick={onClick}
                    onActorClick={() => {}}
                    onGroupClick={() => {}}
                    onGroupMemberClick={() => {}}
                    onKeywordClick={() => {}}
                    onRowInvalidate={() => {}}
                  />
                );
              })}
            </SlickSlider>
          </div>
        );
      }}
    />
  );
};
