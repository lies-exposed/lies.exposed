import { GetSearchEventsQuery } from "@econnessione/shared/io/http/Events/SearchEventsQuery";
import { Typography } from "@material-ui/core";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";
import SlickSlider from "react-slick";
import { serializedType } from "ts-io-error/lib/Codec";
import { searchEventsQuery } from "../../state/queries/SearchEventsQuery";
import { ErrorBox } from "../Common/ErrorBox";
import { LazyLoader } from "../Common/Loader";
import {
  EventListItem,
  SearchEvent
} from "../lists/EventList/EventListItem";

export interface EventSliderProps {
  filter: serializedType<typeof GetSearchEventsQuery>;
  onClick: (e: SearchEvent) => void;
}

export const EventSlider: React.FC<EventSliderProps> = ({
  filter,
  onClick,
}) => {
  return (
    <WithQueries
      queries={{ events: searchEventsQuery }}
      params={{
        events: {
          page: 1,
          hash: 'slider',
          ...filter,
        },
      }}
      render={QR.fold(LazyLoader, ErrorBox, ({ events: { events, totals } }) => {
        return (
          <div>
            <Typography variant="body1">Total events: {totals.uncategorized}</Typography>
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
                  />
                );
              })}
            </SlickSlider>
          </div>
        );
      })}
    />
  );
};
