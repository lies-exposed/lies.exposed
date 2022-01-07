import { Events } from "@econnessione/shared/io/http";
import { SearchEventsQuery } from "@econnessione/shared/io/http/Events/SearchEventsQuery";
import { Typography } from "@material-ui/core";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";
import SlickSlider from "react-slick";
import { serializedType } from "ts-io-error/lib/Codec";
import { Queries } from "../../providers/DataProvider";
import { ErrorBox } from "../Common/ErrorBox";
import { LazyLoader } from "../Common/Loader";
import { UncategorizedListItem } from "../lists/EventList/UncategorizedListItem";

export interface EventSliderProps {
  filter: serializedType<typeof SearchEventsQuery>;
  onClick: (e: Events.Event | Events.Event) => void;
}

export const EventSlider: React.FC<EventSliderProps> = ({
  filter,
  onClick,
}) => {
  return (
    <WithQueries
      queries={{ events: Queries.Event.getList }}
      params={{
        events: {
          pagination: { perPage: 20, page: 1 },
          sort: { field: "startDate", order: "DESC" },
          filter,
        },
      }}
      render={QR.fold(LazyLoader, ErrorBox, ({ events: { data, total } }) => {
        return (
          <div>
            <Typography variant="body1">Total events: {total}</Typography>
            <SlickSlider
              adaptiveHeight={true}
              infinite={false}
              arrows={true}
              draggable={false}
              dots={true}
            >
              {data.map((e, index) => {
                if (Events.Uncategorized.Uncategorized.is(e)) {
                  return (
                    <UncategorizedListItem
                      key={e.id}
                      item={e}
                      actors={[]}
                      groups={[]}
                      links={[]}
                      media={[]}
                      keywords={[]}
                      groupsMembers={[]}
                      onClick={onClick}
                    />
                  );
                }

                return <div key={e.id}>Unknown event {JSON.stringify(e)}</div>;
              })}
            </SlickSlider>
          </div>
        );
      })}
    />
  );
};
