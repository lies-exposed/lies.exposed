import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@econnessione/ui/components/Common/FullSizeLoader";
import {
  EventsNetworkGraph,
  EventsNetworkGraphProps,
} from "@econnessione/ui/components/Graph/EventsNetworkGraph";
import { Queries } from "@econnessione/ui/providers/DataProvider";
import { Events } from "@io/http";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as O from "fp-ts/lib/Option";
import * as R from "fp-ts/lib/Record";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";

interface EventsNetworkProps extends Omit<EventsNetworkGraphProps, "events"> {
  filter: Events.Uncategorized.GetEventsQueryFilter;
}

export class EventsNetwork extends React.PureComponent<EventsNetworkProps> {
  render(): JSX.Element {
    const {
      filter: { startDate, endDate, ..._filter },
      ...props
    } = this.props;

    return (
      <WithQueries
        queries={{ events: Queries.Event.getList }}
        params={{
          events: {
            filter: {
              ...R.compact({ ..._filter }),
              startDate: pipe(
                startDate === undefined ? O.none : startDate,
                O.map((d) => d.toISOString()),
                O.toUndefined
              ),
              endDate: pipe(
                endDate === undefined ? O.none : endDate,
                O.map((d) => d.toISOString()),
                O.toUndefined
              ),
            },
            pagination: { page: 1, perPage: 100 },
            sort: { field: "startDate", order: "DESC" },
          },
        }}
        render={QR.fold(LazyFullSizeLoader, ErrorBox, ({ events }) => {
          return (
            <EventsNetworkGraph
              {...props}
              events={events.data.filter(Events.Uncategorized.Uncategorized.is)}
            />
          );
        })}
      />
    );
  }
}
