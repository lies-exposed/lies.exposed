import { ErrorBox } from "@components/Common/ErrorBox";
import { LazyLoader } from "@components/Common/Loader";
import { UncategorizedListItem } from "@components/lists/EventList/UncategorizedListItem";
import { Events } from "@io/http";
import { GetEventsQueryFilter } from "@io/http/Events/Uncategorized";
import { Typography } from "@material-ui/core";
import { Queries } from "@providers/DataProvider";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as R from "fp-ts/lib/Record";
import * as React from "react";
import SlickSlider from "react-slick";

export interface EventSliderProps {
  filter: GetEventsQueryFilter;
}

export const EventSlider: React.FC<EventSliderProps> = (props) => {
  return (
    <WithQueries
      queries={{ events: Queries.Event.getList }}
      params={{
        events: {
          pagination: { perPage: 20, page: 1 },
          sort: { field: "startDate", order: "DESC" },
          filter: R.compact(props.filter),
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
                      topics={[]}
                    />
                  );
                }

                // if (Events.ProjectTransaction.ProjectTransactionMD.is(e)) {
                //   return (
                //     <ProjectTransactionListItem
                //       key={e.frontmatter.id}
                //       index={index}
                //       item={{ ...e.frontmatter, selected: true }}
                //     />
                //   );
                // }

                // if (Events.Protest.ProtestMD.is(e)) {
                //   return <ProtestListItem key={e.id} item={e} />;
                // }

                // return <div key={e.type}>{e.type}</div>;
                return <div>Unknown event {JSON.stringify(e)}</div>;
              })}
            </SlickSlider>
          </div>
        );
      })}
    />
  );
};
