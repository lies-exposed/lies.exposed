import { LazyFullSizeLoader } from "@components/Common/FullSizeLoader";
import {
  EventsNetworkGraph,
  EventsNetworkGraphProps,
} from "@components/Graph/EventsNetworkGraph";
import { ErrorBox } from "@econnessione/shared/components/Common/ErrorBox";
import { Queries } from "@econnessione/shared/providers/DataProvider";
import { Events } from "@io/http";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as R from "fp-ts/lib/Record";
import { pipe } from "fp-ts/lib/pipeable";
import React from "react";

interface EventsNetworkProps extends Omit<EventsNetworkGraphProps, "events"> {
  filter: Events.Uncategorized.GetEventsQueryFilter;
}

export class EventsNetwork extends React.PureComponent<EventsNetworkProps> {
  render(): JSX.Element {
    const { filter: _filter, ...props } = this.props;
    const filter = pipe(_filter, R.compact);
    return (
      <WithQueries
        queries={{ events: Queries.Event.getList }}
        params={{
          events: {
            filter,
            pagination: { page: 1, perPage: 20 },
            sort: { field: "id", order: "DESC" },
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
