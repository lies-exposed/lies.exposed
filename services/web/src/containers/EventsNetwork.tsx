import { Queries } from "@econnessione/shared/providers/DataProvider";
import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@econnessione/ui/components/Common/FullSizeLoader";
import {
  EventsNetworkGraph,
  EventsNetworkGraphProps,
} from "@econnessione/ui/components/Graph/EventsNetworkGraph";
import { Events } from "@io/http";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as R from "fp-ts/lib/Record";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";

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
